import { NextResponse, NextRequest } from "next/server";
import { ApiResponse, Handler, RequestSchema } from "@/types";

export const GlobalMiddleware = <S extends RequestSchema>(schema: S) => <T>(handler: Handler<T>): Handler<T> => async (req: NextRequest) => {
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

    if (whitelistedPaths.includes(req.nextUrl.pathname)) {
        return handler(req);
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json<ApiResponse<T>>(
            { success: false, message: "Missing or invalid authorization header", error: new Error("Missing or invalid authorization header") },
            { status: 401 }
        );
    }

    try {
        // const token = authHeader.split(" ")[1];
        // const user = await verify(token, TokenType.ACCESS).then((res) => {
        //     if (!res.user) throw new Error("Invalid or expired token");
        //     return res.user;
        // });

        // req.user = user;
        return handler(req);
    } catch (error) {
        return NextResponse.json<ApiResponse<T>>(
            { success: false, message: "Invalid or expired token", error: error instanceof Error ? new Error(error.message) : new Error("Invalid or expired token") },
            { status: 401 }
        );
    }
};