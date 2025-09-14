'use client';

import { useState } from 'react';
import { TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import AuthCard from '@/components/AuthCard';

export default function ForgotPasswordPage() {
	const [loading, setLoading] = useState(false);

	const form = useForm({
		initialValues: { email: '' },
		validate: {
			email: (v) => /^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email address',
		},
	});

	const onSubmit = (values: typeof form.values) => {
		setLoading(true);
		console.log(values);
		notifications.show({
			title: 'Check your inbox',
			message: 'If the email exists, you will receive reset instructions shortly.',
		});
		setLoading(false);
	};

	return (
		<AuthCard
			title="Forgot your password?"
			subtitle="Enter the email you used to register. We'll send a link to reset your password."
			altHref="/login"
			altLabel="Back to sign in"
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
					<Button type="submit" loading={loading} fullWidth>
						Send reset link
					</Button>
				</Stack>
			</form>
		</AuthCard>
	);
}
