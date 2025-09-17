import { NextRequest, NextResponse } from "next/server";
import { signUp } from "@/app/api/auth/register/service";
import { RouteMiddleware } from './middleware';
import { ApiResponse, ApiError } from '@/types';
import { User } from '@prisma/client';

export const POST = RouteMiddleware<User>(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const result = await signUp(body);
    return NextResponse.json<ApiResponse<User>>({
      success: true,
      message: 'User registered successfully',
      data: result
    }, { status: 201 });
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
      message: 'Registration failed',
      error: error instanceof Error ? new ApiError(500, error.message) : new ApiError(500, 'Unknown error')
    }, { status: 500 });
  }
});
