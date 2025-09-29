import { prisma } from '@/lib/config/prisma';
import { encrypt } from '@/lib/crypto';

export const signUp = async (data: { email: string; name: string; password: string }) => {
  const existingUser = await prisma.user.findFirst({ where: { email: data.email } });
  if (existingUser) throw new Error('User with this email already exists');

  const hashedPassword = await encrypt(data.password);
  return await prisma.user.create({
    data: { email: data.email, name: data.name, password: hashedPassword }
  });
};