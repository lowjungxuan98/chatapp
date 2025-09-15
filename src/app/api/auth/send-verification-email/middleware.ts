import { GlobalMiddleware } from '@/app/api/middleware';
import { sendVerificationEmail } from '@/app/api/auth/send-verification-email/validate';
import { Handler } from '@/app/api/type';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(sendVerificationEmail)<T>(handler);