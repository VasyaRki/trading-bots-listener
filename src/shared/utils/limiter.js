/** @typedef {import('./types').Utils} Utils */

import { setTimeout } from 'timers/promises';

/** @type {Record<string, { used: number, expiresAt: number }>} */
const registry = {};

/** @type {Utils['requestLimiter']} */
export const requestLimiter = async ({ key, rate, time, used }) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const expired = !registry[key] || registry[key].expiresAt <= Date.now();
    if (expired) registry[key] = { used: 0, expiresAt: Date.now() + time };

    const limit = registry[key];

    if (limit.used <= rate) {
      limit.used += used || 1;
      break;
    }

    const resetIn = limit.expiresAt - Date.now();
    console.log(`Awaiting ${resetIn / 1000}s for "${key}" limit reset...`);

    if (resetIn > 0) await setTimeout(resetIn);
  }
};

/** @type {Utils['requestMultiLimiter']} */
export const requestMultiLimiter = (configs) =>
  Promise.all(configs.map((c) => requestLimiter(c)));
