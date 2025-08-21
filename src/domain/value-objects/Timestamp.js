export class Timestamp {
  constructor(value) {
    if (value === null || value === undefined) {
      this._value = Date.now();
    } else if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      this._value = value;
    } else if (value instanceof Date) {
      this._value = value.getTime();
    } else {
      throw new Error('Timestamp must be a positive integer, Date object, or null/undefined');
    }
  }

  get value() {
    return this._value;
  }

  toDate() {
    return new Date(this._value);
  }

  toISOString() {
    return this.toDate().toISOString();
  }

  equals(other) {
    return other instanceof Timestamp && this._value === other._value;
  }

  isAfter(other) {
    if (!(other instanceof Timestamp)) {
      throw new Error('Comparison must be with another Timestamp');
    }
    return this._value > other._value;
  }

  isBefore(other) {
    if (!(other instanceof Timestamp)) {
      throw new Error('Comparison must be with another Timestamp');
    }
    return this._value < other._value;
  }

  diffInMs(other) {
    if (!(other instanceof Timestamp)) {
      throw new Error('Comparison must be with another Timestamp');
    }
    return Math.abs(this._value - other._value);
  }

  static now() {
    return new Timestamp();
  }

  static fromDate(date) {
    return new Timestamp(date);
  }

  toString() {
    return this.toISOString();
  }
}