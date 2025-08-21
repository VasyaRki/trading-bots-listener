import { IMarketDataProvider } from '../../domain/repositories/IMarketDataProvider.js';
import { config } from '../../shared/config.js';
import { requestMultiLimiter } from '../../shared/utils/limiter.js';

export class BinanceProvider extends IMarketDataProvider {
  get type() {
    return 'binance';
  }

  async getOpenInterest(symbol) {
    try {
      const { binance } = config;
      await requestMultiLimiter(binance.limits);
      const url = new URL(`${binance.furl}/fapi/v1/openInterest`);
      url.searchParams.append('symbol', symbol);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (err) {
      console.error(`[BINANCE PROVIDER ERROR] Symbol: ${symbol}`, err);
      throw err;
    }
  }

  async getAllPrices() {
    try {
      const { binance } = config;
      await requestMultiLimiter(binance.limits);
      const url = new URL(`${binance.furl}/fapi/v1/ticker/price`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();

      return result.map((item) => ({
        symbol: item.symbol,
        price: parseFloat(item.price),
        timestamp: Date.now(),
      }));
    } catch (err) {
      console.error('[BINANCE PRICE PROVIDER ERROR]', err);
      throw err;
    }
  }

  async getSymbols() {
    try {
      const { binance } = config;
      await requestMultiLimiter(binance.limits);
      const url = new URL(`${binance.furl}/fapi/v1/exchangeInfo`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.symbols
        .filter(s => s.status === 'TRADING')
        .map(s => s.symbol);
    } catch (err) {
      console.error('[BINANCE SYMBOLS PROVIDER ERROR]', err);
      throw err;
    }
  }

  async connect() {
    // No connection needed for REST API
  }

  async disconnect() {
    // No disconnection needed for REST API
  }
}

export const init = () => {
  return new BinanceProvider();
};
