import { createClient } from "redis";

const redisClient = createClient();
redisClient.connect()
  .then(() => console.log("🔥 Redis Connected"))
  .catch((err) => console.error("❌ Redis Connection Failed:", err));

export default redisClient;
