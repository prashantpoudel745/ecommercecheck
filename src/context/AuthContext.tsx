import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  companyName?: string;
  profileImage?: string;
  companyprofileImage?: string;
  signature?: string;
  selectedPlan?: string;
  companyId?: string;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || "";
const PUBLIC_PATHS = ["/home", "/contact-sales", "/login", "/employeelogin", "/signup", "/forgetpassword", "/forgetpasswordemployee", "/reset-password", "/reset-password-employee", "/payment/success", "/payment-failure", "/superadminlogin--34567", "/superadmincreate--34567"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const pathname = window.location.pathname;
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

    if (isPublicPath) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/getme`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as Window & { __AUTH_USER__?: User | null }).__AUTH_USER__ = user;
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
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
      setUser(null);
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
