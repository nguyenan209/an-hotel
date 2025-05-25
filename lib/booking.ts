import { FetchBookingsParams } from "./types";

export async function fetchBookings({
  search,
  status,
  bookingType,
  skip,
  limit,
}: FetchBookingsParams) {
  const params = new URLSearchParams({
    search: search || "",
    status: status || "all",
    bookingType: bookingType || "all",
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`/api/admin/bookings?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  return response.json();
}
