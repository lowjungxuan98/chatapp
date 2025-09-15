import { GlobalMiddleware } from "../../middleware";
import { registerApiSchema } from "@/lib/types";
import { Handler } from "@/lib/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(registerApiSchema)<T>(handler);
