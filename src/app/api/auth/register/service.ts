import { PrismaClient } from '@prisma/client';
import { encrypt } from '@/lib/crypto';
import { ApiError } from '@/types';
import httpStatus from 'http-status';

const prisma = new PrismaClient();

export const signUp = async (data: { email: string; name: string; password: string }) => {
  const existingUser = await prisma.user.findFirst({ where: { email: data.email } });
  if (existingUser) throw new ApiError(httpStatus.CONFLICT, 'User with this email already exists');

  const hashedPassword = await encrypt(data.password);
  return await prisma.user.create({
    data: { email: data.email, name: data.name, password: hashedPassword }
  });
};