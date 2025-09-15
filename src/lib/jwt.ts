import { SignJWT, jwtVerify } from 'jose'
import { TokenType, User, Token } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { ApiError, AuthTokensResponse } from '@/types';
import httpStatus from 'http-status';

const ALG = 'HS256' as const
const ISS = process.env.JWT_ISSUER ?? 'chatapp'
const AUD = process.env.JWT_AUDIENCE ?? 'chatapp-users'

// JWT expiration times from environment variables
const ACCESS_EXPIRATION_MINUTES = parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES ?? '30')
const REFRESH_EXPIRATION_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS ?? '30')
const RESET_PASSWORD_EXPIRATION_MINUTES = parseInt(process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES ?? '10')
const VERIFY_EMAIL_EXPIRATION_MINUTES = parseInt(process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES ?? '10')

const raw = process.env.JWT_SECRET
const secret = new TextEncoder().encode(raw)
const prisma = new PrismaClient();

const sign = async (user: User, expirationMinutes: number = ACCESS_EXPIRATION_MINUTES) => {
  const jwt = new SignJWT(user)
    .setProtectedHeader({ alg: ALG, typ: 'JWT' })
    .setIssuer(ISS)
    .setAudience(AUD)
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${expirationMinutes}m`)
  return jwt.sign(secret)
}

const verify = async (token: string, type: TokenType): Promise<{ user?: User, token?: Token }> => {
  const { payload } = await jwtVerify(token, secret, {
    issuer: ISS,
    audience: AUD,
    algorithms: [ALG],
  })
  if (typeof payload.sub !== 'string') throw new ApiError(httpStatus.BAD_REQUEST, 'Token missing required claims')
  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) }
  });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  let tokenData = undefined;
  if (type !== TokenType.ACCESS) {
    const data = await prisma.token.findFirst({
      where: { token, type, userId: Number(payload.sub), blacklisted: false }
    });
    if (!data) throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
    tokenData = data;
  }
  return { user: user, token: tokenData };
}

const saveToken = async (
  token: string,
  userId: number,
  expires: Date,
  type: TokenType,
  blacklisted = false
): Promise<Token> => {
  const createdToken = await prisma.token.create({
    data: {
      token,
      userId: userId,
      expires: expires,
      type,
      blacklisted
    }
  });
  return createdToken;
};

const generateAuthTokens = async (user: User): Promise<AuthTokensResponse> => {
  const accessToken = await sign(user, ACCESS_EXPIRATION_MINUTES);
  const refreshToken = await sign(user, REFRESH_EXPIRATION_DAYS * 24 * 60);
  const refreshTokenExpiry = new Date(Date.now() + REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
  await saveToken(refreshToken, user.id, refreshTokenExpiry, TokenType.REFRESH, false);

  return {
    access: {
      token: accessToken,
      expires: new Date(Date.now() + ACCESS_EXPIRATION_MINUTES * 60 * 1000)
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpiry
    }
  };
}

const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  const resetPasswordToken = await sign(user, RESET_PASSWORD_EXPIRATION_MINUTES);
  const resetPasswordTokenExpiry = new Date(Date.now() + RESET_PASSWORD_EXPIRATION_MINUTES * 60 * 1000);
  await saveToken(resetPasswordToken, user.id, resetPasswordTokenExpiry, TokenType.RESET_PASSWORD, false);
  return resetPasswordToken;
}

const generateVerifyEmailToken = async (user: User): Promise<string> => {
  const verifyEmailToken = await sign(user, VERIFY_EMAIL_EXPIRATION_MINUTES);
  const verifyEmailTokenExpiry = new Date(Date.now() + VERIFY_EMAIL_EXPIRATION_MINUTES * 60 * 1000);
  await saveToken(verifyEmailToken, user.id, verifyEmailTokenExpiry, TokenType.VERIFY_EMAIL, false);
  return verifyEmailToken;
}

export {
  sign,
  verify,
  saveToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken
}