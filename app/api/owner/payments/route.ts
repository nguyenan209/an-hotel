import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const tokenData = await getTokenData(req);
    if (!tokenData || tokenData.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") as PaymentStatus | undefined;
    const method = searchParams.get("method") as PaymentMethod | undefined;
    const search = searchParams.get("search") || "";

    const where = {
      booking: {
        homestay: {
          ownerId: tokenData.id
        }
      },
      ...(status && { status }),
      ...(method && { method }),
      ...(search && {
        transactionId: { contains: search }
      })
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            select: {
              customer: {
                select: {
                  user: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              },
              homestay: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          id: "desc"
        },
        skip,
        take: limit + 1
      }),
      prisma.payment.count({ where })
    ]);

    const hasMore = payments.length > limit;
    const paginatedPayments = payments.slice(0, limit);

    return NextResponse.json({
      payments: paginatedPayments,
      hasMore
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 