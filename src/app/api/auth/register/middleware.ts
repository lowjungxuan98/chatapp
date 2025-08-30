import { GlobalMiddleware } from "../../middleware";
import { registerSchema } from "./validate";
import { Handler } from "../../type";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(registerSchema)<T>(handler);
