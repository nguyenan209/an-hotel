import { STRIPE_PAYMENT_INTENT_TYPE } from "@/lib/const";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { PaymentMethod, BookingStatus, PaymentStatus } from "@prisma/client";
import { generateBookingNumber } from "@/lib/utils";
import { getTokenData } from "@/lib/auth";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, metadata } = await request.json();
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    if (!metadata?.cartItemIds || !metadata?.paymentSessionId) {
      return NextResponse.json(
        { error: "Cart items, payment session ID and user ID are required" },
        { status: 400 }
      );
    }

    const { cartItemIds, paymentSessionId } = metadata;
    const userId = decoded.id;

    // Lấy thông tin cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        isDeleted: false,
        id: {
          in: cartItemIds,
        },
      },
      include: {
        homestay: true,
      },
    });

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "No valid cart items found" },
        { status: 400 }
      );
    }

    // Tạo booking data
    const items = cartItems.map((cartItem) => ({
      homestayId: cartItem.homestayId,
      homestay: cartItem.homestay,
      checkIn: cartItem.checkIn,
      checkOut: cartItem.checkOut,
      guests: cartItem.guests,
      nights: cartItem.nights,
      bookingType: cartItem.bookingType,
      note: cartItem.note,
      rooms: cartItem.rooms,
      totalPrice: amount,
    }));

    const bookingData = {
      totalAmount: amount,
      currency: "VND",
      items,
      status: BookingStatus.PENDING,
    };

    // Tạo booking number
    const bookingNumber = generateBookingNumber(bookingData);

    // Chuyển đổi từ VND sang USD (tỷ giá ước tính: 1 USD = 24,000 VND)
    const amountInUSD = Math.round((amount / 24000) * 100) / 100;

    // Tạo Payment Intent với Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountInUSD * 100), // Chuyển đổi sang cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        original_amount_vnd: amount.toString(),
        integration_check: "accept_a_payment",
        type: STRIPE_PAYMENT_INTENT_TYPE,
        bookingNumber,
        cartItemIds: JSON.stringify(cartItemIds),
        paymentSessionId,
        userId,
      },
    });

    // Find or create payment session
    const existingSession = await prisma.paymentSession.findUnique({
      where: { sessionId: paymentSessionId },
    });

    if (existingSession) {
      // Update existing session
      await prisma.paymentSession.update({
        where: { sessionId: paymentSessionId },
        data: {
          status: "PENDING",
          payload: {
            cartItemIds,
            totalAmount: amount,
            bookingNumber,
            paymentIntentId: paymentIntent.id,
          },
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new session
      await prisma.paymentSession.create({
        data: {
          sessionId: paymentSessionId,
          userId,
          status: "PENDING",
          payload: {
            cartItemIds,
            totalAmount: amount,
            bookingNumber,
            paymentIntentId: paymentIntent.id,
          },
        },
      });
    }

    // Trả về client secret và thông tin cần thiết
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amountInUSD: amountInUSD,
      bookingNumber,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Error creating payment intent" },
      { status: 500 }
    );
  }
}
