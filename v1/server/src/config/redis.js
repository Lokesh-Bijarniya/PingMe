import { createClient } from "redis";

const redisClient = new createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.connect()
  .then(() => console.log("🔥 Redis Connected"))
  .catch((err) => console.error("❌ Redis Connection Failed:", err));

export default redisClient;
