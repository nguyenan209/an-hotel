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
  updateUserAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Token | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const setAuthState = useCartStore((state) => state.setAuthState);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Kiểm tra token trong cookies khi ứng dụng khởi chạy
  useEffect(() => {
    const token = Cookies.get("token");
    const userCookie = Cookies.get("user");

    if (token && userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        console.log("User data from cookie:", userData);
        setIsLoggedIn(true);
        setUser(userData);
        setCustomerId(userData.customerId || null);
        setAuthState(true, userData.customerId || null);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
    setIsLoading(false);
  }, [setAuthState]);

  const login = (user: Token, token: string) => {
    console.log("Login with user data:", user);
    setUser(user);
    setIsLoggedIn(true);
    setCustomerId(user.customerId);
    Cookies.set("user", JSON.stringify(user), { expires: 7, path: "/" });
    Cookies.set("token", token, { expires: 7, path: "/" });
    Cookies.set("customerId", user.customerId, { expires: 7, path: "/" });
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

  const updateUserAvatar = (avatarUrl: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: avatarUrl };
      Cookies.set("user", JSON.stringify(updated), { expires: 7, path: "/" });
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoggedIn, customerId, isLoading, updateUserAvatar }}
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
