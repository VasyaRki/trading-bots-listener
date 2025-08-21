import { PollMarketDataUseCase } from '../use-cases/PollMarketDataUseCase.js';

export const init = (
  provider,
  normalizer,
  marketDataRepository,
  eventPublisher,
) => {
  const useCase = new PollMarketDataUseCase(
    provider,
    marketDataRepository,
    eventPublisher,
    normalizer,
  );

  return {
    start: async () => {
      const symbols = await provider.getSymbols();

      setInterval(async () => {
        await useCase.execute(symbols);
      }, 60_000);
    },
  };
};
