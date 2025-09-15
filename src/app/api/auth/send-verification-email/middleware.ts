import { GlobalMiddleware } from '@/app/api/middleware';
import { sendVerificationEmailApiSchema } from '@/lib/types';
import { Handler } from '@/lib/types';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(sendVerificationEmailApiSchema)<T>(handler);