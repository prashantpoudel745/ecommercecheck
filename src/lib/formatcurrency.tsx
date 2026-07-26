import { getCurrencySymbol } from "@/utils/formatCurrency";
export const formatCurrency = (value: number, compact = false) => {
  const sym = getCurrencySymbol();
  const locale = (sym === "रु" || sym === "₹") ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? "compact" : "standard",
  }).format(value);
};