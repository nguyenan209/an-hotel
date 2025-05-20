import { NextResponse } from "next/server";
import { geocode } from "opencage-api-client";

// Lấy API Key từ biến môi trường
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

if (!OPENCAGE_API_KEY) {
  throw new Error("OPENCAGE_API_KEY is not defined in .env file");
}

// POST: Geocoding (Chuyển địa chỉ thành tọa độ lat/long) qua request body
export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Gọi OpenCageData API để geocoding
    const response = await geocode({
      q: address,
      key: OPENCAGE_API_KEY,
      limit: 1,
      countrycode: "VN", // Giới hạn ở Việt Nam
    });

    const result = response.results[0];
    if (!result) {
      return NextResponse.json(
        { error: "No coordinates found for the provided address" },
        { status: 404 }
      );
    }

    const { lat, lng } = result.geometry;
    const formattedAddress = result.formatted;

    return NextResponse.json(
      {
        address: formattedAddress,
        location: [lat, lng],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in geocoding:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}

// GET: Geocoding (Chuyển địa chỉ thành tọa độ lat/long) qua query parameter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Gọi OpenCageData API để geocoding
    const response = await geocode({
      q: address,
      key: OPENCAGE_API_KEY,
      limit: 1,
      countrycode: "VN", // Giới hạn ở Việt Nam
    });

    const result = response.results[0];
    if (!result) {
      return NextResponse.json(
        { error: "No coordinates found for the provided address" },
        { status: 404 }
      );
    }

    const { lat, lng } = result.geometry;
    const formattedAddress = result.formatted;

    return NextResponse.json(
      {
        address: formattedAddress,
        location: [lat, lng],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in geocoding:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
