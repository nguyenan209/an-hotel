import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string; // Thêm các trường khác nếu cần
}

export function useUser(token: string | null) {
  const [user, setUser] = useState<User | null>(null);
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
        role?: string;
      }>(token);
      setUser({
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken.role,
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
