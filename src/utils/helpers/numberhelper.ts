import Decimal from 'decimal.js';

export const toDecimal = (value): Decimal => {
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

  // MongoDB Decimal128 serialized as plain JSON: { $numberDecimal: "123.45" }
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

/**
 * Convenience wrapper for places where you genuinely just need a display number
 * (charts, inputs, etc.) and don't need to chain further arithmetic.
 */
export const toNumber = (value): number => toDecimal(value).toNumber();