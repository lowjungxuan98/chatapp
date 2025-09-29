import { prisma } from '@/lib/config/prisma';
import { encrypt } from '@/lib/crypto';

export const resetPassword = async (token: string, newPassword: string) => {
 
 const verificationToken = await prisma.verificationToken.findFirst({
    where: { token: token },
  });
  
  if (!verificationToken) {
    throw new Error('Invalid or expired reset token');
  }

  const email = verificationToken.identifier;
  const password = await encrypt(newPassword);
  const [updatedUser] = await Promise.all([
    prisma.user.update({
      where: { email },
      data: { password },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: verificationToken.token,
        },
      },
    }),
  ]);

  return updatedUser;
};
