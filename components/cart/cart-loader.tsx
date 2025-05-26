"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuth } from "@/context/AuthContext";

export function CartLoader() {
  const { isLoggedIn } = useAuth();
  const { loadCartFromServer, setItems } = useCartStore();

  useEffect(() => {
    if (isLoggedIn) {
      loadCartFromServer();
    } else {
      setItems();
    }
  }, [isLoggedIn, loadCartFromServer, setItems]);

  return null; // Không cần render gì cả
}
