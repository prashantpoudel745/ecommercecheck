import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  companyName?: string;
  profileImage?: string;
  companyprofileImage?: string;
  signature?: string;
  selectedPlan?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In production, VITE_API_URL is intentionally empty so requests like
// /api/getme go through Vercel's rewrite proxy (defined in vercel.json)
// In development, it points to http://localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || "";


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const savedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (savedToken) {
        headers["Authorization"] = `Bearer ${savedToken}`;
      }

      const response = await fetch(`${API_BASE}/api/getme`, {
        method: "POST", // Note: route is defined as router.post("/getme") in backend
        headers,
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (data.token) {
            sessionStorage.setItem("token", data.token);
            localStorage.setItem("token", data.token);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    const actualToken = token || userData.token || (userData as any).token;
    if (actualToken) {
      sessionStorage.setItem("token", actualToken);
      localStorage.setItem("token", actualToken);
    }
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
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setUser(null);
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
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
