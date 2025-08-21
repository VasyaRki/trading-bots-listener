export class IMarketDataProvider {
  get type() {
    throw new Error('Property type must be implemented');
  }

  async getOpenInterest(symbol) {
    throw new Error('Method getOpenInterest must be implemented');
  }

  async getAllPrices() {
    throw new Error('Method getAllPrices must be implemented');
  }

  async getSymbols() {
    throw new Error('Method getSymbols must be implemented');
  }

  async connect() {
    throw new Error('Method connect must be implemented');
  }

  async disconnect() {
    throw new Error('Method disconnect must be implemented');
  }
}