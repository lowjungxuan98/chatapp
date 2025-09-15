import { GlobalMiddleware } from '@/app/api/middleware';
import { resetPasswordApiSchema } from '@/lib/types';
import { Handler } from '@/lib/types';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(resetPasswordApiSchema)<T>(handler);
