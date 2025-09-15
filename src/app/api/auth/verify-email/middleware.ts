import { GlobalMiddleware } from "@/app/api/middleware";
import { Handler } from "@/lib/types";
import { verifyEmailApiSchema } from "@/lib/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(verifyEmailApiSchema)<T>(handler);