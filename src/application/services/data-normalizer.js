import { MarketDataNormalizer } from '../../domain/services/MarketDataNormalizer.js';

export const init = () => {
  return new MarketDataNormalizer();
};
