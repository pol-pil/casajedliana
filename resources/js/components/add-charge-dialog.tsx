import { useEffect } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter } from './ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from './ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';

type AddChargeDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bookingId: number | string | null;
};

type Charge = {
	id: number;
	name: string;
	value: number;
	type: 'amenity' | 'damage';
};

type PageProps = {
	charges: Charge[];
};

export default function AddChargeDialog({ open, onOpenChange, bookingId }: AddChargeDialogProps) {
	const { charges } = usePage<PageProps>().props;

	const { data, setData, post, processing, reset } = useForm({
		booking_id: bookingId || '',
		charge_id: '',
		quantity: '1',
		value: '',
		total: '',
		custom_charge_name: '',
		custom_charge_type: 'amenity',
	});

	useEffect(() => {
		if (bookingId) {
			setData('booking_id', bookingId);
		}
	}, [bookingId, setData]);

	const isCustomCharge = data.charge_id === 'custom';
	const totalAmount = (parseFloat(data.value) || 0) * (parseInt(data.quantity) || 0);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		setData('total', totalAmount.toString());

		post('/booking-charges', {
			onSuccess: () => {
				toast.success('Booking charge added successfully!');
				reset();
				onOpenChange(false);
			},
			onError: () => {
				toast.error('Failed to add booking charge.');
			},
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					reset();
				}

				onOpenChange(isOpen);
			}}
		>
			<DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto backdrop-blur-xs lg:min-w-md dark:bg-primary-foreground/80'>
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<FieldSet>
							<FieldLegend>Add Booking Charge</FieldLegend>
							<FieldSeparator />

							<Field>
								<FieldLabel>Charge Item</FieldLabel>
								<Select
									value={data.charge_id}
									onValueChange={(value) => {
										setData('charge_id', value);

										const selectedCharge = charges.find((charge) => charge.id.toString() === value);

										if (selectedCharge) {
											setData('value', selectedCharge.value.toString());
										} else if (value === 'custom') {
											setData('value', '');
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder='Select Charge' />
									</SelectTrigger>

									<SelectContent>
										<SelectGroup>
											<SelectLabel className='text-xs text-gray-400'>Amenity</SelectLabel>
											{charges
												.filter((charge) => charge.type === 'amenity')
												.map((charge) => (
													<SelectItem key={charge.id} value={charge.id.toString()}>
														<span>{charge.name}</span>
														<span className='text-muted-foreground'>PHP {charge.value}</span>
													</SelectItem>
												))}
										</SelectGroup>

										<SelectGroup>
											<SelectLabel className='pt-4 text-xs text-gray-400'>Damage</SelectLabel>
											{charges
												.filter((charge) => charge.type === 'damage')
												.map((charge) => (
													<SelectItem key={charge.id} value={charge.id.toString()}>
														<span>{charge.name}</span>
														<span className='text-muted-foreground'>PHP {charge.value}</span>
													</SelectItem>
												))}
										</SelectGroup>

										<SelectGroup>
											<SelectLabel className='pt-4 text-xs text-gray-400'>Custom</SelectLabel>
											<SelectItem value='custom'>Custom Charge</SelectItem>
										</SelectGroup>

										{/* <div className='flex justify-end p-1'>
											<Button type='button' className='text-sm' onClick={() => router.visit('/rates')}>
												+ Add New Charge
											</Button>
										</div> */}
									</SelectContent>
								</Select>
							</Field>

							{isCustomCharge && (
								<FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
									<Field className='md:col-span-2'>
										<FieldLabel>Custom Charge Name</FieldLabel>
										<Input
											value={data.custom_charge_name}
											onChange={(event) => setData('custom_charge_name', event.target.value)}
											required={isCustomCharge}
										/>
									</Field>

									<Field>
										<FieldLabel>Charge Type</FieldLabel>
										<Select value={data.custom_charge_type} onValueChange={(value) => setData('custom_charge_type', value)}>
											<SelectTrigger>
												<SelectValue placeholder='Select charge type' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='amenity'>Amenity</SelectItem>
												<SelectItem value='damage'>Damage</SelectItem>
											</SelectContent>
										</Select>
									</Field>

									<Field>
										<FieldLabel>Value</FieldLabel>
										<Input
											type='number'
											min='0'
											step='0.01'
											value={data.value}
											onChange={(event) => setData('value', event.target.value)}
											required={isCustomCharge}
										/>
									</Field>
								</FieldGroup>
							)}

							<FieldGroup className='grid grid-cols-2 gap-4'>
								<Field>
									<FieldLabel>Quantity</FieldLabel>
									<Input
										type='number'
										min='1'
										value={data.quantity}
										onChange={(event) => setData('quantity', event.target.value)}
										required
									/>
								</Field>

								<Field>
									<FieldLabel>Total</FieldLabel>
									<Input value={totalAmount.toFixed(2)} readOnly />
								</Field>
							</FieldGroup>
						</FieldSet>
					</FieldGroup>

					<FieldSeparator className='py-6' />

					<DialogFooter>
						<Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
							Cancel
						</Button>

						<Button type='submit' disabled={processing}>
							{processing ? 'Adding...' : 'Add Charge'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
