import { GlobalMiddleware } from "@/app/api/middleware";
import { Handler } from "@/app/api/type";
import { verifyEmailSchema } from "@/app/api/auth/verify-email/validate";

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(verifyEmailSchema)<T>(handler);