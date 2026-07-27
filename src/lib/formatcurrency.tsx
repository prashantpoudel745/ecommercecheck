import { CurrencyUtil } from "@/utils/currency.util";
import { getCurrencySymbol } from "@/utils/formatCurrency";
import type { DecimalValue } from "@/utils/formatCurrency";

export const formatCurrency = (value: DecimalValue, compact = false) => {
  const sym = getCurrencySymbol();
  const locale = sym === "रु" || sym === "₹" ? "en-IN" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? "compact" : "standard",
  }).format(CurrencyUtil.parse(value).toNumber());
};
