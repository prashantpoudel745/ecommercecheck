// ============================================================
// CURRENCY CONFIGURATION
// To change the currency label globally, update only this line:
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
    } catch(e) {}
  }
  return "रु";
};
export const CURRENCY_SYMBOL = getCurrencySymbol();
// ============================================================

/**
 * Formats a number into a currency string using the global CURRENCY_SYMBOL.
 * e.g. formatCurrency(15000) => "रु 15,000.00"
 */
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const sym = getCurrencySymbol();
  if (isNaN(num)) return `${sym} 0.00`;

  const locale = (sym === "रु" || sym === "₹") ? "en-IN" : "en-US";

  return `${sym} ${num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats a number with the currency label and compact notation (e.g. 1M, 10L).
 */
export const formatCurrencyShort = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const sym = getCurrencySymbol();
  if (isNaN(num)) return `${sym} 0`;

  const locale = (sym === "रु" || sym === "₹") ? "en-IN" : "en-US";

  return `${sym} ${new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1
  }).format(num)}`;
};
