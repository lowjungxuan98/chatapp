import { prisma } from '@/lib/config/prisma';
import { verify } from '@/lib/crypto';

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  if (!user.password) throw new Error('User has no password');
  
  const isPasswordValid = await verify(user.password, password);
  if (!isPasswordValid) throw new Error('Invalid password');
  
  return user;
};