import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { clearAuthToken, setAuthToken } from "@/utils/authToken";
import {User,AuthContextType} from "../../types/employee.types"

const AUTH_STORAGE_KEY = "auth-user-cache";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || "";

const readPersistedUser = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as User | null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const writePersistedUser = (userData: User | null) => {
  if (typeof window === "undefined") return;

  try {
    if (userData) {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } else {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors and continue with in-memory auth state.
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => readPersistedUser());
  const [loading, setLoading] = useState<boolean>(true);

  const setAuthUser = useCallback((userData: User | null) => {
    setUser(userData);
    writePersistedUser(userData);
  }, []);

  const refreshUser = useCallback(async () => {
    const persistedUser = readPersistedUser();
    if (persistedUser) {
      setAuthUser(persistedUser);
      setLoading(false);
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
          const mergedUser = {
            ...(persistedUser ?? {}),
            ...data.user,
            _id: data.user._id ?? data.user.id ?? persistedUser?._id ?? persistedUser?.id,
            id: data.user.id ?? data.user._id ?? persistedUser?.id ?? persistedUser?._id,
          } as User;
          setAuthUser(mergedUser);
        } else if (persistedUser) {
          setAuthUser(persistedUser);
        } else {
          setAuthUser(null);
        }
      } else if (response.status === 401 || response.status === 403) {
        if (persistedUser) {
          setAuthUser(persistedUser);
        } else {
          setAuthUser(null);
        }
      } else if (persistedUser) {
        setAuthUser(persistedUser);
      } else {
        setAuthUser(null);
      }
    } catch {
      if (persistedUser) {
        setAuthUser(persistedUser);
      } else {
        setAuthUser(null);
      }
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
      setAuthToken(token);
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
      clearAuthToken();
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
