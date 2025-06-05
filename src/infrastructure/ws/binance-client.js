import WebSocket from 'ws';
import { CONSTANTS } from '../../shared/constants.js';

export const init = (publisher) => {
  const WS_URL = 'wss://fstream.binance.com/ws/!markPrice@arr';

  const priceUpdateChanel = CONSTANTS.PUBLISHER.CHANELS.PRICE_UPDATE;
  const fundingRateUpdateChanel =
    CONSTANTS.PUBLISHER.CHANELS.FUNDING_RATE_UPDATE;

  const createSocket = () => {
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      console.log(`Subscribed to all pairs`);
    });

    ws.on('message', (raw) => {
      const priceUpdates = JSON.parse(raw);

      for (const priceUpdate of priceUpdates) {
        if (priceUpdate) {
          const { p, r, s } = priceUpdate;

          if (p !== undefined)
            publisher.publish(priceUpdateChanel, {
              provider: 'binance',
              symbol: s,
              lastPrice: p,
              timestamp: Date.now(),
            });

          if (r !== undefined)
            publisher.publish(fundingRateUpdateChanel, {
              provider: 'binance',
              symbol: s,
              fundingRate: r,
              timestamp: Date.now(),
            });
        }
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
        createSocket();
      } catch (err) {
        console.error('Error during init:', err);
      }
    },
  };
};
