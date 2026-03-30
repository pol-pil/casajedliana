import { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
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

export default function AddChargeDialog({
	open,
	onOpenChange,
	bookingId,
}: AddChargeDialogProps) {
	const { charges } = usePage().props as any;

	const { data, setData, post, processing, reset } = useForm({
		booking_id: bookingId || '',
		charge_id: '',
		quantity: '1',
		value: '',
		total: '',
	});

	// Sync booking ID when changed
	useEffect(() => {
		if (bookingId) {
			setData('booking_id', bookingId);
		}
	}, [bookingId]);

	const totalAmount =
		(parseFloat(data.value) || 0) * (parseInt(data.quantity) || 0);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

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
				if (!isOpen) reset();
				onOpenChange(isOpen);
			}}
		>
			<DialogContent className="max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-md">
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<FieldSet>
							<FieldLegend>Add Booking Charge</FieldLegend>
							<FieldSeparator />

							{/* Charge Select */}
							<Field>
								<FieldLabel>Charge Item</FieldLabel>
								<Select
									value={data.charge_id}
									onValueChange={(value) => {
										setData('charge_id', value);

										const selected = charges.find(
											(c: any) => c.id.toString() === value
										);

										if (selected) {
											setData('value', selected.value.toString());
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select Charge" />
									</SelectTrigger>

									<SelectContent>
										{/* Amenity */}
										<SelectGroup>
											<SelectLabel className="text-xs text-gray-400">
												Amenity
											</SelectLabel>
											{charges
												.filter((c: any) => c.type === 'amenity')
												.map((c: any) => (
													<SelectItem key={c.id} value={c.id.toString()}>
														<span>{c.name}</span>
														<span className="text-muted-foreground">
															₱{c.value}
														</span>
													</SelectItem>
												))}
										</SelectGroup>

										{/* Damage */}
										<SelectGroup>
											<SelectLabel className="pt-4 text-xs text-gray-400">
												Damage
											</SelectLabel>
											{charges
												.filter((c: any) => c.type === 'damage')
												.map((c: any) => (
													<SelectItem key={c.id} value={c.id.toString()}>
														<span>{c.name}</span>
														<span className="text-muted-foreground">
															₱{c.value}
														</span>
													</SelectItem>
												))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</Field>

							{/* Quantity + Total */}
							<FieldGroup className="grid grid-cols-2 gap-4">
								<Field>
									<FieldLabel>Quantity</FieldLabel>
									<Input
										type="number"
										min="1"
										value={data.quantity}
										onChange={(e) =>
											setData('quantity', e.target.value)
										}
										required
									/>
								</Field>

								<Field>
									<FieldLabel>Total</FieldLabel>
									<Input
										value={totalAmount.toFixed(2)}
										readOnly
									/>
								</Field>
							</FieldGroup>
						</FieldSet>
					</FieldGroup>

					<FieldSeparator className="py-6" />

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>

						<Button
							type="submit"
							disabled={processing}
							onClick={() =>
								setData('total', totalAmount.toString())
							}
						>
							{processing ? 'Adding...' : 'Add Charge'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}