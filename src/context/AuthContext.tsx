import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { clearAuthToken, setAuthToken } from "@/utils/authToken";
import {User,AuthContextType} from "../../types/employee.types"

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || "";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setAuthUser = useCallback((userData: User | null) => {
    setUser(userData);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/getme`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Uses HTTP-only cookie
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const fetchedUser = {
            ...data.user,
            _id: data.user._id ?? data.user.id,
            id: data.user.id ?? data.user._id,
          } as User;
          setAuthUser(fetchedUser);
        } else {
          setAuthUser(null);
        }
      } else {
        setAuthUser(null);
      }
    } catch {
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  }, [setAuthUser]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as Window & { __AUTH_USER__?: User | null }).__AUTH_USER__ = user;
    }
  }, [user]);

  const login = (userData: User, token?: string) => {
    if (token) {
      setAuthToken(token); // No-op now, retains interface signature
    }
    setAuthUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch {
      // Ignore network errors and clear the UI session locally.
    } finally {
      clearAuthToken(); // No-op now
      setAuthUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
