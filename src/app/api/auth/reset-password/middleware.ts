import { GlobalMiddleware } from '@/app/api/middleware';
import { resetPasswordSchema } from '@/app/api/auth/reset-password/validate';
import { Handler } from '@/app/api/type';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(resetPasswordSchema)<T>(handler);
