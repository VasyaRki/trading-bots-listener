export class ProcessWebSocketDataUseCase {
  constructor(marketDataRepository, eventPublisher, normalizer) {
    this._marketDataRepository = marketDataRepository;
    this._eventPublisher = eventPublisher;
    this._normalizer = normalizer;
  }

  async processPrice(provider, symbol, priceData) {
    try {
      const normalizedPrice = this._normalizer.normalizePrice({
        provider,
        symbol,
        data: priceData,
      });

      // await this._marketDataRepository.savePrice(normalizedPrice);
      await this._eventPublisher.publishPriceUpdate(normalizedPrice);

      return {
        success: true,
        type: 'price',
        data: normalizedPrice.toJSON(),
      };
    } catch (error) {
      console.error(`[PRICE PROCESS ERROR] ${provider}:${symbol}`, error);
      return {
        success: false,
        type: 'price',
        error: error.message,
      };
    }
  }

  async processOpenInterest(provider, symbol, oiData) {
    try {
      const normalizedOI = this._normalizer.normalizeOpenInterest({
        provider,
        symbol,
        data: oiData,
      });

      // await this._marketDataRepository.saveOpenInterest(normalizedOI);
      await this._eventPublisher.publishOpenInterestUpdate(normalizedOI);

      return {
        success: true,
        type: 'openInterest',
        data: normalizedOI.toJSON(),
      };
    } catch (error) {
      console.error(`[OI PROCESS ERROR] ${provider}:${symbol}`, error);
      return {
        success: false,
        type: 'openInterest',
        error: error.message,
      };
    }
  }

  async processFundingRate(provider, symbol, fundingData) {
    try {
      const normalizedFunding = this._normalizer.normalizeFundingRate({
        provider,
        symbol,
        data: fundingData,
      });

      // await this._marketDataRepository.saveFundingRate(normalizedFunding);
      // await this._eventPublisher.publishFundingRateUpdate(normalizedFunding);

      return {
        success: true,
        type: 'fundingRate',
        data: normalizedFunding.toJSON(),
      };
    } catch (error) {
      console.error(`[FUNDING PROCESS ERROR] ${provider}:${symbol}`, error);
      return {
        success: false,
        type: 'fundingRate',
        error: error.message,
      };
    }
  }
}
