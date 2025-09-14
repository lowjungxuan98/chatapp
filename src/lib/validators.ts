import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email({ message: 'Invalid email' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
	.object({
		name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }),
		email: z.email({ message: 'Invalid email' }),
		password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
		confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
	})
	.refine((v) => v.password === v.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type RegisterInput = z.infer<typeof registerSchema>;
