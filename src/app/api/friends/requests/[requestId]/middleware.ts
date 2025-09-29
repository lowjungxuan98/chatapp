import { GlobalMiddleware } from "@/app/api/middleware";
import { respondFriendRequestApiSchema, cancelFriendRequestApiSchema, Handler } from "@/types";

export const RespondMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(respondFriendRequestApiSchema)<T>(handler);
export const CancelMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(cancelFriendRequestApiSchema)<T>(handler);

