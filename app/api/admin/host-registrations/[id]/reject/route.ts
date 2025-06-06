import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/services/email-service"
import { HostRegistrationStep } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { reason } = await request.json()

        if (!reason) {
            return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
        }

        // Find registration
        const registration = await prisma.hostRegistration.findUnique({
            where: { id }
        })

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        if (registration.registrationStep !== HostRegistrationStep.VERIFICATION) {
            return NextResponse.json({ error: "Registration not ready for rejection" }, { status: 400 })
        }

        // Update registration status
        await prisma.hostRegistration.update({
            where: { id },
            data: {
                registrationStep: HostRegistrationStep.REJECTED,
                rejectedReason: reason,
                updatedAt: new Date()
            }
        })

        // Send rejection email
        const emailSent = await EmailService.sendHostRejectionEmail(
            registration.email,
            registration.fullName,
            reason
        )

        if (!emailSent) {
            console.warn("Failed to send rejection email")
        }

        return NextResponse.json({
            success: true,
            message: "Host registration rejected successfully",
            data: {
                id: registration.id,
                status: HostRegistrationStep.REJECTED,
                rejectedReason: reason,
                updatedAt: new Date()
            }
        })
    } catch (error) {
        console.error("Error rejecting host:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}