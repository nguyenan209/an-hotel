import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil", // Sử dụng phiên bản Stripe API phù hợp
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Kiểm tra dữ liệu đầu vào
    if (!body.amount || !body.currency || !body.successUrl || !body.cancelUrl) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: amount, currency, successUrl, cancelUrl",
        },
        { status: 400 }
      );
    }

    // Tạo phiên thanh toán (checkout session)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Các phương thức thanh toán
      line_items: [
        {
          price_data: {
            currency: body.currency, // Ví dụ: 'usd'
            product_data: {
              name: "Thanh toán đặt phòng Homestay",
            },
            unit_amount: body.amount, // Số tiền (đơn vị: cents nếu là USD)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: body.successUrl, // URL khi thanh toán thành công
      cancel_url: body.cancelUrl, // URL khi hủy thanh toán
    });

    // Trả về URL của phiên thanh toán
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
