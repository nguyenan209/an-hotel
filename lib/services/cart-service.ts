import { CartItem } from "../types";

export const cartAPI = {
  async getCart(customerId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${customerId}`);
    if (!response.ok) throw new Error("Failed to fetch cart");
    return response.json();
  },

  async addToCart(customerId: string, item: CartItem) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${customerId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      }
    );
    if (!response.ok) throw new Error("Failed to add item to cart");
  },

  async removeFromCart(customerId: string, homestayId: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${customerId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homestayId }),
      }
    );
    if (!response.ok) throw new Error("Failed to remove item from cart");
  },

  async updateItemNote(customerId: string, homestayId: string, note: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${customerId}/note`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homestayId, note }),
      }
    );
    if (!response.ok) throw new Error("Failed to update item note");
  },

  async clearCart(customerId: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${customerId}/clear`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to clear cart");
  },
};
