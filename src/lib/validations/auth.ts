import { z } from 'zod';

// Reusable password schema
const passwordSchema = z
  .string()
  .min(1, { message: 'Password is required' })
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/(?=.*\d)/, { message: 'Password must contain at least one number' });

// Login
export const loginSchema = z.object({
  // v4 top-level format + error param
  email: z.email({ message: 'Please enter a valid email address' }), 
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
});

// Register
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
  // refine still uses { message, path } in v4
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Forgot password
export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
});

// Reset password
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Send verification email
export const sendVerificationEmailSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type SendVerificationEmailFormData = z.infer<typeof sendVerificationEmailSchema>;