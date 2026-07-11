export const formatCurrencyValue = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(safeValue.toFixed(2)));
  };