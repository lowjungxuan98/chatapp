import { PrismaClient } from '@prisma/client';
import { generateResetPasswordToken } from '@/lib/jwt';
import { sendResetPasswordEmail } from '@/lib/email';
import { ApiError } from '@/lib/types';
import httpStatus from 'http-status';

const prisma = new PrismaClient();

export const forgotPassword = async (email: string, host: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  const resetToken = await generateResetPasswordToken(email);
  await sendResetPasswordEmail(email, resetToken, host);
  return resetToken;
};