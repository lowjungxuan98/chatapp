import { GlobalMiddleware } from '@/app/api/middleware';
import { resetPasswordApiSchema } from '@/types';
import { Handler } from '@/types';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(resetPasswordApiSchema)<T>(handler);
