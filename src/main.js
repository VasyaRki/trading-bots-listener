import pg from 'pg';
import Redis from 'ioredis';
import { config } from './shared/config.js';
import { init as initOiPoller } from './application/services/oi-poller-service.js';
import { init as initBinance } from './infrastructure/data-providers/binance.js';
import { init as initNormalizer } from './application/services/data-normalizer.js';
import { init as redisServiceInit } from './infrastructure/cache/redis.js';
import { init as initSymbols } from './infrastructure/repositories/symbols/main.js';
import { init as initBybitWs } from './infrastructure/ws/bybit-client.js';
import { init as initBinanceWs } from './infrastructure/ws/binance-client.js';
import { init as buthcPublisherInit } from './shared/utils/batch-publisher.js';

const redisClient = new Redis(config.publisher);
const redis = redisServiceInit(redisClient);
const binanceProvider = initBinance();
const normalizer = initNormalizer();
const binanceOiPoller = initOiPoller(binanceProvider, normalizer, redis);
const pool = new pg.Pool(config.pg);
const buthcPublisher = buthcPublisherInit(redis);

const symbolsRepo = initSymbols(pool);
// const symbols = await symbolsRepo.getSymbols();

// (() =>
//   binanceOiPoller.poll(
//     [{ symbol: 'BTCUSDT' }, { symbol: 'ETHUSDT' }].map(
//       (symbol) => symbol.symbol,
//     ),
//   ))();

const bybitWs = initBybitWs(buthcPublisher);
bybitWs.start();

const binanceWs = initBinanceWs(buthcPublisher);
binanceWs.start();
