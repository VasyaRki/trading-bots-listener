import WebSocket from 'ws';
import { ProcessWebSocketDataUseCase } from '../../application/use-cases/ProcessWebSocketDataUseCase.js';

export const init = (marketDataRepository, eventPublisher, normalizer) => {
  const REST_URL =
    'https://api.bybit.com/v5/market/instruments-info?category=linear';
  const WS_URL = 'wss://stream.bybit.com/v5/public/linear';
  const BATCH_SIZE = 50;

  const processUseCase = new ProcessWebSocketDataUseCase(
    marketDataRepository,
    eventPublisher,
    normalizer,
  );

  const sockets = [];
  const RECONNECT_DELAY = 5000;
  const MAX_RECONNECT_ATTEMPTS = 3;

  const fetchSymbols = async () => {
    try {
      const res = await fetch(REST_URL);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      return data.result.list.map((item) => item.symbol);
    } catch (error) {
      console.error('[BYBIT WS] Failed to fetch symbols:', error);
      throw error;
    }
  };

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const createSocket = (symbolsBatch, batchIndex) => {
    let reconnectAttempts = 0;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      sockets[batchIndex] = { ws, symbols: symbolsBatch, reconnectAttempts };

      ws.on('open', () => {
        const args = symbolsBatch.map((symbol) => `tickers.${symbol}`);
        ws.send(JSON.stringify({ op: 'subscribe', args }));
        console.log(
          `[BYBIT WS] Subscribed to ${symbolsBatch.length} pairs (batch ${
            batchIndex + 1
          })`,
        );
        reconnectAttempts = 0;
      });

      ws.on('message', async (raw) => {
        try {
          const msg = JSON.parse(raw);
          if (msg.topic?.startsWith('tickers.') && msg.data) {
            const { symbol, lastPrice, openInterest, fundingRate } = msg.data;

            const promises = [];

            if (lastPrice !== undefined) {
              promises.push(
                processUseCase.processPrice('bybit', symbol, {
                  price: lastPrice,
                  lastPrice,
                  timestamp: Date.now(),
                }),
              );
            }

            if (openInterest !== undefined) {
              promises.push(
                processUseCase.processOpenInterest('bybit', symbol, {
                  openInterest,
                  value: openInterest,
                  timestamp: Date.now(),
                }),
              );
            }

            // if (fundingRate !== undefined) {
            //   promises.push(
            //     processUseCase.processFundingRate('bybit', symbol, {
            //       fundingRate,
            //       timestamp: Date.now(),
            //     }),
            //   );
            // }

            await Promise.allSettled(promises);
          }
        } catch (error) {
          console.error('[BYBIT WS] Message processing error:', error);
        }
      });

      ws.on('error', (err) => {
        console.error(
          `[BYBIT WS] WebSocket error (batch ${batchIndex + 1}):`,
          err.message,
        );
      });

      ws.on('close', (code, reason) => {
        console.warn(
          `[BYBIT WS] WebSocket closed (batch ${
            batchIndex + 1
          }): ${code} ${reason}`,
        );

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(
            `[BYBIT WS] Attempting to reconnect batch ${
              batchIndex + 1
            } (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
          );
          setTimeout(connect, RECONNECT_DELAY);
        } else {
          console.error(
            `[BYBIT WS] Max reconnection attempts reached for batch ${
              batchIndex + 1
            }`,
          );
        }
      });
    };

    connect();
  };

  return {
    start: async () => {
      try {
        const symbols = await fetchSymbols();
        const batches = chunkArray(symbols, BATCH_SIZE);
        console.log(
          `[BYBIT WS] Creating ${batches.length} WebSocket connections`,
        );

        for (let i = 0; i < batches.length; i++) {
          createSocket(batches[i], i);
          if (i < batches.length - 1) {
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      } catch (err) {
        console.error('[BYBIT WS] Error during init:', err);
      }
    },

    stop: async () => {
      console.log('[BYBIT WS] Stopping all connections');
      for (const socket of sockets) {
        if (socket?.ws) {
          socket.ws.close();
        }
      }
      sockets.length = 0;
    },
  };
};
