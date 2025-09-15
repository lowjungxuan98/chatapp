import { GlobalMiddleware } from "@/app/api/middleware";
import { Handler } from "@/types";
import { verifyEmailApiSchema } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(verifyEmailApiSchema)<T>(handler);