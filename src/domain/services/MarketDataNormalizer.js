import { OpenInterest } from '../entities/OpenInterest.js';
import { Price } from '../entities/Price.js';
import { FundingRate } from '../entities/FundingRate.js';
import { Provider } from '../value-objects/Provider.js';
import { Timestamp } from '../value-objects/Timestamp.js';

export class MarketDataNormalizer {
  normalizeOpenInterest({ provider, symbol, data }) {
    try {
      const providerObj = new Provider(provider);
      const timestamp = data.time ? new Timestamp(data.time) : Timestamp.now();

      let value;
      if (providerObj.isBinance())
        value = parseFloat(data.openInterest || data.value || 0);
      else if (providerObj.isBybit())
        value = parseFloat(data.openInterest || data.value || 0);
      else throw new Error(`Unsupported provider: ${provider}`);

      return new OpenInterest(symbol, value, timestamp.value, provider);
    } catch (error) {
      throw new Error(
        `Failed to normalize open interest data: ${error.message}`,
      );
    }
  }

  normalizePrice({ provider, symbol, data }) {
    try {
      const providerObj = new Provider(provider);
      const timestamp = data.time ? new Timestamp(data.time) : Timestamp.now();

      let value;
      if (providerObj.isBinance())
        value = parseFloat(data.price || data.lastPrice || data.p || 0);
      else if (providerObj.isBybit())
        value = parseFloat(data.lastPrice || data.price || 0);
      else throw new Error(`Unsupported provider: ${provider}`);

      return new Price(symbol, value, timestamp.value, provider);
    } catch (error) {
      throw new Error(`Failed to normalize price data: ${error.message}`);
    }
  }

  normalizeFundingRate({ provider, symbol, data }) {
    try {
      const providerObj = new Provider(provider);
      const timestamp = data.time ? new Timestamp(data.time) : Timestamp.now();

      let rate;
      if (providerObj.isBinance())
        rate = parseFloat(data.fundingRate || data.r || 0);
      else if (providerObj.isBybit()) rate = parseFloat(data.fundingRate || 0);
      else throw new Error(`Unsupported provider: ${provider}`);

      return new FundingRate(symbol, rate, timestamp.value, provider);
    } catch (error) {
      throw new Error(
        `Failed to normalize funding rate data: ${error.message}`,
      );
    }
  }
}
