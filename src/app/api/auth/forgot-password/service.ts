import { prisma } from '@/lib/config/prisma';
import { sendResetPasswordEmail } from '@/lib/email';
import { createHash, randomBytes } from "crypto";

export const forgotPassword = async (email: string, host: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  
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