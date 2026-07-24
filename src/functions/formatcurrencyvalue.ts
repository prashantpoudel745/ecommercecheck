import { CurrencyUtil } from "@/utils/currency.util";
import type { DecimalValue } from "@/utils/formatCurrency";

export const formatCurrencyValue = (value: DecimalValue) => {
    const safeValue = CurrencyUtil.parse(value);
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue.toNumber());
  };
