import { Redis } from '@upstash/redis';


let redisClient;
let isRedisReady = false;

try {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  isRedisReady = true;
  console.log('Redis (Upstash) client initialized successfully');
} catch (err) {
  console.error('Failed to initialize Redis client:', err.message);
  isRedisReady = false;
}

const redisWrapper = {
  get isReady() {
    return isRedisReady;
  },

  async get(key) {
    try {
      const data = await redisClient.get(key);
      if (data !== null && data !== undefined) {
        return typeof data === 'string' ? data : JSON.stringify(data);
      }
      return null;
    } catch (err) {
      console.error('Redis GET error:', err.message);
      return null;
    }
  },

  async setEx(key, ttl, value) {
    try {
      await redisClient.set(key, value, { ex: ttl });
    } catch (err) {
      console.error('Redis SET error:', err.message);
    }
  },
};

export default redisWrapper;
