import { GlobalMiddleware } from "@/app/api/middleware";
import { registerApiSchema } from "@/types";
import { Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(registerApiSchema)<T>(handler);
