import { NextResponse, NextRequest } from 'next/server';
import { RouteMiddleware } from './middleware';
import { ApiResponse } from '@/app/api/type';
import ApiError from '@/app/api/type';
import { generateVerifyEmailToken } from '@/app/api/jwt';
import { sendVerificationEmail } from '@/app/api/email';
import httpStatus from 'http-status';

export const POST = RouteMiddleware<string>(async (request: NextRequest) => {
    try {
        const user = request.user;
        if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
        const token = await generateVerifyEmailToken(user);
        await sendVerificationEmail(user.email, token);
        return NextResponse.json<ApiResponse<string>>({
            success: true,
            message: 'Verification email sent',
            data: token
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
            message: 'Failed to send verification email',
            error: error
        }, { status: 500 });
    }
});