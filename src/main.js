import pg from 'pg';
import Redis from 'ioredis';
import { config } from './shared/config.js';

import { init as initOiPoller } from './application/services/oi-poller-service.js';
import { init as initNormalizer } from './application/services/data-normalizer.js';

import { init as initBinance } from './infrastructure/data-providers/binance.js';
import { init as redisServiceInit } from './infrastructure/cache/redis.js';
import { init as initBybitWs } from './infrastructure/ws/bybit-client.js';
import { init as initBinanceWs } from './infrastructure/ws/binance-client.js';
import { init as batchPublisherInit } from './shared/utils/batch-publisher.js';
import { RedisMarketDataRepository } from './infrastructure/repositories/RedisMarketDataRepository.js';
import { RedisEventPublisher } from './infrastructure/publishers/RedisEventPublisher.js';

const redisClient = new Redis(config.publisher);
const redis = redisServiceInit(redisClient);
const pool = new pg.Pool(config.pg);
const batchPublisher = batchPublisherInit(redis);

const marketDataRepository = new RedisMarketDataRepository(redis);
const eventPublisher = new RedisEventPublisher(batchPublisher);

const normalizer = initNormalizer();

const binanceProvider = initBinance();

const binanceOiPoller = initOiPoller(
  binanceProvider,
  normalizer,
  marketDataRepository,
  eventPublisher,
);

const bybitWs = initBybitWs(marketDataRepository, eventPublisher, normalizer);

const binanceWs = initBinanceWs(
  marketDataRepository,
  eventPublisher,
  normalizer,
);

console.log('Starting market data listeners...');

bybitWs.start();
binanceWs.start();
binanceOiPoller.start();

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');

  try {
    await bybitWs.stop();
    await binanceWs.stop();
    await redisClient.quit();
    await pool.end();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }

  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.kill(process.pid, 'SIGINT');
});

console.log('Market data screener started successfully');
