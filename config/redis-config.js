const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: () => 1000
});

client.on('connect', () => console.log('connected to Redis'));

client.on('error', err => {
  console.error(err);
});

module.exports = client;
