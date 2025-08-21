export class ISymbolRepository {
  async getSymbols() {
    throw new Error('Method getSymbols must be implemented');
  }

  async getSymbolsByProvider(provider) {
    throw new Error('Method getSymbolsByProvider must be implemented');
  }

  async symbolExists(symbol, provider) {
    throw new Error('Method symbolExists must be implemented');
  }

  async addSymbol(symbol) {
    throw new Error('Method addSymbol must be implemented');
  }

  async removeSymbol(symbol, provider) {
    throw new Error('Method removeSymbol must be implemented');
  }
}