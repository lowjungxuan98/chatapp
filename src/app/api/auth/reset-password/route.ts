import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from './service';
import { RouteMiddleware } from './middleware';
import { ApiResponse, ApiError } from '@/types';
import { User } from '@prisma/client';

export const POST = RouteMiddleware<User>(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const token = url.searchParams.get('token')?.split('.')[0];
    if (!token) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        message: 'Reset token is required',
        error: new ApiError(400, 'Missing token parameter')
      }, { status: 400 });
    }

    const result = await resetPassword(token, body.password);
    
    return NextResponse.json<ApiResponse<User>>({
      success: true,
      message: 'Password reset successful',
      data: result
    }, { status: 200 });
  } catch (error) {    
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      message: 'Password reset failed',
      error: error
    }, { status: 500 });
  }
});
