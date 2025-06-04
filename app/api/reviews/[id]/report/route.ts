import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma client
import { getTokenData } from "@/lib/auth"; // Function to get user info from token

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Get review ID from dynamic route
    const body = await request.json();
    const { reason, details } = body;

    if (!id || !reason) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get user info from token
    const decoded = getTokenData(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = decoded.id;

    // Check if a report already exists for this user and review
    const existingReport = await prisma.reviewReport.findUnique({
      where: {
        reviewId_userId: {
          reviewId: id,
          userId: userId,
        },
      },
    });

    if (existingReport) {
      // Update the existing report
      const updatedReport = await prisma.reviewReport.update({
        where: {
          reviewId_userId: {
            reviewId: id,
            userId: userId,
          },
        },
        data: {
          reason,
          details,
          status: "PENDING",
          isDeleted: false,
          resolvedAt: null,
        },
      });

      return NextResponse.json({ report: updatedReport });
    } else {
      // Create a new report
      const newReport = await prisma.reviewReport.create({
        data: {
          reviewId: id,
          userId: userId,
          reason,
          details,
        },
      });

      // Increment the report count for the review
      await prisma.review.update({
        where: { id },
        data: {
          reportCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ report: newReport });
    }
  } catch (error) {
    console.error("Error creating/updating report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
