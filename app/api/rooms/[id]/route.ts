import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        homestay: {
          select: { id: true, name: true },
        },
        beds: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      capacity,
      status,
      amenities,
      bedTypes,
      images,
      homestayId,
    } = body;

    // Chuẩn hóa dữ liệu images (lọc bỏ undefined)
    const imageUrls = images.filter(
      (image: string | undefined) => image !== undefined
    );

    const updatedRoom = await prisma.room.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        capacity,
        status,
        amenities,
        homestay: { connect: { id: homestayId } },
        beds: {
          deleteMany: {},
          create: bedTypes.map((bed: { type: string; count: number }) => ({
            type: bed.type,
            count: bed.count,
          })),
        },
        images: imageUrls,
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // Lấy `id` từ `params`

    // Xóa các `Bed` liên kết trước khi xóa `Room`
    await prisma.bed.deleteMany({
      where: { roomId: id },
    });

    // Xóa `Room`
    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
