import { z } from 'zod';
import { User } from '@prisma/client';

// Reusable password schema
const passwordSchema = z
  .string()
  .min(1, { message: 'Password is required' })
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/(?=.*\d)/, { message: 'Password must contain at least one number' });

// Request Schemas
export const loginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50, { message: 'Name must be less than 50 characters' }),
    email: z.email({ message: 'Please enter a valid email address' }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const sendVerificationEmailSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
});

// API Validation Schemas (for backend routes)
export const loginApiSchema = z.object({
  query: z.object({}),
  body: loginSchema,
});

export const registerApiSchema = z.object({
  query: z.object({}),
  body: registerSchema,
});

export const forgotPasswordApiSchema = z.object({
  query: z.object({}),
  body: forgotPasswordSchema,
});

export const resetPasswordApiSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
  body: resetPasswordSchema,
});

export const verifyEmailApiSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
  body: z.object({}),
});

export const sendVerificationEmailApiSchema = z.object({
  query: z.object({}),
  body: sendVerificationEmailSchema,
});

// Inferred Types
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type SendVerificationEmailData = z.infer<typeof sendVerificationEmailSchema>;

// Response Types
export interface TokenResponse {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokensResponse;
}
