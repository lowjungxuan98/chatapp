'use client';

import { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Text, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import AuthCard from '@/components/AuthCard';
import { loginSchema, type LoginInput } from '@/lib/validators';

export default function LoginPage() {
	const [loading, setLoading] = useState(false);

	const form = useForm<LoginInput>({
		validate: zodResolver(loginSchema),
		initialValues: { email: '', password: '' },
	});

	const onSubmit = (values: LoginInput) => {
		setLoading(true);
		notifications.show({
			title: 'Logged in',
			message: `Welcome back, ${values.email}`,
		});
		setLoading(false);
	};

	return (
		<AuthCard
			title="Welcome back"
			subtitle="Use your credentials to sign in."
			altHref="/register"
			altLabel="No account? Create one"
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap="md">
					<TextInput
						withAsterisk
						label="Email"
						placeholder="you@example.com"
						type="email"
						autoComplete="email"
						{...form.getInputProps('email')}
					/>
					<PasswordInput
						withAsterisk
						label="Password"
						placeholder="••••••••"
						autoComplete="current-password"
						{...form.getInputProps('password')}
					/>
					<Text size="sm" ta="right">
						<Anchor component={Link} href="/forgot-password">
							Forgot password?
						</Anchor>
					</Text>
					<Button type="submit" loading={loading} fullWidth>
						Sign in
					</Button>
				</Stack>
			</form>
		</AuthCard>
	);
}
