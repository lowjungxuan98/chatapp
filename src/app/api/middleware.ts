import { NextResponse, NextRequest } from "next/server";
import { ApiResponse, Handler, RequestSchema, RouteContext } from "@/types";
import { auth } from '@/lib/config/next.auth';

export const GlobalMiddleware = <S extends RequestSchema>(schema: S) => <T>(handler: Handler<T>): Handler<T> => async (req: NextRequest, context?: RouteContext) => {
    const whitelistedPaths = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/auth/verify-email",
    ];

    const queryParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsedQuery = schema.shape.query.safeParse(queryParams);
    if (!parsedQuery.success) {
        return NextResponse.json<ApiResponse<T>>(
            { success: false, message: "Invalid request query", error: new Error("Invalid request query") },
            { status: 400 }
        );
    }

    let body = {};
    try {
        body = await req.clone().json();
    } catch {
        body = {}
    }
    
    const parsedBody = schema.shape.body.safeParse(body);
    if (!parsedBody.success) {
        return NextResponse.json<ApiResponse<T>>(
            { success: false, message: "Invalid request body", error: new Error("Invalid request body") },
            { status: 400 }
        );
    }

    const params = await context?.params;
    const parsedParams = schema.shape.params.safeParse(params);
    if (!parsedParams.success && params) {
        return NextResponse.json<ApiResponse<T>>(
            { success: false, message: "Invalid request params", error: new Error("Invalid request params") },
            { status: 400 }
        );
    }

    if (whitelistedPaths.includes(req.nextUrl.pathname)) {
        return handler(req, context);
    }

    // const authHeader = req.headers.get("authorization");
    const session = await auth();
    req.user = session?.user;
    if (!session) {
        return NextResponse.json<ApiResponse<T>>(
            { success: false, message: "Unauthorized", error: new Error("Unauthorized") },
            { status: 401 }
        );
    }

    try {
        return handler(req, context);
    } catch (error) {
        return NextResponse.json<ApiResponse<T>>(
            { success: false, message: "Invalid or expired token", error: error instanceof Error ? new Error(error.message) : new Error("Invalid or expired token") },
            { status: 401 }
        );
    }
};