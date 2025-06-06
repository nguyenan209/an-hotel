import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

export async function POST(request: NextRequest) {
    try {
        const { registrationId } = await request.json();

        const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

        if (!priceId || !baseUrl) {
            return NextResponse.json({ error: "Stripe price id or base url not configured" }, { status: 500 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${baseUrl}/host/register?success=1&registrationId=${registrationId}`,
            cancel_url: `${baseUrl}/host/register?canceled=1`,
            metadata: {
                registrationId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}