import { GlobalMiddleware } from "../../middleware";
import { loginApiSchema } from "@/types";
import { Handler } from "@/types";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(loginApiSchema)<T>(handler);