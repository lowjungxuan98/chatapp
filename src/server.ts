import { createServer } from "node:http";
import next from "next";
import { server } from "@/socket";
import { logger } from "@/lib/logger";

const app = next({ 
  dev: process.env.NODE_ENV !== "production",
  turbo: true,
  turbopack: true,
});
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);
  await server(httpServer);
  httpServer
    .once("error", (err) => {
      logger.error("HTTP server error", err);
      process.exit(1);
    })
    .listen(process.env.PORT || 3000, () => {
      logger.info(`Server ready on http://localhost:${process.env.PORT || 3000}`);
    });
});
