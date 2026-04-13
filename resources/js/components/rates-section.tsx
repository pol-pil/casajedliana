import { useState } from 'react';
import { router } from '@inertiajs/react';
import { EditIcon, TrashIcon, MoreHorizontalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RatesSectionDialog from './rates-section-dialog';

type Rate = {
    id: number;
    name: string;
    value: number;
    type: 'fixed' | 'percentage';
};

type RatesSectionProps = {
    rates: Rate[];
};

export default function RatesSection({ rates }: RatesSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRate, setEditingRate] = useState<Rate | null>(null);

    const handleDelete = (rateId: number) => {
        if (confirm('Are you sure you want to delete this rate?')) {
            router.delete(`/rates/${rateId}`);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(value);

    return (
        <div className='rounded-lg border'>
            <div className='flex flex-row items-center justify-between border-b p-4'>
                <h2 className='text-lg font-semibold'>Discount ({rates.length})</h2>

                <RatesSectionDialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setEditingRate(null);
                    }}
                    editingRate={editingRate}
                />
            </div>

            <div className='h-full overflow-auto px-2'>
                <Table>
                    <TableBody>
                        <ScrollArea className='h-115'>
                            {rates.map((rate) => (
                                <TableRow key={rate.id}>
                                    <TableCell className='w-full font-medium break-words whitespace-normal'>
                                        {rate.name}
                                    </TableCell>
                                    <TableCell className='text-right font-semibold'>
                                        {rate.type === 'fixed' ? formatCurrency(rate.value) : `${rate.value}%`}
                                    </TableCell>
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
                                                        setEditingRate(rate);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <EditIcon className='mr-2 size-4' />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className='text-destructive'
                                                    onClick={() => handleDelete(rate.id)}
                                                >
                                                    <TrashIcon className='mr-2 size-4' />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {rates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
                                        No rates found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </ScrollArea>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}