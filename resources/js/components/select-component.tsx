import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { Field, FieldLabel } from './ui/field';

interface Option {
	value: string;
	label: string;
}

interface FormSelectProps {
	id: string;
	label?: string;
	placeholder?: string;
	value: any;
	onChange: (value: string) => void;
	options?: Option[];
	error?: string;
}

export default function FormSelect({ id, label, placeholder = 'Select', value, onChange, options = [], error }: FormSelectProps) {
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

				<Select value={value} onValueChange={onChange}>
					<SelectTrigger className={`${error ? 'border-red-500 focus:ring-red-500' : ''}`}>
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>

					<SelectContent>
						<SelectGroup>
							{options.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>

				{error && <p className='-mt-1 text-xs text-red-500'>{formatError(error)}</p>}
			</div>
		</Field>
	);
}
