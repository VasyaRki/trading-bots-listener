export class Provider {
  static BINANCE = 'binance';
  static BYBIT = 'bybit';

  static VALID_PROVIDERS = [Provider.BINANCE, Provider.BYBIT];

  constructor(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Provider name must be a non-empty string');
    }

    const normalizedName = name.toLowerCase();
    if (!Provider.VALID_PROVIDERS.includes(normalizedName)) {
      throw new Error(`Invalid provider: ${name}. Valid providers: ${Provider.VALID_PROVIDERS.join(', ')}`);
    }

    this._name = normalizedName;
  }

  get name() {
    return this._name;
  }

  equals(other) {
    return other instanceof Provider && this._name === other._name;
  }

  toString() {
    return this._name;
  }

  static fromString(providerString) {
    return new Provider(providerString);
  }

  isBinance() {
    return this._name === Provider.BINANCE;
  }

  isBybit() {
    return this._name === Provider.BYBIT;
  }
}