import { GlobalMiddleware } from '@/app/api/middleware';
import { forgotPasswordApiSchema } from '@/lib/types';
import { Handler } from '@/lib/types';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(forgotPasswordApiSchema)<T>(handler);
