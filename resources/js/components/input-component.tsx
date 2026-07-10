import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Field, FieldLabel } from './ui/field';

interface FormInputProps extends HTMLAttributes<HTMLInputElement> {
	id: string;
	type?: string;
	placeholder?: string;
	value?: string | number;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	maxLength?: number;
	error?: string;
	label?: string;
}

export default function FormInput({ id, type = 'text', placeholder, value, onChange, maxLength, error, label }: FormInputProps) {
	const formatError = (error: any) => {
		if (!error) return '';

		const cleaned = error
			.replace(/The/g, '')
			.replace(/field/g, '')
			.replace(/client\./g, '')
			.replace(/\bid\b/gi, '')
			.trim();

		return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
	};

	return (
		<Field>
			<div className='space-y-2'>
				{label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

				<Input
					id={id}
					type={type}
					placeholder={placeholder}
					maxLength={maxLength}
					value={value}
					onChange={onChange}
					className={` ${error ? 'border-red-500 focus:ring-2 focus:ring-red-500' : ''} `}
				/>

				{error && <p className='absolute -mt-1 text-xs text-red-500'>{formatError(error)}</p>}
			</div>
		</Field>
	);
}
