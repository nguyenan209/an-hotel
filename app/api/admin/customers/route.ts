import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const {
      search,
      status,
      page = "1",
      limit = "10",
    } = Object.fromEntries(new URL(request.url).searchParams);

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const where: any = {isDeleted: false};

    if (search) {
      where.user = {
        ...where.user,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      };
    }

    if (status && status !== "all") {
      where.user = {
        ...where.user,
        status: status,
      };
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const totalCustomers = await prisma.customer.count({ where });

    return NextResponse.json({
      customers,
      total: totalCustomers,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, status } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    const newCustomer = await prisma.customer.create({
      data: {
        user: {
          create: {
            name,
            email,
            phone,
            status: status || "active",
          },
        },
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}