import { PrismaClient, TokenType } from "@prisma/client";
import { verify } from "@/lib/jwt";
import { ApiError } from "@/lib/types";
import httpStatus from "http-status";

const prisma = new PrismaClient();

const verifyEmail = async (token: string): Promise<void> => {
    try {
        const tokenData = await verify(token, TokenType.VERIFY_EMAIL);
        if (!tokenData.user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        await prisma.token.deleteMany({
            where: { userId: tokenData.user.id, type: TokenType.VERIFY_EMAIL }
        });
        await prisma.user.update({
            where: { id: tokenData.user.id },
            data: { isEmailVerified: true }
        });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to verify email');
    }
}

export { verifyEmail };