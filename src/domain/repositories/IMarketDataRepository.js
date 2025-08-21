export class IMarketDataRepository {
  async saveOpenInterest(openInterest) {
    throw new Error('Method saveOpenInterest must be implemented');
  }

  async getOpenInterestHistory(symbol, provider, limit = 180) {
    throw new Error('Method getOpenInterestHistory must be implemented');
  }

  async savePrice(price) {
    throw new Error('Method savePrice must be implemented');
  }

  async getPriceHistory(symbol, provider, limit = 180) {
    throw new Error('Method getPriceHistory must be implemented');
  }

  async saveFundingRate(fundingRate) {
    throw new Error('Method saveFundingRate must be implemented');
  }

  async getFundingRateHistory(symbol, provider, limit = 180) {
    throw new Error('Method getFundingRateHistory must be implemented');
  }

  async getLatestOpenInterest(symbol, provider) {
    throw new Error('Method getLatestOpenInterest must be implemented');
  }

  async getLatestPrice(symbol, provider) {
    throw new Error('Method getLatestPrice must be implemented');
  }

  async getLatestFundingRate(symbol, provider) {
    throw new Error('Method getLatestFundingRate must be implemented');
  }
}