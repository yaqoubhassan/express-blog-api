const Redis = require("ioredis");
const redis = new Redis();

const cacheMiddleware = async (req, res, next) => {
  if (process.env.USE_CACHE !== "true") {
    return next(); // Skip cache if disabled
  }

  const key = req.originalUrl; // Unique cache key based on the request URL

  const cachedData = await redis.get(key);
  if (cachedData) {
    return res.status(200).json(JSON.parse(cachedData));
  }

  res.sendResponse = res.send;
  res.send = (body) => {
    redis.set(key, body, "EX", 3600); // Cache for 1 hour
    res.sendResponse(body);
  };

  next();
};

const closeRedisConnection = async () => {
  if (redis) {
    await redis.quit();
  }
};

module.exports = { cacheMiddleware, redis, closeRedisConnection };
