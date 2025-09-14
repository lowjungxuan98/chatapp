'use client';

import { useState } from 'react';
import { TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import AuthCard from '@/components/AuthCard';
import PasswordStrength from '@/components/PasswordStrength';
import { registerSchema, type RegisterInput } from '@/lib/validators';

export default function RegisterPage() {
	const [loading, setLoading] = useState(false);

	const form = useForm<RegisterInput>({
		validate: zodResolver(registerSchema),
		initialValues: { name: '', email: '', password: '', confirmPassword: '' },
	});

	const onSubmit = (values: RegisterInput) => {
		setLoading(true);
		notifications.show({
			title: 'Account created',
			message: `Welcome, ${values.name}!`,
		});
		setLoading(false);
	};

	return (
		<AuthCard
			title="Create your account"
			subtitle="It takes less than a minute."
			altHref="/login"
			altLabel="Already have an account? Sign in"
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap="md">
					<TextInput
						withAsterisk
						label="Name"
						placeholder="Your name"
						autoComplete="name"
						{...form.getInputProps('name')}
					/>
					<TextInput
						withAsterisk
						label="Email"
						placeholder="you@example.com"
						type="email"
						autoComplete="email"
						{...form.getInputProps('email')}
					/>
					<PasswordStrength
						required
						label="Password"
						placeholder="Strong password"
						onChange={(v) => form.setFieldValue('password', v)}
					/>
					<TextInput
						withAsterisk
						label="Confirm password"
						placeholder="Repeat your password"
						type="password"
						autoComplete="new-password"
						{...form.getInputProps('confirmPassword')}
					/>
					<Button type="submit" loading={loading} fullWidth>
						Create account
					</Button>
				</Stack>
			</form>
		</AuthCard>
	);
}
