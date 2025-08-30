import { NextRequest, NextResponse } from "next/server";
import { User } from "@prisma/client";
import { z } from "zod";

export type ApiResponse<T = unknown> = | { success: true; message: string; data?: T } | { success: false; message: string; error?: unknown };
export type Handler<T = unknown> = (req: NextRequest) => NextResponse<ApiResponse<T>> | Promise<NextResponse<ApiResponse<T>>>;
export type RequestSchema = z.ZodObject<{ query: z.ZodTypeAny; body: z.ZodTypeAny }>;
export interface TokenResponse {
    token: string;
    expires: Date;
}
export interface AuthTokensResponse {
    access: TokenResponse;
    refresh?: TokenResponse;
}
export type AuthResponse = {
    user: User;
    tokens: AuthTokensResponse;
};
export default class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string | undefined, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}