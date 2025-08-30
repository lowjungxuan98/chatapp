import { GlobalMiddleware } from "../../middleware";
import { loginSchema } from "./validate";
import { Handler } from "../../type";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(loginSchema)<T>(handler);