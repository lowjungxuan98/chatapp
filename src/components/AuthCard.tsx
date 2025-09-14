'use client';

import { Paper, Title, Text, Anchor, Group, Stack } from '@mantine/core';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
	title: string;
	subtitle?: string;
	altHref?: string;
	altLabel?: string;
	children?: ReactNode;
};

export default function AuthCard({ title, subtitle, altHref, altLabel, children }: Props) {
	return (
		<Group justify="center" align="center" mih="100vh">
			<Paper radius="md" p="xl" withBorder w={420}>
				<Stack>
					<Title order={2}>{title}</Title>
					{subtitle && <Text c="dimmed" size="sm">{subtitle}</Text>}
					{children}
					{altHref && altLabel && (
						<Text size="sm" ta="center">
							<Anchor component={Link} href={altHref}>
								{altLabel}
							</Anchor>
						</Text>
					)}
				</Stack>
			</Paper>
		</Group>
	);
}
