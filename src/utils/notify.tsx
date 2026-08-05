import { toast as localToast } from "@/hooks/use-toast";

type AnyError = unknown;

function extractMessage(input: AnyError): string {
  if (!input) return "An error occurred";
  if (typeof input === "string") return input;
  if (typeof input === "object") {
    try {

      const resp = (input as any).response;
      if (resp && resp.data && resp.data.message) return String(resp.data.message);
      if ((input as any).message) return String((input as any).message);
      if (resp && resp.data) {
        const maybe = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
        return maybe.slice(0, 300);
      }
    } catch (e) {
      // fallthrough
    }
    try { return JSON.stringify(input).slice(0,300); } catch (e) { return String(input); }
  }
  return String(input);
}

const success = (msg: AnyError) => {
  localToast({ description: extractMessage(msg) });
};

const error = (msg: AnyError) => {
  localToast({ description: extractMessage(msg) });
};

const info = (msg: AnyError) => {
  localToast({ description: extractMessage(msg) });
};

const warn = (msg: AnyError) => {
  localToast({ description: extractMessage(msg) });
};

export const toast = { success, error, info, warn };
export default toast;
