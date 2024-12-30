const { createClient } = require('redis');
const dotenv = require('dotenv');
const dev = require('./config');  // Use require here

dotenv.config();

const redisClient = createClient({
  url: dev.db.radisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
  console.log(dev.db.radisUrl);
  try {
    await redisClient.connect();
    console.log("Connected to Redis...");
    await redisClient.flushAll();
  } catch (error) {
    console.error("Redis connection error:", error);
    process.exit(1);
  }
};

module.exports = { redisClient, connectRedis };
