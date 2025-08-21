import { IEventPublisher } from '../../domain/repositories/IEventPublisher.js';
import { CONSTANTS } from '../../shared/constants.js';

export class RedisEventPublisher extends IEventPublisher {
  constructor(batchPublisher) {
    super();
    this._batchPublisher = batchPublisher;
  }

  async publishOpenInterestUpdate(openInterest) {
    const channel = CONSTANTS.PUBLISHER.CHANELS.OI_UPDATE;
    await this._batchPublisher.publish(channel, {
      type: 'open_interest_update',
      data: openInterest,
      timestamp: Date.now(),
    });
  }

  async publishPriceUpdate(price) {
    const channel = CONSTANTS.PUBLISHER.CHANELS.PRICE_UPDATE;
    await this._batchPublisher.publish(channel, {
      type: 'price_update',
      data: price,
      timestamp: Date.now(),
    });
  }

  async publishFundingRateUpdate(fundingRate) {
    const channel = CONSTANTS.PUBLISHER.CHANELS.FUNDING_RATE_UPDATE;
    await this._batchPublisher.publish(channel, {
      type: 'funding_rate_update',
      data: fundingRate,
      timestamp: Date.now(),
    });
  }

  async publishBatch(channel, events) {
    for (const event of events) {
      await this._batchPublisher.publish(channel, event);
    }
  }
}
