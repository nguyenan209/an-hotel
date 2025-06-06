import { type NextRequest, NextResponse } from "next/server"
import { hostRegistrations, hostPayments } from "@/lib/mock-data/host-registrations"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { paymentIntentId, registrationId, paymentId, cardData } = body

        console.log("Confirm payment request:", { paymentIntentId, registrationId, paymentId })

        // Find payment record by registrationId instead of paymentIntentId
        const payment = hostPayments.find((p) => p.registrationId === registrationId)
        if (!payment) {
            console.log(
                "Available payments:",
                hostPayments.map((p) => ({ id: p.id, registrationId: p.registrationId })),
            )
            return NextResponse.json({ error: "Payment not found" }, { status: 404 })
        }

        // Find registration
        const registration = hostRegistrations.find((reg) => reg.id === registrationId)
        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        // Update payment status
        payment.status = "succeeded"
        payment.paymentIntentId = paymentIntentId
        payment.metadata = {
            ...payment.metadata,
            cardLast4: cardData?.last4,
            cardBrand: cardData?.brand,
            confirmedAt: new Date().toISOString(),
        }

        // Update registration status
        registration.registrationStep = "verification"
        registration.paymentStatus = "paid"
        registration.updatedAt = new Date().toISOString()

        return NextResponse.json({
            success: true,
            message: "Payment confirmed successfully",
            registration: {
                id: registration.id,
                step: registration.registrationStep,
                paymentStatus: registration.paymentStatus,
            },
        })
    } catch (error) {
        console.error("Error confirming payment:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
