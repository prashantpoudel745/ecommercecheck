import { toast as localToast } from "@/hooks/use-toast";

export type AnyError = unknown;

export function extractErrorMessage(input: AnyError, fallback = "An error occurred"): string {
  if (!input) return fallback;
  if (typeof input === "string") return input;

  if (typeof input === "object" && input !== null) {
    const anyInput = input as any;

    // Check response from Axios / fetch
    const resp = anyInput.response;
    if (resp && resp.data) {
      const data = resp.data;
      if (typeof data === "string" && data.trim()) return data.slice(0, 300);
      if (typeof data === "object") {
        if (data.message && data.message !== "Internal server error" && data.message !== "Internal Server Error") {
          return String(data.message);
        }
        if (data.error && typeof data.error === "string") {
          return String(data.error);
        }
        if (data.message) {
          return String(data.message);
        }
        if (data.errorMessage) {
          return String(data.errorMessage);
        }
      }
    }

    // Check error.data (some custom wrappers)
    if (anyInput.data && typeof anyInput.data === "object") {
      if (anyInput.data.message) return String(anyInput.data.message);
      if (anyInput.data.error) return String(anyInput.data.error);
    }

    // If input is standard JS Error (or AxiosError without server response body message)
    if (anyInput.message && typeof anyInput.message === "string") {
      const msg = anyInput.message;
      if (!msg.startsWith("Request failed with status code")) {
        return msg;
      }
    }

    try {
      return JSON.stringify(input).slice(0, 300);
    } catch {
      return fallback;
    }
  }

  return String(input);
}

const success = (msg: AnyError) => {
  localToast({ description: extractErrorMessage(msg, "Success") });
};

const error = (msg: AnyError) => {
  localToast({ description: extractErrorMessage(msg, "An error occurred") });
};

const info = (msg: AnyError) => {
  localToast({ description: extractErrorMessage(msg, "Notice") });
};

const warn = (msg: AnyError) => {
  localToast({ description: extractErrorMessage(msg, "Warning") });
};

export const toast = { success, error, info, warn };
export default toast;
