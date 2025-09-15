import { NextRequest, NextResponse } from 'next/server';
import { login } from './service';
import { RouteMiddleware } from './middleware';
import { ApiResponse, AuthResponse, ApiError } from '@/lib/types';
import { generateAuthTokens } from '@/lib/jwt';

export const POST = RouteMiddleware<AuthResponse>(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const result = await login(body.email, body.password);    
    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      message: 'Login successful',
      data: {
        user: result,
        tokens: await generateAuthTokens(result)
      }
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
      error: error
    }, { status: 500 });
  }
});