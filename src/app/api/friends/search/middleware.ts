import { GlobalMiddleware } from "@/app/api/middleware";
import { searchUserApiSchema } from "@/types/friend/search-user";
import type { Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(searchUserApiSchema)<T>(handler);

