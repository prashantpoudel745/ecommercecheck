// ============================================================
// CURRENCY CONFIGURATION
// To change the currency label globally, update only this line:
export const CURRENCY_SYMBOL = "NPR";
// ============================================================

/**
 * Formats a number into a currency string using the global CURRENCY_SYMBOL.
 * e.g. formatCurrency(15000) => "NPR 15,000.00"
 */
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${CURRENCY_SYMBOL} 0.00`;
  return `${CURRENCY_SYMBOL} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats a number with the currency label but no decimals.
 * e.g. formatCurrencyShort(15000) => "NPR 15,000"
 */
export const formatCurrencyShort = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${CURRENCY_SYMBOL} 0`;
  return `${CURRENCY_SYMBOL} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
