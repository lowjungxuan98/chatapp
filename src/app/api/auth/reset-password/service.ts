import { PrismaClient, TokenType } from '@prisma/client';
import { encrypt } from '@/app/api/crypto';
import ApiError from '@/app/api/type';
import httpStatus from 'http-status';
import { verify } from '@/app/api/jwt';

const prisma = new PrismaClient();

const resetPassword = async (resetPasswordToken: string, password: string): Promise<void> => {
  const { user, token } = await verify(resetPasswordToken, TokenType.RESET_PASSWORD);
  if (!token) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  const encryptedPassword = await encrypt(password);
  await prisma.user.update({ where: { id: user.id }, data: { password: encryptedPassword } });
  await prisma.token.deleteMany({ where: { userId: user.id, type: TokenType.RESET_PASSWORD } });
};

export { resetPassword };
