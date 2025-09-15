import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

// API Handler Types
export type Handler<T = unknown> = (req: NextRequest) => NextResponse<ApiResponse<T>> | Promise<NextResponse<ApiResponse<T>>>;
export type RequestSchema = z.ZodObject<{ query: z.ZodTypeAny; body: z.ZodTypeAny }>;

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request Config
export interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

// Error Types
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
