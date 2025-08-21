import WebSocket from 'ws';
import { ProcessWebSocketDataUseCase } from '../../application/use-cases/ProcessWebSocketDataUseCase.js';

export const init = (marketDataRepository, eventPublisher, normalizer) => {
  const WS_URL = 'wss://fstream.binance.com/ws/!markPrice@arr';
  const processUseCase = new ProcessWebSocketDataUseCase(
    marketDataRepository,
    eventPublisher,
    normalizer,
  );

  let ws = null;
  let reconnectInterval = null;
  const RECONNECT_DELAY = 5000;
  const MAX_RECONNECT_ATTEMPTS = 5;
  let reconnectAttempts = 0;

  const createSocket = () => {
    ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      console.log(`[BINANCE WS] Connected to all pairs stream`);
      reconnectAttempts = 0;
    });

    ws.on('message', async (raw) => {
      try {
        const priceUpdates = JSON.parse(raw);

        for (const update of priceUpdates) {
          if (update) {
            const { p, r, s } = update;

            if (p !== undefined) {
              await processUseCase.processPrice('binance', s, {
                price: p,
                lastPrice: p,
                timestamp: Date.now(),
              });
            }

            // if (r !== undefined) {
            //   await processUseCase.processFundingRate('binance', s, {
            //     fundingRate: r,
            //     timestamp: Date.now(),
            //   });
            // }
          }
        }
      } catch (error) {
        console.error('[BINANCE WS] Message processing error:', error);
      }
    });

    ws.on('error', (err) => {
      console.error('[BINANCE WS] WebSocket error:', err.message);
    });

    ws.on('close', (code, reason) => {
      console.warn(`[BINANCE WS] WebSocket closed: ${code} ${reason}`);
      attemptReconnect();
    });
  };

  const attemptReconnect = () => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[BINANCE WS] Max reconnection attempts reached');
      return;
    }

    reconnectAttempts++;
    console.log(
      `[BINANCE WS] Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
    );

    reconnectInterval = setTimeout(() => {
      createSocket();
    }, RECONNECT_DELAY);
  };

  return {
    start: async () => {
      try {
        createSocket();
      } catch (err) {
        console.error('[BINANCE WS] Error during init:', err);
      }
    },

    stop: async () => {
      if (reconnectInterval) {
        clearTimeout(reconnectInterval);
      }
      if (ws) {
        ws.close();
      }
    },
  };
};
