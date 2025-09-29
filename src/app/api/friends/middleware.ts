import { GlobalMiddleware } from "@/app/api/middleware";
import { getFriendsApiSchema, Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(getFriendsApiSchema)<T>(handler);

