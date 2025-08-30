// types/global.d.ts
import type { User } from '@prisma/client';

declare module 'next/server' {
  interface NextRequest {
    user?: User; // make optional so plain NextRequest stays assignable
  }
}