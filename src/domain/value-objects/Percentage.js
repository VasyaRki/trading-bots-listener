export class Percentage {
  constructor(value) {
    if (value === null || value === undefined || isNaN(value)) {
      throw new Error('Percentage value must be a valid number');
    }

    this._value = parseFloat(value);
  }

  get value() {
    return this._value;
  }

  get absoluteValue() {
    return Math.abs(this._value);
  }

  isPositive() {
    return this._value > 0;
  }

  isNegative() {
    return this._value < 0;
  }

  isZero() {
    return this._value === 0;
  }

  isSignificant(threshold = 5) {
    return this.absoluteValue >= threshold;
  }

  equals(other) {
    return other instanceof Percentage && this._value === other._value;
  }

  toString(precision = 2) {
    return `${this._value.toFixed(precision)}%`;
  }

  toFixed(precision = 2) {
    return parseFloat(this._value.toFixed(precision));
  }

  static fromDecimal(decimal) {
    return new Percentage(decimal * 100);
  }

  static zero() {
    return new Percentage(0);
  }
}