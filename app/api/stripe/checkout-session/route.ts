// /api/create-checkout-session.ts (Next.js)
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // hoặc thêm 'alipay', 'wechat_pay' nếu có
    line_items: [
      {
        price_data: {
          currency: "vnd",
          product_data: {
            name: "Thanh toán đặt phòng Homestay",
          },
          unit_amount: 19200000, // đơn vị: VND * 1000 vì Stripe không hỗ trợ VND nên có thể cần dùng USD để demo
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.headers.origin}/payment-success`,
    cancel_url: `${req.headers.origin}/payment-cancel`,
  });

  res.status(200).json({ url: session.url });
}
