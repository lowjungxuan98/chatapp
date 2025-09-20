import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { logger } from "@/lib/logger";

export async function setupRedisAdapter(io: Server) {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    logger.info("No Redis URL provided, using default adapter");
    return;
  }

  try {
    const pub = createClient({ url: redisUrl });
    const sub = pub.duplicate();
    
    await Promise.all([pub.connect(), sub.connect()]);
    
    io.adapter(createAdapter(pub, sub));
    
    logger.info("Redis adapter configured successfully");
    
    // Handle Redis connection errors
    pub.on("error", (err) => {
      logger.error("Redis pub client error", err);
    });
    
    sub.on("error", (err) => {
      logger.error("Redis sub client error", err);
    });
  } catch (error) {
    logger.error("Failed to setup Redis adapter", error);
    throw error;
  }
}
