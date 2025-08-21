import { setTimeout as sleep } from 'timers/promises';

const buckets = new Map();
const locks = new Map();

function withLock(key, f) {
  const prev = locks.get(key) || Promise.resolve();
  let release;
  const gate = new Promise((res) => (release = res));
  const tail = prev.then(() => gate);
  locks.set(key, tail);

  return prev.then(async () => {
    try {
      return await f();
    } finally {
      release();
      if (locks.get(key) === tail) locks.delete(key);
    }
  });
}

function now() {
  return performance.timeOrigin + performance.now();
}

function getBucket(key, rate, time, burst = rate) {
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: burst, last: now(), burst, ratePerMs: rate / time };
    buckets.set(key, b);
  }

  return b;
}

export async function acquire({ key, n = 1, rate, time, burst }) {
  if (!key) throw new Error('key is required');
  if (!(rate > 0) || !(time > 0) || !(n > 0)) throw new Error('invalid params');
  if (burst == null) burst = rate;
  if (n > burst) throw new Error('n exceeds burst capacity');

  while (true) {
    const waitMs = await withLock(key, () => {
      const b = getBucket(key, rate, time, burst);
      const t = now();
      const elapsed = Math.max(0, t - b.last);
      if (elapsed > 0) {
        const refill = elapsed * b.ratePerMs;
        b.tokens = Math.min(b.burst, b.tokens + refill);
        b.last = t;
      }
      if (b.tokens >= n) {
        b.tokens -= n;

        return 0;
      }
      const deficit = n - b.tokens;
      const waitTime = Math.ceil(deficit / b.ratePerMs);

      return waitTime;
    });

    if (waitMs <= 0) return;
    const jitter = Math.floor(waitMs * 0.05 * Math.random());
    await sleep(waitMs + jitter);
  }
}

export async function processWithLimit(
  f,
  params,
  {
    key,
    rate,
    time,
    burst = rate,
    maxConcurrent = rate,
    continueOnError = false,
  },
) {
  if (maxConcurrent <= 0) throw new Error('maxConcurrent must be > 0');
  if (maxConcurrent > burst) burst = maxConcurrent;

  const results = new Array(params.length);
  const errors = new Array(params.length);
  let i = 0;
  let active = 0;

  return new Promise((resolve, reject) => {
    const next = () => {
      if (i >= params.length && active === 0) {
        if (continueOnError) return resolve({ results, errors });

        const firstErr = errors.find(Boolean);
        return firstErr ? reject(firstErr) : resolve(results);
      }

      while (active < maxConcurrent && i < params.length) {
        const idx = i++;
        active++;
        (async () => {
          try {
            await acquire({ key, n: 1, rate, time, burst });
            results[idx] = await f(params[idx], idx);
          } catch (e) {
            errors[idx] = e;
            if (!continueOnError) throw e;
          } finally {
            active--;
            next();
          }
        })().catch(reject);
      }
    };

    next();
  });
}
