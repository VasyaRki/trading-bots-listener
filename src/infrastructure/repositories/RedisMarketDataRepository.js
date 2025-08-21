import { IMarketDataRepository } from '../../domain/repositories/IMarketDataRepository.js';
import { OpenInterest } from '../../domain/entities/OpenInterest.js';
import { Price } from '../../domain/entities/Price.js';
import { FundingRate } from '../../domain/entities/FundingRate.js';
import { RedisKeyBuilder } from '../cache/key-builder.js';

export class RedisMarketDataRepository extends IMarketDataRepository {
  constructor(redisService) {
    super();
    this._redis = redisService;
  }

  async saveOpenInterest(openInterest) {
    const key = RedisKeyBuilder.buildOpenInterestHistoryKey(
      openInterest.symbol,
      openInterest.provider,
    );
    await this._redis.lpushLimit(key, openInterest.toJSON());
  }

  async getOpenInterestHistory(symbol, provider, limit = 180) {
    const key = RedisKeyBuilder.buildOpenInterestHistoryKey(symbol, provider);
    const rawData = await this._redis.getRecentOI(symbol);

    return rawData
      .slice(0, limit)
      .map(
        (data) =>
          new OpenInterest(
            data.symbol,
            data.value || data.oi,
            data.timestamp || data.time,
            data.provider,
          ),
      );
  }

  async savePrice(price) {
    const key = RedisKeyBuilder.buildPriceHistoryKey(
      price.symbol,
      price.provider,
    );
    await this._redis.lpushLimit(key, price.toJSON());
  }

  async getPriceHistory(symbol, provider, limit = 180) {
    const key = RedisKeyBuilder.buildPriceHistoryKey(symbol, provider);
    const pipeline = this._redis._redis.pipeline();
    pipeline.lrange(key, 0, limit - 1);
    const results = await pipeline.exec();

    if (!results[0][1]) return [];

    return results[0][1].map((data) => {
      const parsed = JSON.parse(data);
      return new Price(
        parsed.symbol,
        parsed.value || parsed.price,
        parsed.timestamp || parsed.time,
        parsed.provider,
      );
    });
  }

  async saveFundingRate(fundingRate) {
    const key = RedisKeyBuilder.buildFundingRateHistoryKey(
      fundingRate.symbol,
      fundingRate.provider,
    );
    await this._redis.lpushLimit(key, fundingRate.toJSON());
  }

  async getFundingRateHistory(symbol, provider, limit = 180) {
    const key = RedisKeyBuilder.buildFundingRateHistoryKey(symbol, provider);
    const pipeline = this._redis._redis.pipeline();
    pipeline.lrange(key, 0, limit - 1);
    const results = await pipeline.exec();

    if (!results[0][1]) return [];

    return results[0][1].map((data) => {
      const parsed = JSON.parse(data);
      return new FundingRate(
        parsed.symbol,
        parsed.rate,
        parsed.timestamp,
        parsed.provider,
      );
    });
  }

  async getLatestOpenInterest(symbol, provider) {
    const history = await this.getOpenInterestHistory(symbol, provider, 1);
    return history.length > 0 ? history[0] : null;
  }

  async getLatestPrice(symbol, provider) {
    const history = await this.getPriceHistory(symbol, provider, 1);
    return history.length > 0 ? history[0] : null;
  }

  async getLatestFundingRate(symbol, provider) {
    const history = await this.getFundingRateHistory(symbol, provider, 1);
    return history.length > 0 ? history[0] : null;
  }
}
