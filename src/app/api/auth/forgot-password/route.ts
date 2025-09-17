import { NextResponse, NextRequest } from 'next/server';
import { ApiResponse, ApiError } from '@/types';
import { RouteMiddleware } from './middleware';
import { forgotPassword } from './service';

export const POST = RouteMiddleware<string>(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const resetToken = await forgotPassword(body.email, request.nextUrl.origin);
    return NextResponse.json<ApiResponse<string>>({
      success: true,
      message: 'Password reset email sent successfully',
      data: resetToken
    }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json<ApiResponse<string>>({
        success: false,
        message: error.message,
        error: error
      }, { status: error.statusCode });
    }
    
    return NextResponse.json<ApiResponse<string>>({
      success: false,
      message: 'Failed to process password reset request',
      error: error instanceof Error ? new ApiError(500, error.message) : new ApiError(500, 'Unknown error')
    }, { status: 500 });
  }
});