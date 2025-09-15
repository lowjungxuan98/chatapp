import { NextResponse, NextRequest } from "next/server";
import { RouteMiddleware } from "@/app/api/auth/verify-email/middleware";
import { ApiError, ApiResponse } from "@/lib/types";
import httpStatus from "http-status";
import { verifyEmail } from "./service";

export const POST = RouteMiddleware<never>(async (request: NextRequest) => {
    try {
        const token = request.nextUrl.searchParams.get('token');
        if (!token) throw new ApiError(httpStatus.BAD_REQUEST, 'Token is required');
        await verifyEmail(token);
        return NextResponse.json<ApiResponse<never>>({
            success: true,
            message: 'Email verified'
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
        message: 'Failed to verify email'
    }, { status: 500 });
    }
});