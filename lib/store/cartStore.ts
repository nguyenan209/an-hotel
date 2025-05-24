import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";
import { BookingType, Homestay, Room } from "@prisma/client";

interface CartState {
  items: CartItem[];
  notes: string;
  addWholeHomestayToCart: (
    homestay: Homestay,
    checkIn: string,
    checkOut: string,
    guests: number
  ) => void;
  addRoomsToCart: (
    homestay: Homestay,
    rooms: Room[],
    checkIn: string,
    checkOut: string,
    guests: number
  ) => void;
  removeFromCart: (homestayId: string) => void;
  clearCart: () => void;
  setNotes: (notes: string) => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      notes: "",

      addWholeHomestayToCart: (homestay, checkIn, checkOut, guests) => {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.homestayId === homestay.id && item.bookingType === BookingType.WHOLE
          );

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              checkIn,
              checkOut,
              guests,
              nights,
            };
            return { items: updatedItems };
          } else {
            // Add new item
            return {
              items: [
                ...state.items,
                {
                  homestayId: homestay.id,
                  homestay,
                  checkIn,
                  checkOut,
                  guests,
                  nights,
                  bookingType: BookingType.WHOLE,
                },
              ],
            };
          }
        });
      },

      addRoomsToCart: (homestay, rooms, checkIn, checkOut, guests) => {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        set((state) => {
          // Check if item already exists
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.homestayId === homestay.id && item.bookingType === BookingType.ROOMS
          );

          const roomsData = rooms.map((room) => ({
            roomId: room.id,
            roomName: room.name,
            price: room.price,
          }));

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              checkIn,
              checkOut,
              guests,
              nights,
              rooms: roomsData,
            };
            return { items: updatedItems };
          } else {
            // Add new item
            return {
              items: [
                ...state.items,
                {
                  homestayId: homestay.id,
                  homestay,
                  checkIn,
                  checkOut,
                  guests,
                  nights,
                  bookingType: BookingType.ROOMS,
                  rooms: roomsData,
                },
              ],
            };
          }
        });
      },

      removeFromCart: (homestayId) => {
        set((state) => ({
          items: state.items.filter((item) => item.homestayId !== homestayId),
        }));
      },

      setNotes: (notes) => set({ notes }),

      clearCart: () => set({ items: [], notes: "" }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          if (item.bookingType === BookingType.WHOLE) {
            return total + item.homestay.price * item.nights;
          } else {
            // Sum up the prices of all rooms
            const roomsTotal =
              item.rooms?.reduce((sum, room) => sum + room.price, 0) || 0;
            return total + roomsTotal * item.nights;
          }
        }, 0);
      },

      getItemCount: () => get().items.length,
    }),
    {
      name: "cart-storage",
    }
  )
);
