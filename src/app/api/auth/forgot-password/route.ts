import { NextResponse, NextRequest } from 'next/server';
import { ApiResponse } from '@/app/api/type';
import { RouteMiddleware } from './middleware';
import { forgotPassword } from './service';
import ApiError from '@/app/api/type';

export const POST = RouteMiddleware<String>(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const resetToken = await forgotPassword(body.email);
    return NextResponse.json<ApiResponse<String>>({
      success: true,
      message: 'Password reset email sent successfully',
      data: resetToken
    }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json<ApiResponse<String>>({
        success: false,
        message: error.message,
        error: error
      }, { status: error.statusCode });
    }
    
    return NextResponse.json<ApiResponse<String>>({
      success: false,
      message: 'Failed to process password reset request',
      error: error
    }, { status: 500 });
  }
});