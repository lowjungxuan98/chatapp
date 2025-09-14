'use client';

import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function ThemeToggle() {
	const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
	const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });

	const toggleTheme = () => setColorScheme(computed === 'light' ? 'dark' : 'light');

	return (
		<ActionIcon
			variant="default"
			size="lg"
			aria-label="Toggle color scheme"
			onClick={toggleTheme}
		>
			{computed === 'light' ? <IconMoon /> : <IconSun />}
		</ActionIcon>
	);
}
