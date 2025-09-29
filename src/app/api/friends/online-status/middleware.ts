import { GlobalMiddleware } from "@/app/api/middleware";
import { onlineStatusApiSchema } from "@/types/friend/online-status";
import type { Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(onlineStatusApiSchema)<T>(handler);

