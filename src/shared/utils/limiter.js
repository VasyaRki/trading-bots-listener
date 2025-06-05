/** @typedef {import('./types').Utils} Utils */

import { setTimeout } from 'timers/promises';

/** @type {Record<string, { used: number, expiresAt: number }>} */
const registry = {};

/** @type {Utils['requestLimiter']} */
export const requestLimiter = async ({ key, rate, time }) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const expired = !registry[key] || registry[key].expiresAt <= Date.now();
    if (expired) registry[key] = { used: 0, expiresAt: Date.now() + time };

    const limit = registry[key];
    limit.used += 1;

    if (limit.used < rate) break;

    const resetIn = limit.expiresAt - Date.now();
    console.log(`Awaiting ${resetIn / 1000}s for "${key}" limit reset...`);

    await setTimeout(resetIn);
  }
};

/** @type {Utils['requestMultiLimiter']} */
export const requestMultiLimiter = (configs) =>
  Promise.all(configs.map((c) => requestLimiter(c)));
