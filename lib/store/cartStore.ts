import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BookingType, CartItem, Homestay, Room } from "@prisma/client";
import { cartAPI } from "../services/cart-service";

interface CartState {
  items: Partial<CartItem>[]; // Sử dụng CartItem từ Prisma
  isLoading: boolean;
  isLoggedIn: boolean;
  customerId: string | null;
  addWholeHomestayToCart: (
    homestay: Homestay,
    checkIn: string,
    checkOut: string,
    guests: number
  ) => Promise<void>;
  addRoomsToCart: (
    homestay: Homestay,
    rooms: Room[],
    checkIn: string,
    checkOut: string,
    guests: number
  ) => Promise<void>;
  removeFromCart: (homestayId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
  updateItemNote: (homestayId: string, note: string) => Promise<void>;
  setAuthState: (isLoggedIn: boolean, customerId: string | null) => void;
  syncCartWithServer: () => Promise<void>;
  loadCartFromServer: () => Promise<void>;
  setItems: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isLoggedIn: false,
      customerId: null,

      setAuthState: (isLoggedIn, customerId) => {
        set({ isLoggedIn, customerId });
        if (isLoggedIn && customerId) {
          get().syncCartWithServer();
        }
      },

      syncCartWithServer: async () => {
        const { items, isLoggedIn, customerId } = get();
        if (!isLoggedIn || !customerId || items.length === 0) return;

        set({ isLoading: true });
        try {
          for (const item of items) {
            await cartAPI.addToCart(customerId, item);
          }
          set({ items: [] });
          await get().loadCartFromServer();
        } catch (error) {
          console.error("Failed to sync cart with server:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadCartFromServer: async () => {
        const { isLoggedIn, customerId } = get();
        if (!isLoggedIn || !customerId) return;

        set({ isLoading: true });
        try {
          const serverCart = await cartAPI.getCart(customerId);
          const parsedItems = serverCart.items.map((item: any) => ({
            ...item,
            rooms: item.rooms ? JSON.parse(item.rooms) : null, // Parse JSON
          }));
          set({ items: parsedItems });
        } catch (error) {
          console.error("Failed to load cart from server:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addWholeHomestayToCart: async (homestay, checkIn, checkOut, guests) => {
        const { isLoggedIn, customerId } = get();
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const newItem: Partial<CartItem> = {
          homestayId: homestay.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
          nights,
          bookingType: BookingType.WHOLE,
          rooms: [],
          totalPrice: homestay.price * nights,
        };

        if (isLoggedIn && customerId) {
          set({ isLoading: true });
          try {
            await cartAPI.addToCart(customerId, newItem);
            await get().loadCartFromServer();
          } catch (error) {
            console.error("Failed to add to cart on server:", error);
          } finally {
            set({ isLoading: false });
          }
        } else {
          set((state) => ({
            items: [...state.items, newItem],
          }));
        }
      },

      addRoomsToCart: async (homestay, rooms, checkIn, checkOut, guests) => {
        const { isLoggedIn, customerId } = get();
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const roomsData = rooms.map((room) => ({
          roomId: room.id,
          roomName: room.name,
          price: room.price,
        }));

        const newItem: Partial<CartItem> = {

          homestayId: homestay.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
          nights,
          bookingType: BookingType.ROOMS,
          rooms: JSON.stringify(roomsData),
          totalPrice:
            roomsData.reduce((sum, room) => sum + room.price, 0) * nights,
        };

        if (isLoggedIn && customerId) {
          set({ isLoading: true });
          try {
            await cartAPI.addToCart(customerId, newItem);
            await get().loadCartFromServer();
          } catch (error) {
            console.error("Failed to add to cart on server:", error);
          } finally {
            set({ isLoading: false });
          }
        } else {
          set((state) => ({
            items: [...state.items, newItem],
          }));
        }
      },

      removeFromCart: async (homestayId) => {
        const { isLoggedIn, customerId } = get();

        if (isLoggedIn && customerId) {
          set({ isLoading: true });
          try {
            await cartAPI.removeFromCart(customerId, homestayId);
            await get().loadCartFromServer();
          } catch (error) {
            console.error("Failed to remove from cart on server:", error);
            set((state) => ({
              items: state.items.filter(
                (item) => item.homestayId !== homestayId
              ),
            }));
          } finally {
            set({ isLoading: false });
          }
        } else {
          set((state) => ({
            items: state.items.filter((item) => item.homestayId !== homestayId),
          }));
        }
      },

      clearCart: async () => {
        const { isLoggedIn, customerId } = get();

        if (isLoggedIn && customerId) {
          set({ isLoading: true });
          try {
            await cartAPI.clearCart(customerId);
            set({ items: [] });
          } catch (error) {
            console.error("Failed to clear cart on server:", error);
            set({ items: [] });
          } finally {
            set({ isLoading: false });
          }
        } else {
          set({ items: [] });
        }
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item: Partial<CartItem>) => {
          if (item.bookingType === BookingType.WHOLE) return total + (item.totalPrice || 0);
          const roomsArray = typeof item.rooms === "string" ? JSON.parse(item.rooms) : item.rooms;
          const roomsTotal = Array.isArray(roomsArray)
            ? roomsArray.reduce((sum, room) => sum + (room.price || 0), 0)
            : 0;
          return total + roomsTotal * (item.nights || 1);
        }, 0);
      },

      getItemCount: () => get().items.length,
      updateItemNote: async (homestayId, note) => {
        const { isLoggedIn, customerId } = get();

        if (isLoggedIn && customerId) {
          set({ isLoading: true });
          try {
            await cartAPI.updateItemNote(customerId, homestayId, note);
            await get().loadCartFromServer();
          } catch (error) {
            console.error("Failed to update note on server:", error);
            set((state) => ({
              items: state.items.map((item) =>
                item.homestayId === homestayId ? { ...item, note } : item
              ),
            }));
          } finally {
            set({ isLoading: false });
          }
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.homestayId === homestayId ? { ...item, note } : item
            ),
          }));
        }
      },
      setItems: () => {
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          const parsedItems = JSON.parse(localCart);
          set({ items: parsedItems });
        } else {
          set({ items: [] }); // Nếu không có dữ liệu trong localStorage, đặt items là mảng rỗng
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.isLoggedIn ? [] : state.items,
      }),
    }
  )
);
