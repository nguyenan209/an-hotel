import { NextRequest, NextResponse } from "next/server";
import { getTokenData } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, ComplaintStatus, ComplaintPriority, ResponderType } from "@prisma/client";

// GET /api/owner/complaints - Get all complaints for owner's homestays
export async function GET(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as ComplaintStatus | undefined;
    const priority = searchParams.get("priority") as ComplaintPriority | undefined;

    const skip = (page - 1) * limit;

    // Get owner's homestay IDs
    const ownerHomestays = await prisma.homestay.findMany({
      where: {
        ownerId: decoded.id,
      },
      select: {
        id: true,
      },
    });

    const homestayIds = ownerHomestays.map((h) => h.id);

    // Build the query
    const where: Prisma.ComplaintWhereInput = {
      AND: [
        {
          booking: {
            homestayId: {
              in: homestayIds,
            },
          },
        },
        search
          ? {
              OR: [
                { subject: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                {
                  customer: {
                    user: {
                      name: { contains: search, mode: Prisma.QueryMode.insensitive },
                    },
                  },
                },
              ],
            }
          : {},
        status ? { status } : {},
        priority ? { priority } : {},
      ],
    };
    console.log(JSON.stringify(where, null, 2));
    // Get complaints with pagination
    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              homestay: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          responses: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ]);

    return NextResponse.json({
      complaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[OWNER_COMPLAINTS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PUT /api/owner/complaints - Update complaint (add response)
export async function PUT(request: NextRequest) {
  try {
    const decoded = getTokenData(request);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { complaintId, response, status } = body;

    if (!complaintId) {
      return NextResponse.json({ error: "Complaint ID is required" }, { status: 400 });
    }

    // Get user info for response
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the complaint belongs to owner's homestay
    const complaint = await prisma.complaint.findFirst({
      where: {
        id: complaintId,
        booking: {
          homestay: {
            ownerId: decoded.id,
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    // Create response and update complaint
    const updatedComplaint = await prisma.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: status || complaint.status,
        responses: response
          ? {
              create: {
                responderType: ResponderType.OWNER,
                responderName: user.name,
                message: response,
              },
            }
          : undefined,
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            homestay: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        responses: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedComplaint);
  } catch (error) {
    console.error("[OWNER_COMPLAINTS_PUT]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 