import { GlobalMiddleware } from "../../middleware";
import { register } from "./validate";
import { Handler } from "../../type";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(register)<T>(handler);
