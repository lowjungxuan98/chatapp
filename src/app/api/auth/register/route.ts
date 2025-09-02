import { NextRequest, NextResponse } from "next/server";
import { signUp } from "@/app/api/auth/register/service";
import { RouteMiddleware } from './middleware';
import { ApiResponse } from '@/app/api/type';
import { AuthResponse } from '../../type';
import { generateAuthTokens } from '../../jwt';
import ApiError from '../../type';

export const POST = RouteMiddleware<AuthResponse>(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const result = await signUp(body);
    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result,
        tokens: await generateAuthTokens(result)
      }
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
      error: error
    }, { status: 500 });
  }
});
