import logger from "@/common/utils/logging/logger";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_PUBLIC_URL || process.env.REDIS_URL;
const isDevelopment = process.env.NODE_ENV === "development";

if (!REDIS_URL && !isDevelopment) {
  logger.error("Redis URL is not configured");
  process.exit(1);
} else if (!REDIS_URL && isDevelopment) {
  logger.warn(
    "Redis URL is not configured in development mode, using dummy client"
  );
}

if (REDIS_URL) {
  logger.info("Connecting to Redis:", REDIS_URL.replace(/\/\/.*@/, "//*****@"));
}

// Create a dummy Redis client for development if no Redis URL is provided
const createDummyClient = () => {
  const dummyClient = {
    on: () => dummyClient,
    ping: async () => "PONG",
    quit: async () => "OK",
    // Add other commonly used methods that return empty/mock responses
    get: async () => null,
    set: async () => "OK",
    del: async () => 1,
    // Add other required methods as needed
  };
  return dummyClient as unknown as Redis;
};

const redis = REDIS_URL
  ? new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        logger.info(`Retrying Redis connection in ${delay}ms...`);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    })
  : createDummyClient();

// Only set up event handlers if we have a real Redis client
if (REDIS_URL) {
  // Handle connection events
  redis.on("connect", () => {
    logger.info("Redis connected successfully");
  });

  redis.on("ready", () => {
    logger.info("Redis client is ready");
  });

  redis.on("error", (error) => {
    logger.error("Redis connection error:", error.message);
  });

  redis.on("close", () => {
    logger.warn("Redis connection closed");
  });

  // Verify connection on startup
  const verifyConnection = async () => {
    try {
      await redis.ping();
      logger.info("Redis ping successful");
    } catch (error) {
      if (isDevelopment) {
        logger.warn(
          "Redis ping failed in development mode, continuing anyway:",
          error
        );
      } else {
        logger.error("Redis ping failed:", error);
        process.exit(1);
      }
    }
  };

  verifyConnection();
}

process.on("SIGTERM", async () => {
  if (REDIS_URL) {
    await redis.quit();
  }
});

export default redis;
