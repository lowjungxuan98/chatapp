import { GlobalMiddleware } from "@/app/api/middleware";
import { sendFriendRequestApiSchema, Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(sendFriendRequestApiSchema)<T>(handler);

