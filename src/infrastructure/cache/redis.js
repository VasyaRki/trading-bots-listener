export const init = (redis) => {
  return {
    zadd: async (key, ttl) => {
      const currentTimestamp = Math.floor(Date.now() / 1000);

      await redis.zadd(key, currentTimestamp, `${currentTimestamp}`);

      await redis.zremrangebyscore(key, 0, currentTimestamp - ttl);
    },

    zcount: async (key, ttl) => {
      const currentTimestamp = Math.floor(Date.now() / 1000);

      const count = await redis.zcount(
        key,
        currentTimestamp - ttl,
        currentTimestamp,
      );

      return count;
    },

    publish: async (chanel, message) => {
      await redis.publish(chanel, message);
    },

    lpushLimit: async (key, value, maxLength = 180) => {
      const serialized =
        typeof value === 'string' ? value : JSON.stringify(value);
      await redis.lpush(key, serialized);
      await redis.ltrim(key, 0, maxLength - 1);
    },

    getRecentOI: async (symbol) => {
      const key = `OI:${symbol}`;
      const raw = await redis.lrange(key, 0, -1);
      return raw.map((r) => JSON.parse(r));
    },
  };
};
