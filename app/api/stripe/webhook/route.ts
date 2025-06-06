import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { HostPaymentStatus } from "@prisma/client";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET || ""
    );
    console.log("event", event);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent was successful!", paymentIntent);
      break;
    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object;
      console.log("PaymentIntent failed.", failedPaymentIntent);
      break;

    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const email =
        session.customer_email ||
        (session.customer_details && session.customer_details.email);

      if (!email) {
        console.error("No email found in checkout.session.completed event");
        break;
      }

      await prisma.hostRegistration.update({
        where: { email: email, paymentStatus: HostPaymentStatus.PENDING },
        data: { paymentStatus: HostPaymentStatus.PAID },
      });

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
