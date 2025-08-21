export class Price {
  constructor(symbol, value, timestamp, provider) {
    if (!symbol) {
      throw new Error('Symbol is required');
    }
    if (value === null || value === undefined || isNaN(value) || value <= 0) {
      throw new Error('Value must be a positive number');
    }
    if (!timestamp || !Number.isInteger(timestamp)) {
      throw new Error('Timestamp must be a valid integer');
    }
    if (!provider || typeof provider !== 'string') {
      throw new Error('Provider must be a non-empty string');
    }

    this._symbol = symbol;
    this._value = parseFloat(value);
    this._timestamp = timestamp;
    this._provider = provider.toLowerCase();
  }

  get symbol() {
    return this._symbol;
  }

  get value() {
    return this._value;
  }

  get timestamp() {
    return this._timestamp;
  }

  get provider() {
    return this._provider;
  }

  calculatePercentageChange(previousPrice) {
    if (!previousPrice || !(previousPrice instanceof Price)) {
      throw new Error('Previous Price is required for comparison');
    }

    if (previousPrice.value === 0) {
      return this._value > 0 ? 100 : 0;
    }

    return ((this._value - previousPrice.value) / previousPrice.value) * 100;
  }

  equals(other) {
    return other instanceof Price && 
           this._symbol === other._symbol && 
           this._value === other._value && 
           this._timestamp === other._timestamp &&
           this._provider === other._provider;
  }

  toJSON() {
    return {
      symbol: this._symbol,
      value: this._value,
      timestamp: this._timestamp,
      provider: this._provider
    };
  }
}