import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { EditIcon, TrashIcon, MoreHorizontalIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import ChargeSectionDialog from './charge-section-dialog';

type Charge = {
	id: number;
	name: string;
	value: number;
	type: 'amenity' | 'damage';
};

type AddChargeSectionProps = {
	charges: Charge[];
};

const formatCurrency = (value: number) =>
	new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
		minimumFractionDigits: 2,
	}).format(value);

export default function AddChargeDialog({ charges }: AddChargeSectionProps) {
	const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);
	const [editingCharge, setEditingCharge] = useState<Charge | null>(null);

	const handleDeleteCharge = (chargeId: number) => {
		if (confirm('Are you sure you want to delete this charge?')) {
			router.delete(`/charges/${chargeId}`);
		}
	};

	const ChargeRows = ({ type }: { type: 'amenity' | 'damage' }) =>
		charges
			.filter((charge) => charge.type === type)
			.map((charge) => (
				<TableRow key={charge.id}>
					<TableCell className='w-full font-medium break-words whitespace-normal'>{charge.name}</TableCell>
					<TableCell className='text-right'>{formatCurrency(charge.value)}</TableCell>
					<TableCell className='flex justify-end'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' size='icon'>
									<MoreHorizontalIcon className='size-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem
									onClick={() => {
										setEditingCharge(charge);
										setIsChargeDialogOpen(true);
									}}
								>
									<EditIcon className='mr-2 size-4' />
									Edit
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className='text-destructive' onClick={() => handleDeleteCharge(charge.id)}>
									<TrashIcon className='mr-2 size-4' />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</TableCell>
				</TableRow>
			));

	return (
		<div className='rounded-lg border'>
			<div className='flex flex-row items-center justify-between border-b p-4'>
				<h2 className='text-lg font-semibold'>Charges</h2>
				<ChargeSectionDialog
					open={isChargeDialogOpen}
					onOpenChange={(open) => {
						setIsChargeDialogOpen(open);
						if (!open) setEditingCharge(null);
					}}
					editingCharge={editingCharge}
				/>
			</div>

			<div className='overflow-auto px-2'>
				<Table>
					<TableBody>
						<p className='py-4 pl-2 text-gray-500'>Amenities ({charges.filter((c) => c.type === 'amenity').length})</p>
						<ScrollArea className='h-90'>
							<ChargeRows type='amenity' />
						</ScrollArea>

						<Separator />

						<p className='py-4 pl-2 text-gray-500'>Room Damage ({charges.filter((c) => c.type === 'damage').length})</p>
						<ScrollArea className='h-90'>
							<ChargeRows type='damage' />
						</ScrollArea>

						{charges.length === 0 && (
							<TableRow>
								<TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
									No charges found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
