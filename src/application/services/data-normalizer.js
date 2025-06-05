export const init = () => {
  return {
    /**
     * Нормалізує open interest
     * @param {{ provider: string, symbol: string, data: any }} input
     * @returns {{ symbol: string, oi: number, time: number }}
     */
    normalizeOpenInterest: async (input) => {
      const { provider, symbol, data } = input;

      switch (provider) {
        case 'binance':
          return {
            symbol,
            oi: parseFloat(data.openInterest),
            time: data.time || Date.now(),
          };

        default:
          throw new Error(
            `[Normalizer] Unsupported provider in OI: ${provider}`,
          );
      }
    },

    /**
     * Нормалізує останню ціну
     * @param {{ provider: string, symbol: string, data: { price: number, timestamp: number } }} input
     * @returns {{ symbol: string, price: number, time: number }}
     */
    normalizePrice: async (input) => {
      const { provider, symbol, data } = input;

      switch (provider) {
        case 'binance':
          return {
            symbol,
            price: parseFloat(data.price),
            time: data.timestamp || Date.now(),
          };

        default:
          throw new Error(
            `[Normalizer] Unsupported provider in Price: ${provider}`,
          );
      }
    },
  };
};
