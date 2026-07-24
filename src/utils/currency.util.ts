import Decimal from "decimal.js";

/**
 * CurrencyUtil (Frontend)
 * Mirrors the exact precision rules of the backend.
 * Ensures monetary strings are safely handled in React without float degradation.
 */

// Configure decimal.js for strict precision matching backend
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type DecimalInput =
  | string
  | number
  | Decimal
  | { $numberDecimal: string }
  | null
  | undefined;

export class CurrencyUtil {
  /**
   * Safely parses a string/number into a Decimal object.
   * Treats null/undefined/NaN as 0.
   */
  static parse(val: DecimalInput): Decimal {
    if (val === null || val === undefined || val === "") return new Decimal(0);
    if (val instanceof Decimal) return val;
    if (typeof val === "object" && "$numberDecimal" in val) {
      return this.parse(val.$numberDecimal);
    }
    try {
      const parsed = new Decimal(val);
      return parsed.isNaN() ? new Decimal(0) : parsed;
    } catch {
      return new Decimal(0);
    }
  }

  /**
   * Formats a value as a strict monetary string with 2 decimal places.
   */
  static format(
    val: string | number | null | undefined | Decimal | { $numberDecimal: string }
  ): string {
    const dec = val instanceof Decimal ? val : this.parse(val);
    return dec.toFixed(2);
  }

  /**
   * Addition: a + b
   */
  static add(a: DecimalInput, b: DecimalInput): Decimal {
    return this.parse(a).plus(this.parse(b));
  }

  /**
   * Subtraction: a - b
   */
  static sub(a: DecimalInput, b: DecimalInput): Decimal {
    return this.parse(a).minus(this.parse(b));
  }

  /**
   * Multiplication: a * b
   */
  static mul(a: DecimalInput, b: DecimalInput): Decimal {
    return this.parse(a).times(this.parse(b));
  }

  /**
   * Division: a / b
   */
  static div(a: DecimalInput, b: DecimalInput): Decimal {
    const denom = this.parse(b);
    if (denom.isZero()) return new Decimal(0);
    return this.parse(a).div(denom);
  }

  /**
   * Checks if a === b exactly.
   */
  static eq(a: DecimalInput, b: DecimalInput): boolean {
    return this.parse(a).equals(this.parse(b));
  }
}
