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
  error?: ApiError | unknown;
};

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'ApiError';
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export type Handler<T = unknown> = (req: NextRequest) => NextResponse<ApiResponse<T>> | Promise<NextResponse<ApiResponse<T>>>;
export type RequestSchema = z.ZodObject<{ query: z.ZodTypeAny; body: z.ZodTypeAny }>;
