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
    return NextResponse.json<ApiResponse<string>>({
      success: false,
      message: 'Failed to process password reset request',
      error: error
    }, { status: 500 });
  }
});