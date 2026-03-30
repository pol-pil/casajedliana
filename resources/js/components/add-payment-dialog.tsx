import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter } from './ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from './ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';

type AddPaymentDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bookingId: number | string | null;
};

export default function AddPaymentDialog({
	open,
	onOpenChange,
	bookingId,
}: AddPaymentDialogProps) {
	const { data, setData, post, processing, reset } = useForm({
		booking_id: bookingId || '',
		amount: '',
		payment_type: '',
		payment_method: '',
	});

	// Sync booking ID
	useEffect(() => {
		if (bookingId) {
			setData('booking_id', bookingId);
		}
	}, [bookingId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		post('/payments', {
			onSuccess: () => {
				toast.success('Payment added successfully!');
				reset();
				onOpenChange(false);
			},
			onError: () => {
				toast.error('Failed to add payment.');
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
							<FieldLegend>Add Payment</FieldLegend>
							<FieldSeparator />

							{/* Payment Type */}
							<Field>
								<FieldLabel>Payment Type</FieldLabel>
								<Select
									value={data.payment_type}
									onValueChange={(value) =>
										setData('payment_type', value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="downpayment">
											Downpayment
										</SelectItem>
										<SelectItem value="partial">
											Partial Payment
										</SelectItem>
										<SelectItem value="full">
											Full Payment
										</SelectItem>
									</SelectContent>
								</Select>
							</Field>

							{/* Amount + Method */}
							<FieldGroup className="grid grid-cols-2 gap-4">
								<Field>
									<FieldLabel>Amount</FieldLabel>
									<Input
										type="number"
										step="0.01"
										min="0"
										required
										value={data.amount}
										onChange={(e) =>
											setData('amount', e.target.value)
										}
									/>
								</Field>

								<Field>
									<FieldLabel>Payment Method</FieldLabel>
									<Select
										value={data.payment_method}
										onValueChange={(value) =>
											setData('payment_method', value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select method" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="cash">Cash</SelectItem>
											<SelectItem value="gcash">GCash</SelectItem>
											<SelectItem value="credit_card">
												Credit Card
											</SelectItem>
											<SelectItem value="bank_transfer">
												Bank Transfer
											</SelectItem>
										</SelectContent>
									</Select>
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

						<Button type="submit" disabled={processing}>
							{processing ? 'Adding...' : 'Add Payment'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}