'use client';

import { useState } from 'react';
import { Button, Stack, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import AuthCard from '@/components/AuthCard';
import PasswordStrength from '@/components/PasswordStrength';

export default function ResetPasswordPage() {
	const [loading, setLoading] = useState(false);

	const form = useForm({
		initialValues: { password: '', confirmPassword: '' },
		validate: {
			password: (v) => (v.length >= 6 ? null : 'At least 6 characters'),
			confirmPassword: (v, values) =>
				v === values.password ? null : 'Passwords do not match',
		},
	});

	const onSubmit = (values: typeof form.values) => {
		setLoading(true);
		console.log(values);
		notifications.show({
			title: 'Password updated',
			message: 'Your password has been reset successfully.',
		});
		setLoading(false);
	};

	return (
		<AuthCard
			title="Reset your password"
			subtitle="Enter a new password for your account."
			altHref="/login"
			altLabel="Back to sign in"
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap="md">
					<PasswordStrength
						required
						label="New password"
						placeholder="Strong password"
						onChange={(v) => form.setFieldValue('password', v)}
					/>
					<PasswordInput
						withAsterisk
						label="Confirm password"
						placeholder="Repeat password"
						autoComplete="new-password"
						{...form.getInputProps('confirmPassword')}
					/>
					<Button type="submit" loading={loading} fullWidth>
						Reset password
					</Button>
				</Stack>
			</form>
		</AuthCard>
	);
}
