import { GlobalMiddleware } from "@/app/api/middleware";
import { removeFriendApiSchema, Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(removeFriendApiSchema)<T>(handler);

