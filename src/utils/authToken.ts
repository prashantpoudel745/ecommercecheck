import axios from "axios";

const AUTH_TOKEN_KEY = "auth-token";

type MutableRequestConfig = {
  headers?: Record<string, string> | Headers | any;
  withCredentials?: boolean;
};

type WindowWithAuthFetch = Window & {
  __AUTH_FETCH_INSTALLED__?: boolean;
};

const getStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
};

export const getAuthToken = (): string | null => {
  try {
    return getStorage()?.getItem(AUTH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setAuthToken = (token?: string | null) => {
  try {
    const storage = getStorage();
    if (!storage) return;

    if (token) {
      storage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      storage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors; cookie auth can still carry the session.
  }
};

export const clearAuthToken = () => {
  setAuthToken(null);
};

export const attachAuthHeader = <T extends MutableRequestConfig>(config: T): T => {
  const token = getAuthToken();
  config.withCredentials = true;

  if (!token) return config;

  if (config.headers instanceof Headers) {
    if (!config.headers.has("Authorization")) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  }

  config.headers = config.headers || {};
  if (!config.headers.Authorization && !config.headers.authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

export const installAuthenticatedFetch = () => {
  if (typeof window === "undefined") return;

  const authWindow = window as WindowWithAuthFetch;
  if (authWindow.__AUTH_FETCH_INSTALLED__) return;

  const originalFetch = window.fetch.bind(window);
  authWindow.__AUTH_FETCH_INSTALLED__ = true;

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const token = getAuthToken();
    if (!token) {
      return originalFetch(input, init);
    }

    const target =
      typeof input === "string" || input instanceof URL
        ? input.toString()
        : input.url;

    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    const targetUrl = new URL(target, window.location.origin);
    const baseUrl = new URL(apiBase, window.location.origin);
    const isApiRequest =
      targetUrl.pathname.startsWith("/api") && targetUrl.origin === baseUrl.origin;

    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    const headers = new Headers(
      init?.headers || (input instanceof Request ? input.headers : undefined)
    );
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return originalFetch(input, {
      ...init,
      headers,
      credentials: init?.credentials || "include",
    });
  };

  axios.defaults.withCredentials = true;
  axios.interceptors.request.use((config) => attachAuthHeader(config));
};
