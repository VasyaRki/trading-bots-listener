export class IEventPublisher {
  async publishOpenInterestUpdate(openInterest) {
    throw new Error('Method publishOpenInterestUpdate must be implemented');
  }

  async publishPriceUpdate(price) {
    throw new Error('Method publishPriceUpdate must be implemented');
  }

  async publishFundingRateUpdate(fundingRate) {
    throw new Error('Method publishFundingRateUpdate must be implemented');
  }

  async publishBatch(channel, events) {
    throw new Error('Method publishBatch must be implemented');
  }
}