import { NextResponse } from "next/server";
import { getRooms, getRoomsByHomestayId } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const homestayId = searchParams.get("homestayId");

    if (homestayId) {
      const rooms = await getRoomsByHomestayId(homestayId);
      return NextResponse.json(rooms);
    } else {
      const rooms = await getRooms();
      return NextResponse.json(rooms);
    }
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
