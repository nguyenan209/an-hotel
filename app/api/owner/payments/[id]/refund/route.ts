import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { PaymentStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenData = await getTokenData(req);
    if (!tokenData || tokenData.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          select: {
            homestay: {
              select: {
                ownerId: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.booking.homestay.ownerId !== tokenData.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (payment.status !== PaymentStatus.PAID) {
      return NextResponse.json(
        { error: "Only paid payments can be refunded" },
        { status: 400 }
      );
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status: PaymentStatus.REFUNDED
      }
    });

    return NextResponse.json({
      message: "Refund processed successfully",
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 