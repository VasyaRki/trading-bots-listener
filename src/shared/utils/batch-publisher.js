export const init = (redis, interval = 1000) => {
  const buffers = new Map();

  const flushAll = () => {
    for (const [channel, buffer] of buffers.entries()) {
      if (buffer.length > 0) {
        redis.publish(channel, JSON.stringify(buffer.splice(0)));
      }
    }
  };

  setInterval(flushAll, interval);

  const publish = (channel, data) => {
    if (!buffers.has(channel)) {
      buffers.set(channel, []);
    }
    buffers.get(channel).push(data);
  };

  return {
    publish,
    flushAll,
  };
};
