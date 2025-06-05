import { RedisKeyBuilder } from '../../infrastructure/cache/key-builder.js';
import { CONSTANTS } from '../../shared/constants.js';

export const init = (provider, normalizer, redis) => {
  return {
    poll: async (symbols) => {
      const promises = symbols.map(async (symbol) => {
        try {
          const rawData = await provider.getOpenInterest(symbol);
          const normalized = await normalizer.normalizeOpenInterest({
            provider: provider.type,
            symbol,
            data: rawData,
          });
          const key = RedisKeyBuilder.buildOpenInterestHistoryKey(
            symbol,
            provider.type,
          );
          await redis.lpushLimit(key, normalized);
        } catch (err) {
          console.error(`[BINANCE POLLER ERROR] Symbol: ${symbol}`, err);
          return null;
        }
      });
      await redis.publish(CONSTANTS.PUBLISHER.CHANELS.OI_UPDATE, provider.type);
      await Promise.all(promises);
    },
  };
};
