import { processWithLimit } from '../../shared/utils/acquire.js';

export class PollMarketDataUseCase {
  constructor(
    marketDataProvider,
    marketDataRepository,
    eventPublisher,
    normalizer,
  ) {
    this._marketDataProvider = marketDataProvider;
    this._marketDataRepository = marketDataRepository;
    this._eventPublisher = eventPublisher;
    this._normalizer = normalizer;
    this._cache = new Map();
  }

  async execute(symbols) {
    const results = await processWithLimit(
      this._pollSymbol.bind(this),
      symbols,
      {
        key: 'api',
        rate: 1200,
        time: 60_000,
        burst: 200,
        maxConcurrent: 16,
        continueOnError: true,
      },
    );

    for (const oiData of results.results) {
      const normalizedOI = this._normalizer.normalizeOpenInterest({
        provider: this._marketDataProvider.type,
        symbol: oiData.symbol,
        data: oiData.openInterest,
      });
      const cahcedOi = this._cache.get(oiData.symbol);
      if (!cahcedOi || cahcedOi !== oiData.openInterest.value) {
        await this._eventPublisher.publishOpenInterestUpdate(normalizedOI);
        this._cache.set(oiData.symbol, oiData.openInterest.value);
      }
    }

    return results;
  }

  async _pollSymbol(symbol) {
    const rawData = await this._marketDataProvider.getOpenInterest(symbol);

    if (!rawData) {
      throw new Error(`No data received for symbol: ${symbol}`);
    }

    const normalizedOI = this._normalizer.normalizeOpenInterest({
      provider: this._marketDataProvider.type,
      symbol,
      data: rawData,
    });

    return {
      symbol,
      success: true,
      openInterest: normalizedOI.toJSON(),
    };
  }
}
