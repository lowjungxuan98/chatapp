import { PrismaClient } from '@prisma/client';
import { verify } from '@/app/api/crypto';
import ApiError from '@/app/api/type';
import httpStatus from 'http-status';

const prisma = new PrismaClient();

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  if (!user.password) throw new ApiError(httpStatus.BAD_REQUEST, 'User has no password');
  
  const isPasswordValid = await verify(user.password, password);
  if (!isPasswordValid) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid password');
  
  return user;
};