import { GlobalMiddleware } from '@/app/api/middleware';
import { forgotPasswordSchema } from '@/app/api/auth/forgot-password/validate';
import { Handler } from '@/app/api/type';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(forgotPasswordSchema)<T>(handler);
