import { GlobalMiddleware } from '@/app/api/middleware';
import { sendVerificationEmailSchema } from '@/app/api/auth/send-verification-email/validate';
import { Handler } from '@/app/api/type';

export const RouteMiddleware = <T>(handler: Handler<T>) => 
  GlobalMiddleware(sendVerificationEmailSchema)<T>(handler);