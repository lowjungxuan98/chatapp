import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

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

export interface RouteContext {
  params: Promise<Record<string, string>>;
}

export type Handler<T = unknown> = (
  req: NextRequest, 
  context?: RouteContext
) => NextResponse<ApiResponse<T>> | Promise<NextResponse<ApiResponse<T>>>;

export type RequestSchema = z.ZodObject<{ 
  params: z.ZodTypeAny;
  query: z.ZodTypeAny; 
  body: z.ZodTypeAny;
}>;
