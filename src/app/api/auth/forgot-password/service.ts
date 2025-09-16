import { PrismaClient } from '@prisma/client';
import { sendResetPasswordEmail } from '@/lib/email';
import { ApiError } from '@/types';
import httpStatus from 'http-status';
import { createHash, randomBytes } from "crypto";

const prisma = new PrismaClient();

export const forgotPassword = async (email: string, host: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  const resetToken = `${hash}.${raw}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hash,
      expires: expiresAt,
    },
  });
  await sendResetPasswordEmail(email, resetToken, host);
  return resetToken;
};