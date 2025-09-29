import { GlobalMiddleware } from "@/app/api/middleware";
import { blockUserApiSchema, Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(blockUserApiSchema)<T>(handler);

