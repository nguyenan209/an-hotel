import { NextResponse } from "next/server"
import { getHomestayById } from "@/lib/data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const homestay = await getHomestayById(params.id)

    if (!homestay) {
      return new NextResponse(JSON.stringify({ error: "Homestay not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    return NextResponse.json(homestay)
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
