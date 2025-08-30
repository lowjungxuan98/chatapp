import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/app/api/type';
import { RouteMiddleware } from '@/app/api/auth/reset-password/middleware';
import { resetPassword } from '@/app/api/auth/reset-password/service';
import ApiError from '@/app/api/type';

export const POST = RouteMiddleware<void>(async (request: NextRequest) => {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const body = await request.json();
    if (!token) {
      return NextResponse.json<ApiResponse<void>>({
        success: false,
        message: 'Token is required'
      }, { status: 400 });
    }
    await resetPassword(token, body.password);
    
    return NextResponse.json<ApiResponse<void>>({
      success: true,
      message: 'Password reset successfully'
    }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json<ApiResponse<void>>({
        success: false,
        message: error.message
      }, { status: error.statusCode });
    }
    
    return NextResponse.json<ApiResponse<void>>({
      success: false,
      message: 'Failed to reset password'
    }, { status: 500 });
  }
});
