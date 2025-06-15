import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenData } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const decoded = getTokenData(req);
        if (!decoded || !decoded.id || decoded.role !== "OWNER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const skip = parseInt(searchParams.get("skip") || "0", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";

        // Build where clause
        const where: any = {
            isDeleted: false,
            bookings: {
                some: {
                    homestay: {
                        ownerId: decoded.id
                    }
                }
            }
        };

        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { user: { phone: { contains: search, mode: "insensitive" } } },
            ];
        }

        if (status !== "all") {
            where.user = {
                ...where.user,
                status: status
            };
        }

        // Get customers from database
        const customers = await prisma.customer.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                    },
                },
                _count: {
                    select: {
                        bookings: {
                            where: {
                                homestay: {
                                    ownerId: decoded.id
                                }
                            }
                        }
                    }
                }
            },
        });

        // Transform the data to include totalBookings
        const transformedCustomers = customers.map(customer => ({
            ...customer,
            totalBookings: customer._count.bookings
        }));

        // Count total customers for pagination
        const totalCustomers = await prisma.customer.count({ where });
        const hasMore = skip + customers.length < totalCustomers;

        return NextResponse.json({ customers: transformedCustomers, hasMore });
    } catch (error) {
        console.error("Error fetching owner customers:", error);
        return NextResponse.json(
            { error: "Failed to fetch customers" },
            { status: 500 }
        );
    }
} 