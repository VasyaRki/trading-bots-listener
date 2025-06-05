// src/data/poller/binance-open-interest-poller.js

// /** @typedef {import('../../domain/models/marketData').NormalizedMarketData} NormalizedMarketData */
// /** @typedef {import('../../domain/interfaces/cacheStore').ICacheStore} ICacheStore */
// /** @typedef {import('../data-providers/binanceProvider.js').binance} BinanceProvider */

import { config } from '../../shared/config.js';
import { requestMultiLimiter } from '../../shared/utils/limiter.js';

/**
 * @param {Function} normalizer
 * @param {string[]} symbols
 * @returns {Promise<NormalizedMarketData[]>}
 */

export const init = () => {
  return {
    type: 'binance',
    getOpenInterest: async (symbol) => {
      try {
        const { binance } = config;
        await requestMultiLimiter(binance.limits);
        const url = new URL(`${binance.furl}/fapi/v1/openInterest`);
        url.searchParams.append('symbol', symbol);
        const response = await fetch(url);
        console.log(response);

        return response.json();
      } catch (err) {
        console.error(`[BINANCE POLLER ERROR] Symbol: ${symbol}`, err);

        return null;
      }
    },
    getAllPrices: async () => {
      try {
        const { binance } = config;
        await requestMultiLimiter(binance.limits);
        const url = new URL(`${binance.furl}/fapi/v1/ticker/price`);
        const response = await fetch(url);
        const result = await response.json();

        return result.map((item) => ({
          symbol: item.symbol,
          price: parseFloat(item.price),
          timestamp: Date.now(),
        }));
      } catch (err) {
        console.error('[BINANCE PRICE POLLER ERROR]', err);
        return [];
      }
    },
  };
};
