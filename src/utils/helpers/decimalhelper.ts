import Decimal from 'decimal.js';

export const toDecimal = (value: any): Decimal => {
  if (value == null) return new Decimal(0);

  if (value instanceof Decimal) return value;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? new Decimal(value) : new Decimal(0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return new Decimal(0);
    try {
      return new Decimal(trimmed);
    } catch {
      return new Decimal(0);
    }
  }

  if (typeof value === 'object' && '$numberDecimal' in value) {
    try {
      return new Decimal(value.$numberDecimal);
    } catch {
      return new Decimal(0);
    }
  }

  // BSON Decimal128 instance (mongoose/driver) — has a reliable toString()
  if (typeof value?.toString === 'function') {
    try {
      return new Decimal(value.toString());
    } catch {
      return new Decimal(0);
    }
  }

  return new Decimal(0);
};

export const toNumber = (value: any): number => toDecimal(value).toNumber();