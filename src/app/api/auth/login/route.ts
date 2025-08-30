import { NextRequest, NextResponse } from 'next/server';
import { login } from './service';
import { RouteMiddleware } from './middleware';
import { ApiResponse } from '../../type';
import { AuthResponse } from '../../type';
import { generateAuthTokens } from '../../jwt';
import ApiError from '../../type';

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
        message: error.message
      }, { status: error.statusCode });
    }
    
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      message: 'Login failed'
    }, { status: 500 });
  }
});