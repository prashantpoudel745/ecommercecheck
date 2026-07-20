// api.js
const BASE_URL = import.meta.env.VITE_API_URL||""
 
export const apiFetch = async (
  path: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
) => {
  const response = await fetch(`${BASE_URL}${path}`, {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    ...(options.headers || {}),
  },
  ...options,
});

  return response.json();
};
