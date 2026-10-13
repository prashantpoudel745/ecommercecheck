import { toast as localToast } from "@/hooks/use-toast";

export type AnyError = unknown;

export function extractErrorMessage(input: AnyError, fallback = "An error occurred"): string {
  if (!input) return fallback;

  let raw = "";

  if (typeof input === "string") {
    raw = input;
  } else if (typeof input === "object" && input !== null) {
    const anyInput = input as any;
    const resp = anyInput.response;
    if (resp && resp.data) {
      const data = resp.data;
      if (typeof data === "string" && data.trim()) raw = data;
      else if (typeof data === "object") {
        if (data.message && data.message !== "Internal server error" && data.message !== "Internal Server Error") {
          raw = String(data.message);
        } else if (data.error && typeof data.error === "string") {
          raw = String(data.error);
        } else if (data.errorMessage) {
          raw = String(data.errorMessage);
        }
      }
    }
    if (!raw && anyInput.data && typeof anyInput.data === "object") {
      if (anyInput.data.message) raw = String(anyInput.data.message);
      else if (anyInput.data.error) raw = String(anyInput.data.error);
    }
    if (!raw && anyInput.message && typeof anyInput.message === "string") {
      const msg = anyInput.message;
      if (!msg.startsWith("Request failed with status code")) {
        raw = msg;
      }
    }
  }

  if (!raw) {
    try {
      raw = String(input);
    } catch {
      return fallback;
    }
  }

  // Clean up raw database/schema noise into user-friendly UI text
  const clean = raw.trim();
  if (/Cast to Number failed/i.test(clean) || /Cast to \w+ failed/i.test(clean)) {
    return "One of the numbers or input fields is invalid or empty. Please check your entries.";
  }
  if (/validation failed/i.test(clean) && !/IRD/i.test(clean)) {
    return clean.replace(/^.*validation failed:\s*/i, "").replace(/Cast to \w+ failed.*/i, "Invalid input format");
  }
  if (/E11000/i.test(clean) || /duplicate key/i.test(clean)) {
    return "A record with this serial number or code already exists.";
  }
  if (/Internal server error/i.test(clean)) {
    return "An internal system error occurred. Please try again or refresh.";
  }

  return clean.length > 250 ? clean.slice(0, 247) + "..." : clean;
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
