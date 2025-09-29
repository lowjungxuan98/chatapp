import { GlobalMiddleware } from "@/app/api/middleware";
import { getPendingRequestsApiSchema, Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(getPendingRequestsApiSchema)<T>(handler);

