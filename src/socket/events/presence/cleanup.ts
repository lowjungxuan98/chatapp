import { logger } from "@/lib/logger";
import { activeUsers } from "./connection";

export function registerPresenceCleanupEvents() {
  setInterval(() => {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000;
    
    for (const [socketId, user] of activeUsers.entries()) {
      if (now.getTime() - user.lastSeen.getTime() > staleThreshold) {
        activeUsers.delete(socketId);
        logger.info("Removed stale user presence", { username: user.username, socketId });
      }
    }
  }, 60000);
}
