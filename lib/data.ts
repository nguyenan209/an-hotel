import type { SearchParams } from "./types";
import homestaysData from "./mock-data/homestays.json";
import roomsData from "./mock-data/rooms.json";
import usersData from "./mock-data/users.json";
import { Homestay, Room, RoomStatus, User } from "@prisma/client";

export async function getHomestays(): Promise<any[]> {
  return homestaysData;
}

export async function getFeaturedHomestays(): Promise<Homestay[]> {
  const homestays = await getHomestays();
  return homestays.filter((homestay) => homestay.featured);
}

export async function getHomestayById(
  id: string
): Promise<Homestay | undefined> {
  const homestays = await getHomestays();
  return homestays.find((homestay) => homestay.id === id);
}

export const getRooms = async (
  params: {
    search?: string;
    status?: string;
    homestayId?: string;
    skip?: number;
    limit?: number;
  } = {}
): Promise<{ rooms: Room[]; totalItems: number; hasMore: boolean }> => {
  const {
    search = "",
    status = "all",
    homestayId = "all",
    skip = 0,
    limit = 10,
  } = params;

  try {
    const response = await fetch(
      `/api/rooms?search=${encodeURIComponent(search)}&status=${status}&homestayId=${homestayId}&skip=${skip}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch rooms");
    }

    const data = await response.json();
    return data as { rooms: Room[]; totalItems: number; hasMore: boolean };
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return { rooms: [], totalItems: 0, hasMore: false };
  }
};

export async function getRoomsByHomestayId(
  homestayId: string
): Promise<Room[]> {
  const rooms = await getRooms();
  return rooms.rooms.filter((room) => room.homestayId === homestayId);
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  const rooms = await getRooms();
  return rooms.rooms.find((room) => room.id === id);
}

export async function getAvailableRoomsByHomestayId(
  homestayId: string,
  checkIn: string,
  checkOut: string
): Promise<Room[]> {
  // In a real app, you would check against bookings
  const rooms = await getRoomsByHomestayId(homestayId);
  return rooms.filter((room) => room.status === RoomStatus.AVAILABLE);
}

export async function searchHomestays(
  params: SearchParams
): Promise<Homestay[]> {
  const homestays = await getHomestays();

  return homestays.filter((homestay) => {
    // Filter by location
    if (
      params.location &&
      !homestay.location.toLowerCase().includes(params.location.toLowerCase())
    ) {
      return false;
    }

    // Filter by price range
    if (params.minPrice && homestay.price < params.minPrice) {
      return false;
    }
    if (params.maxPrice && homestay.price > params.maxPrice) {
      return false;
    }

    // Filter by rating
    if (params.rating && homestay.rating < params.rating) {
      return false;
    }

    // Filter by amenities
    if (params.amenities && params.amenities.length > 0) {
      const hasAllAmenities = params.amenities.every((amenity) =>
        homestay.amenities.includes(amenity)
      );
      if (!hasAllAmenities) {
        return false;
      }
    }

    // Filter by rooms needed
    if (params.roomsNeeded && params.roomsNeeded > 0) {
      // Only include homestays that allow partial booking and have enough rooms
      if (
        !homestay.allowsPartialBooking ||
        homestay.totalRooms < params.roomsNeeded
      ) {
        return false;
      }
    }

    return true;
  });
}

export async function getUsers(): Promise<User[]> {
  return usersData as User[];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((user) => user.email === email);
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}
