import { GlobalMiddleware } from "../../middleware";
import { loginApiSchema } from "@/lib/types";
import { Handler } from "@/lib/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(loginApiSchema)<T>(handler);