import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

export type ApiResponse<T> = {
  success: true;
  message?: string;
  data: T;
} | {
  success: false;
  message: string;
  error?: unknown;
};

export type Handler<T = unknown> = (req: NextRequest) => NextResponse<ApiResponse<T>> | Promise<NextResponse<ApiResponse<T>>>;
export type RequestSchema = z.ZodObject<{ query: z.ZodTypeAny; body: z.ZodTypeAny }>;
