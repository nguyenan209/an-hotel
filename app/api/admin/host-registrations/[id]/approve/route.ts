import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/services/email-service"
import { hashPassword } from "@/lib/auth"
import { HostRegistrationStep, UserRole, UserStatus } from "@prisma/client"
import prisma from "@/lib/prisma";

// Generate random password
function generatePassword(length = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        // Find registration
        const registration = await prisma.hostRegistration.findUnique({
            where: { id }
        })

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        if (registration.registrationStep !== HostRegistrationStep.VERIFICATION) {
            return NextResponse.json({ error: "Registration not ready for approval" }, { status: 400 })
        }

        // Generate password for new owner account
        const password = generatePassword()
        const hashedPassword = await hashPassword(password)

        // Create owner account in database
        const owner = await prisma.user.create({
            data: {
                email: registration.email,
                name: registration.fullName,
                password: hashedPassword,
                phone: registration.phone,
                role: UserRole.OWNER,
                status: UserStatus.ACTIVE,
                provider: "credentials",
            }
        })

        // Update registration status
        await prisma.hostRegistration.update({
            where: { id },
            data: {
                registrationStep: HostRegistrationStep.APPROVED,
                approvedAt: new Date(),
                updatedAt: new Date(),
                userId: owner.id
            }
        })

        // Send approval email with login credentials
        const emailSent = await EmailService.sendHostApprovalEmail(
            registration.email,
            registration.fullName,
            registration.email, // username is email
            password,
        )

        if (!emailSent) {
            console.warn("Failed to send approval email")
        }

        return NextResponse.json({
            success: true,
            message: "Host approved successfully",
            data: {
                id: registration.id,
                status: HostRegistrationStep.APPROVED,
                approvedAt: new Date(),
                credentials: {
                    username: registration.email,
                    password: password, // In real app, don't return password
                },
            },
        })
    } catch (error) {
        console.error("Error approving host:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}