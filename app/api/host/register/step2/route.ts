import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { registrationId, amount = 500000, paymentMethod = "CREDIT_CARD" } = body

        // Kiểm tra registration tồn tại
        const registration = await prisma.hostRegistration.findUnique({
            where: { id: registrationId }
        })
        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 })
        }

        // Tạo payment intent với Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Số tiền theo VND
            currency: "vnd",
            payment_method_types: ["card"],
            metadata: {
                registrationId,
                setupFee: "true",
                description: "Host registration setup fee",
            },
        })

        // Tạo payment record trong database
        const payment = await prisma.hostPayment.create({
            data: {
                registrationId,
                amount,
                currency: "VND",
                paymentMethod,
                status: "PENDING",
                paymentIntentId: paymentIntent.id,
                metadata: {
                    setupFee: "true",
                    description: "Host registration setup fee",
                },
            }
        })

        // Cập nhật registration
        await prisma.hostRegistration.update({
            where: { id: registrationId },
            data: {
                setupFeeAmount: amount,
                registrationStep: "PAYMENT",
                paymentMethod,
                packageType: "STANDARD",
                updatedAt: new Date(),
            }
        })

        // Tính toán số tiền USD để hiển thị (tỷ giá giả định 1 USD = 24,000 VND)
        const amountInUSD = amount / 24000

        return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amountInUSD,
            amount,
            currency: "VND",
            message: "Payment intent created successfully",
        })
    } catch (error) {
        console.error("Error in step2 registration:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}