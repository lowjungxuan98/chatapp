import { GlobalMiddleware } from '@/app/api/middleware';
import { forgotPassword } from '@/app/api/auth/forgot-password/validate';
import { Handler } from '@/app/api/type';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(forgotPassword)<T>(handler);
