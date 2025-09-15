import { GlobalMiddleware } from '@/app/api/middleware';
import { sendVerificationEmailApiSchema } from '@/types';
import { Handler } from '@/types';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(sendVerificationEmailApiSchema)<T>(handler);