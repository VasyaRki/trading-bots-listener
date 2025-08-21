export class FundingRate {
  constructor(symbol, rate, timestamp, provider) {
    if (!symbol) {
      throw new Error('Symbol is required');
    }
    if (rate === null || rate === undefined || isNaN(rate)) {
      throw new Error('Rate must be a valid number');
    }
    if (!timestamp || !Number.isInteger(timestamp)) {
      throw new Error('Timestamp must be a valid integer');
    }
    if (!provider || typeof provider !== 'string') {
      throw new Error('Provider must be a non-empty string');
    }

    this._symbol = symbol;
    this._rate = parseFloat(rate);
    this._timestamp = timestamp;
    this._provider = provider.toLowerCase();
  }

  get symbol() {
    return this._symbol;
  }

  get rate() {
    return this._rate;
  }

  get timestamp() {
    return this._timestamp;
  }

  get provider() {
    return this._provider;
  }

  isPositive() {
    return this._rate > 0;
  }

  isNegative() {
    return this._rate < 0;
  }

  equals(other) {
    return other instanceof FundingRate && 
           this._symbol === other._symbol && 
           this._rate === other._rate && 
           this._timestamp === other._timestamp &&
           this._provider === other._provider;
  }

  toJSON() {
    return {
      symbol: this._symbol,
      rate: this._rate,
      timestamp: this._timestamp,
      provider: this._provider
    };
  }
}