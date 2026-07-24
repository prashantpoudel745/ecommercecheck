import { CurrencyUtil } from "./currency.util";
import type Decimal from "decimal.js";

export const getCurrencySymbol = () => {
  if (typeof window !== "undefined") {
    const user = (window as any).__AUTH_USER__;
    if (user && user.currencySymbol) return user.currencySymbol;
    try {
      const cached = window.sessionStorage.getItem("auth-user-cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.currencySymbol) return parsed.currencySymbol;
      }
    } catch (e) {
      //
    }
  }
  return "रु";
};

export const CURRENCY_SYMBOL = getCurrencySymbol();

export type Decimal128Json = {
  $numberDecimal: string;
};

export type DecimalValue = number | string | Decimal | Decimal128Json | null | undefined;

export const formatCurrency = (amount: DecimalValue): string => {
  const sym = getCurrencySymbol();
  const num = CurrencyUtil.parse(amount).toNumber();
  const locale = sym === "रु" || sym === "₹" ? "en-IN" : "en-US";

  return `${sym} ${num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCurrencyShort = (amount: DecimalValue): string => {
  const sym = getCurrencySymbol();
  const num = CurrencyUtil.parse(amount).toNumber();
  if (Number.isNaN(num)) return `${sym} 0`;

  const locale = sym === "रु" || sym === "₹" ? "en-IN" : "en-US";

  return `${sym} ${new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num)}`;
};
