import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Chuyển đổi từ VND sang USD (tỷ giá ước tính: 1 USD = 24,000 VND)
    // Stripe không hỗ trợ số tiền lớn trong VND, nên chúng ta sẽ sử dụng USD
    const amountInUSD = Math.round((amount / 24000) * 100) / 100;

    // Tạo Payment Intent với Stripe sử dụng USD
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountInUSD * 100), // Chuyển đổi sang cents
      currency: "usd", // Sử dụng USD thay vì VND
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        original_amount_vnd: amount.toString(),
        integration_check: "accept_a_payment",
      },
    });

    // Trả về client secret để sử dụng ở phía client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amountInUSD: amountInUSD,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Error creating payment intent" },
      { status: 500 }
    );
  }
}
