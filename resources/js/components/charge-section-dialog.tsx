import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';

type Charge = {
	id: number;
	name: string;
	value: number;
	type: 'amenity' | 'damage';
};

type ChargeSectionDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingCharge: Charge | null;
};

export default function ChargeSectionDialog({ open, onOpenChange, editingCharge }: ChargeSectionDialogProps) {
	const {
		data: chargeData,
		setData: setChargeData,
		post: postCharge,
		put: putCharge,
		processing: chargeProcessing,
		reset: resetChargeForm,
	} = useForm({
		name: '',
		value: '',
		type: 'amenity',
	});

	useEffect(() => {
		if (editingCharge) {
			setChargeData({
				name: editingCharge.name,
				value: editingCharge.value.toString(),
				type: editingCharge.type,
			});
		}
	}, [editingCharge]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (editingCharge) {
			putCharge(`/charges/${editingCharge.id}`, {
				onSuccess: () => {
					onOpenChange(false);
					resetChargeForm();
				},
			});
		} else {
			postCharge(`/charges`, {
				onSuccess: () => {
					onOpenChange(false);
					resetChargeForm();
				},
			});
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				onOpenChange(open);
				if (!open) resetChargeForm();
			}}
		>
			<DialogTrigger asChild>
				<Button className='flex items-center'>
					<Plus className='size-4' />
					Add Charge
				</Button>
			</DialogTrigger>
			<DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-md'>
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<FieldSet>
							<FieldLegend>{editingCharge ? 'Edit Charge' : 'New Charge'}</FieldLegend>
							<FieldSeparator />
							<Field>
								<FieldLabel htmlFor='charge-name'>Charge Name</FieldLabel>
								<Input
									id='charge-name'
									type='text'
									maxLength={100}
									required
									value={chargeData.name}
									onChange={(e) => setChargeData('name', e.target.value)}
								/>
							</Field>
							<FieldGroup className='grid grid-cols-2 gap-4'>
								<Field>
									<FieldLabel htmlFor='charge-value'>Value</FieldLabel>
									<Input
										id='charge-value'
										type='number'
										step='0.01'
										min='0'
										required
										value={chargeData.value}
										onChange={(e) => setChargeData('value', e.target.value)}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor='charge-type'>Type</FieldLabel>
									<Select
										value={chargeData.type}
										onValueChange={(value: 'amenity' | 'damage') => setChargeData('type', value)}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select type' />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value='amenity'>Amenity</SelectItem>
												<SelectItem value='damage'>Damage</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
							</FieldGroup>
						</FieldSet>
					</FieldGroup>
					<FieldSeparator className='py-8' />
					<DialogFooter>
						<DialogClose asChild>
							<Button type='button' variant='outline'>
								Cancel
							</Button>
						</DialogClose>
						<Button type='submit' disabled={chargeProcessing}>
							{chargeProcessing ? 'Saving...' : editingCharge ? 'Update Charge' : 'Save Charge'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}