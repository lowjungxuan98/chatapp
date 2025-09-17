import { NextRequest, NextResponse } from 'next/server';
import { login } from './service';
import { RouteMiddleware } from './middleware';
import { ApiResponse, ApiError } from '@/types';
import { User } from '@prisma/client';

export const POST = RouteMiddleware<User>(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const result = await login(body.email, body.password);    
    return NextResponse.json<ApiResponse<User>>({
      success: true,
      message: 'Login successful',
      data: result
    }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        message: error.message,
        error: error
      }, { status: error.statusCode });
    }
    
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? new ApiError(500, error.message) : new ApiError(500, 'Unknown error')
    }, { status: 500 });
  }
});