import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = getTokenData(req);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: params.id,
        bookings: {
          some: {
            homestay: {
              ownerId: decoded.id
            }
          }
        }
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            status: true,
            avatar: true,
          },
        },
        bookings: {
          where: {
            homestay: {
              ownerId: decoded.id
            }
          },
          select: {
            id: true,
            bookingNumber: true,
            totalPrice: true,
            status: true,
            checkIn: true,
            checkOut: true,
            createdAt: true,
            homestay: {
              select: {
                name: true,
                images: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    // Transform the data to include homestayName and homestayImage
    const transformedCustomer = {
      ...customer,
      bookings: customer.bookings.map(booking => ({
        ...booking,
        homestayName: booking.homestay.name,
        homestayImage: booking.homestay.images[0],
        homestay: undefined
      }))
    };

    return NextResponse.json(transformedCustomer);
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const decoded = getTokenData(req);
    if (!decoded || !decoded.id || decoded.role !== "OWNER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address, status } = body;

    // Check if customer exists and belongs to owner's homestays
    const customer = await prisma.customer.findUnique({
      where: {
        id,
        bookings: {
          some: {
            homestay: {
              ownerId: decoded.id
            }
          }
        }
      },
      select: {
        userId: true
      }
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    // Update user information
    await prisma.user.update({
      where: {
        id: customer.userId
      },
      data: {
        name,
        phone,
        address,
        status
      }
    });

    return NextResponse.json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: {
            homestay: {
              ownerId: tokenData.id
            }
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (customer.bookings.length === 0) {
      return NextResponse.json(
        { error: "Customer not found in your homestays" },
        { status: 404 }
      );
    }

    // Update customer status to deleted
    await prisma.customer.update({
      where: { id: params.id },
      data: { isDeleted: true }
    });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 