import { GlobalMiddleware } from "@/app/api/middleware";
import { getBlockListApiSchema, Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(getBlockListApiSchema)<T>(handler);

