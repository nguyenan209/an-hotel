import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { fullName, email, phone, homestayAddress, experience } = body

        // Validate required fields
        if (!fullName || !email || !phone || !homestayAddress) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Check if email already exists in registrations
        const existingRegistration = await prisma.hostRegistration.findFirst({
            where: { email }
        })

        if (existingRegistration) {
            //:TODO
            return NextResponse.json({
                success: true,
                registrationId: existingRegistration.id,
                message: "Basic information saved successfully",
            })
            return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        }

        // Create new registration
        const newRegistration = await prisma.hostRegistration.create({
            data: {
                fullName,
                email,
                phone,
                homestayAddress,
                experience,
                registrationStep: "INFO",
                paymentStatus: "PENDING",
                setupFeeAmount: 0,
                packageType: "BASIC",
            }
        })

        return NextResponse.json({
            success: true,
            registrationId: newRegistration.id,
            message: "Basic information saved successfully",
        })
    } catch (error) {
        console.error("Error in step1 registration:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
