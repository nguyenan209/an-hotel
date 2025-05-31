"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useCartStore } from "@/lib/store/cartStore";
import { Token } from "@/lib/types";

interface AuthContextType {
  user: Token | null;
  login: (user: Token, token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  customerId: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Token | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const setAuthState = useCartStore((state) => state.setAuthState);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Thêm state isLoading

  // Kiểm tra token trong cookies khi ứng dụng khởi chạy
  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      const customerId = Cookies.get("customerId");
      setIsLoggedIn(true);
      setUser(JSON.parse(Cookies.get("user") || "{}"));
      setCustomerId(customerId || null);
      setAuthState(true, customerId || null);
    }
    setIsLoading(false);
  }, [setAuthState]);

  const login = (user: Token, token: string) => {
    setUser(user);
    setIsLoggedIn(true);
    setCustomerId(user.id);
    Cookies.set("user", JSON.stringify(user), { expires: 7, path: "/" });
    Cookies.set("token", token, { expires: 7, path: "/" });
    Cookies.set("customerId", user.id, { expires: 7, path: "/" });
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCustomerId(null);
    Cookies.remove("user");
    Cookies.remove("token");
    Cookies.remove("customerId");
    setAuthState(false, null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoggedIn, customerId, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
