import { GlobalMiddleware } from "../../middleware";
import { login } from "./validate";
import { Handler } from "../../type";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(login)<T>(handler);