import { GlobalMiddleware } from '@/app/api/middleware';
import { forgotPasswordApiSchema } from '@/types';
import { Handler } from '@/types';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(forgotPasswordApiSchema)<T>(handler);
