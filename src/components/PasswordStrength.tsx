'use client';

import { useState } from 'react';
import { PasswordInput, Progress, Text, Popover, Box } from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';

const requirements = [
	{ re: /[0-9]/, label: 'Includes number' },
	{ re: /[a-z]/, label: 'Includes lowercase letter' },
	{ re: /[A-Z]/, label: 'Includes uppercase letter' },
	{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
	let multiplier = password.length > 5 ? 0 : 1;
	requirements.forEach((r) => {
		if (!r.re.test(password)) multiplier += 1;
	});
	return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

function Requirement({ meets, label }: { meets: boolean; label: string }) {
	return (
		<Text c={meets ? 'teal' : 'red'} style={{ display: 'flex', alignItems: 'center' }} mt={7} size="sm">
			{meets ? <IconCheck size={14} /> : <IconX size={14} />}
			<Box ml={10}>{label}</Box>
		</Text>
	);
}

type Props = {
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	placeholder?: string;
	required?: boolean;
};

export default function PasswordStrength({ value = '', onChange, label = 'Password', placeholder = '••••••••', required }: Props) {
	const [opened, setOpened] = useState(false);
	const [inputValue, setInputValue] = useState(value);

	const strength = getStrength(inputValue);
	const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.currentTarget.value;
		setInputValue(newValue);
		onChange?.(newValue);
	};

	return (
		<Popover opened={opened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
			<Popover.Target>
				<div onFocusCapture={() => setOpened(true)} onBlurCapture={() => setOpened(false)}>
					<PasswordInput
						withAsterisk={required}
						label={label}
						placeholder={placeholder}
						value={inputValue}
						onChange={handleChange}
						autoComplete="new-password"
					/>
				</div>
			</Popover.Target>
			<Popover.Dropdown>
				<Progress value={strength} size={5} mb="xs" color={color} />
				<Requirement label="At least 6 characters" meets={inputValue.length > 5} />
				{requirements.map((r) => (
					<Requirement key={r.label} label={r.label} meets={r.re.test(inputValue)} />
				))}
			</Popover.Dropdown>
		</Popover>
	);
}
