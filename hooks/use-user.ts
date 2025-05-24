import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { User, UserRole } from "@prisma/client";

export function useUser(token: string | null) {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Giải mã token để lấy thông tin người dùng
      const decodedToken = jwtDecode<{
        id: string;
        name: string;
        email: string;
        role?: UserRole;
        phone?: string;
        address?: string;
        avatar?: string;
      }>(token);
      setUser({
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken?.role ?? UserRole.CUSTOMER,
        phone: decodedToken.phone || "",
        address: decodedToken.address || "",
        avatar: decodedToken.avatar || "",
      });
    } catch (error) {
      console.error("Invalid token:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { user, loading };
}
