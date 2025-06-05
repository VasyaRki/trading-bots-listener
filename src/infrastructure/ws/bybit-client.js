import WebSocket from 'ws';
import { CONSTANTS } from '../../shared/constants.js';

export const init = (publisher) => {
  const REST_URL =
    'https://api.bybit.com/v5/market/instruments-info?category=linear';
  const WS_URL = 'wss://stream.bybit.com/v5/public/linear';
  const BATCH_SIZE = 50;

  const oiUpdateChanel = CONSTANTS.PUBLISHER.CHANELS.OI_UPDATE;
  const priceUpdateChanel = CONSTANTS.PUBLISHER.CHANELS.PRICE_UPDATE;
  const fundingRateUpdateChanel =
    CONSTANTS.PUBLISHER.CHANELS.FUNDING_RATE_UPDATE;

  const fetchSymbols = async () => {
    const res = await fetch(REST_URL);
    const data = await res.json();
    return data.result.list.map((item) => item.symbol);
  };

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const createSocket = (symbolsBatch) => {
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      const args = symbolsBatch.map((symbol) => `tickers.${symbol}`);
      ws.send(JSON.stringify({ op: 'subscribe', args }));
      console.log(`Subscribed to ${symbolsBatch.length} pairs`);
    });

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw);
      if (msg.topic?.startsWith('tickers.') && msg.data) {
        const { symbol, lastPrice, openInterest, fundingRate } = msg.data;

        if (lastPrice !== undefined)
          publisher.publish(priceUpdateChanel, {
            provider: 'bybit',
            symbol,
            lastPrice,
            timestamp: Date.now(),
          });

        if (openInterest !== undefined)
          publisher.publish(oiUpdateChanel, {
            provider: 'bybit',
            symbol,
            openInterest,
            timestamp: Date.now(),
          });

        if (fundingRate !== undefined)
          publisher.publish(fundingRateUpdateChanel, {
            provider: 'bybit',
            symbol,
            fundingRate,
            timestamp: Date.now(),
          });
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });

    ws.on('close', () => {
      console.warn('WebSocket closed');
    });
  };

  return {
    start: async () => {
      try {
        const symbols = await fetchSymbols();
        const batches = chunkArray(symbols, BATCH_SIZE);

        for (const batch of batches) {
          createSocket(batch);
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (err) {
        console.error('Error during init:', err);
      }
    },
  };
};
