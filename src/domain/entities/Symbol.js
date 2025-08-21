export class Symbol {
  constructor(symbol, exchange) {
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Symbol must be a non-empty string');
    }
    if (!exchange || typeof exchange !== 'string') {
      throw new Error('Exchange must be a non-empty string');
    }

    this._symbol = symbol.toUpperCase();
    this._exchange = exchange.toLowerCase();
  }

  get symbol() {
    return this._symbol;
  }

  get exchange() {
    return this._exchange;
  }

  equals(other) {
    return other instanceof Symbol && 
           this._symbol === other._symbol && 
           this._exchange === other._exchange;
  }

  toString() {
    return `${this._exchange}:${this._symbol}`;
  }
}