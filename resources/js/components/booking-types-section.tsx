import { useState } from 'react';
import { router } from '@inertiajs/react';
import { EditIcon, TrashIcon, MoreHorizontalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BookingTypesSectionDialog from './booking-types-section-dialog';

type BookingType = {
    id: number;
    name: string;
};

type BookingTypesSectionProps = {
    bookingTypes: BookingType[];
};

export default function BookingTypesSection({ bookingTypes }: BookingTypesSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBookingType, setEditingBookingType] = useState<BookingType | null>(null);

    const handleDelete = (bookingTypeId: number) => {
        if (confirm('Are you sure you want to delete this booking type?')) {
            router.delete(`/booking-types/${bookingTypeId}`);
        }
    };

    return (
        <div className='h-132 rounded-lg border'>
            <div className='flex flex-row items-center justify-between border-b p-4'>
                <h2 className='text-lg font-semibold'>Booking Types ({bookingTypes.length})</h2>

                <BookingTypesSectionDialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setEditingBookingType(null);
                    }}
                    editingBookingType={editingBookingType}
                />
            </div>

            <div className='overflow-auto px-2'>
                <Table>
                    <TableBody>
                        {bookingTypes.map((bookingType) => (
                            <TableRow key={bookingType.id}>
                                <TableCell className='w-full font-medium break-words whitespace-normal'>
                                    {bookingType.name}
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
                                                    setEditingBookingType(bookingType);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <EditIcon className='mr-2 size-4' />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className='text-destructive'
                                                onClick={() => handleDelete(bookingType.id)}
                                            >
                                                <TrashIcon className='mr-2 size-4' />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}

                        {bookingTypes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className='py-8 text-center text-muted-foreground'>
                                    No booking type found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}