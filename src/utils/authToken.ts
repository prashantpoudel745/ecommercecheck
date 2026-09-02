import axios from "axios";

const AUTH_TOKEN_KEY = "auth-token"; // Retained for interface compatibility, no longer used for storage

type MutableRequestConfig = {
  headers?: Record<string, string> | Headers | any;
  withCredentials?: boolean;
};

type WindowWithAuthFetch = Window & {
  __AUTH_FETCH_INSTALLED__?: boolean;
};

export const getAuthToken = (): string | null => {
  return null; // HTTP-only cookies handle auth now
};

export const setAuthToken = (token?: string | null) => {
  // No-op: HTTP-only cookies handle auth now
};

export const clearAuthToken = () => {
  // No-op: Logout handled by API which clears the cookie
};

export const attachAuthHeader = <T extends MutableRequestConfig>(config: T): T => {
  config.withCredentials = true; // Ensure cookies are sent
  return config;
};

export const installAuthenticatedFetch = () => {
  if (typeof window === "undefined") return;

  const authWindow = window as WindowWithAuthFetch;
  if (authWindow.__AUTH_FETCH_INSTALLED__) return;

  const originalFetch = window.fetch.bind(window);
  authWindow.__AUTH_FETCH_INSTALLED__ = true;

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
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

    return originalFetch(input, {
      ...init,
      credentials: init?.credentials || "include",
    });
  };

  axios.defaults.withCredentials = true;
  axios.interceptors.request.use((config) => attachAuthHeader(config));
};
