import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon, TrashIcon,
    CircleUserRound, Phone, AtSign, MapPin, EyeOff, AlertCircle, Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import SoaPdf from '@/components/soa-pdf';
import AddChargeDialog from '@/components/add-charge-dialog';
import AddPaymentDialog from '@/components/add-payment-dialog';
import { useState } from 'react';

type Booking = {
    id: number;
    created_at: string;
    client: {
        id: number;
        first_name: string;
        last_name: string;
        email?: string;
        contact_number: string;
        address: string;
        company: string;
    };
    room: {
        id: number;
        room_number: string;
        room_type: string;
    };
    rate: {
        id: number;
        name: string;
    };
    guest_count: string;
    booking_type: {
        id: number;
        name: string;
    };
    purpose: string;
    check_in: string;
    check_out: string;
    status: string;
    total_amount: number;
    remarks: string;
    balance: number;
    payments: Array<{
        id: number;
        amount: number;
        payment_type: string;
        payment_method: string;
    }>;
    booking_charges?: Array<{
        id: number;
        charge: {
            id: number;
            name: string;
            value: number;
            type: 'amenity' | 'damage';
        };
        quantity: number;
        value: number;
        total: number;
    }>;
};

const statusConfig = {
    confirmed: {
        label: 'Confirmed',
        variant: 'default' as const,
        icon: CheckCircleIcon,
        color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
    },
    pencil: {
        label: 'Pencil Booked',
        variant: 'secondary' as const,
        icon: ClockIcon,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
    },
    checked_in: {
        label: 'Checked In',
        variant: 'default' as const,
        icon: CheckCircleIcon,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    checked_out: {
        label: 'Checked Out',
        variant: 'outline' as const,
        icon: CheckCircleIcon,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'destructive' as const,
        icon: XCircleIcon,
        color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    },
    no_show: {
        label: 'No Show',
        variant: 'default' as const,
        icon: EyeOff,
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    },
};

interface BookingInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedBooking: Booking | null;
    onEdit: (booking: Booking) => void;
}

export default function BookingInfoDialog({ open, onOpenChange, selectedBooking, onEdit }: BookingInfoDialogProps) {
    const [isAddBookingChargeDialogOpen, setIsAddBookingChargeDialogOpen] = useState(false);
    const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
        const config = statusConfig[status] ?? {
            label: status,
            variant: 'secondary' as const,
            icon: AlertCircle,
            color: 'bg-gray-100 text-gray-800',
        };
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className={cn('flex items-center gap-1', config.color)}>
                <Icon className='h-3 w-3' />
                {config.label}
            </Badge>
        );
    };

    const allowedActions: Record<string, string[]> = {
        pencil: ['cancelled'],
        confirmed: ['checked_in', 'cancelled', 'no_show'],
        checked_in: ['checked_out'],
        checked_out: [],
        no_show: ['checked_in'],
        cancelled: [],
    };

    const can = (action: string) => !allowedActions[selectedBooking?.status ?? '']?.includes(action);

    const updateStatus = (status: string) => {
        if (!selectedBooking?.id) return;
        router.patch(
            `/bookings/${selectedBooking.id}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Booking ${status.replace('_', ' ')} successfully`),
                onError: () => toast.error('Failed to update booking status'),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='lg:min-w-200'>
                <div className='lg:flex'>
                    {/* Left Column */}
                    <div className='mr-4 flex-4 space-y-4 px-4 pr-8 lg:border-r-1'>
                        <div>
                            <DialogHeader className='flex flex-row justify-between font-semibold'>
                                <span>Booking Info</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' className='h-full rounded-full p-1'>
                                            <StatusBadge status={selectedBooking?.status as keyof typeof statusConfig} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem className='focus:text-blue-500' onClick={() => updateStatus('checked_in')} disabled={can('checked_in')}>
                                            <CheckCircleIcon className='mr-2 h-4 w-4' /> Check In
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className='focus:text-red-700' onClick={() => updateStatus('checked_out')} disabled={can('checked_out')}>
                                            <EyeIcon className='mr-2 h-4 w-4' /> Check Out
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className='focus:text-orange-600' onClick={() => updateStatus('no_show')} disabled={can('no_show')}>
                                            <EyeOff className='mr-2 h-4 w-4' /> No Show
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className='text-destructive focus:bg-red-200' onClick={() => updateStatus('cancelled')} disabled={can('cancelled')}>
                                            <TrashIcon className='mr-2 h-4 w-4' /> Cancel Booking
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </DialogHeader>
                            <DialogDescription className='space-y-1 py-2'>
                                <div className='flex justify-between'><span>Booking ID</span><span>BK-{selectedBooking?.id}</span></div>
                                <div className='flex justify-between'><span>Booking Date</span><span>{selectedBooking && formatDate(selectedBooking.created_at)}</span></div>
                                <div className='flex justify-between'><span>Booking Time</span><span>{selectedBooking && formatTime(selectedBooking.created_at)}</span></div>
                                <div className='flex justify-between'><span>Booking Type</span><span>{selectedBooking?.booking_type.name}</span></div>
                                <div className='flex justify-between'><span>Purpose of Booking</span><span>{selectedBooking?.purpose}</span></div>
                            </DialogDescription>
                        </div>
                        <div>
                            <DialogHeader className='text-left font-semibold'>Room Details</DialogHeader>
                            <DialogDescription className='space-y-1 py-2'>
                                <div className='flex justify-between'><span>Room Type</span><span>{selectedBooking?.room.room_type}</span></div>
                                <div className='flex justify-between'><span>Room Number</span><span>{selectedBooking?.room.room_number}</span></div>
                                <div className='flex justify-between'><span>Number of Guests</span><span>{selectedBooking?.guest_count}</span></div>
                            </DialogDescription>
                        </div>
                        <div>
                            <DialogHeader className='text-left font-semibold'>Check-In / Check-Out</DialogHeader>
                            <DialogDescription className='space-y-1 py-2'>
                                <div className='flex justify-between'><span>Check-In Date</span><span>{selectedBooking && formatDate(selectedBooking.check_in)}</span></div>
                                <div className='flex justify-between'><span>Check-In Time</span><span>{selectedBooking && formatTime(selectedBooking.check_in)}</span></div>
                                <div className='flex justify-between'><span>Check-Out Date</span><span>{selectedBooking && formatDate(selectedBooking.check_out)}</span></div>
                                <div className='flex justify-between'><span>Check-Out Time</span><span>{selectedBooking && formatTime(selectedBooking.check_out)}</span></div>
                            </DialogDescription>
                        </div>
                        <div>
                            <DialogHeader className='text-left font-semibold'>Special Request</DialogHeader>
                            <DialogDescription className='py-2'>{selectedBooking?.remarks}</DialogDescription>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='flex flex-5 flex-col px-4'>
                        <DialogHeader className='text-left font-semibold'>Guest Profile</DialogHeader>
                        <div className='flex items-center p-2'>
                            <CircleUserRound className='mr-3 size-12 text-primary-foreground dark:text-primary' />
                            <div>
                                <DialogHeader className='font-semibold'>
                                    {selectedBooking?.client.first_name} {selectedBooking?.client.last_name}
                                </DialogHeader>
                                <DialogDescription>CID-{selectedBooking?.client.id}</DialogDescription>
                            </div>
                        </div>
                        <div className='space-y-1 px-3 py-2'>
                            <DialogDescription className='flex items-center'><Phone className='mr-2 size-4' />{selectedBooking?.client.contact_number}</DialogDescription>
                            <DialogDescription className='flex items-center'><AtSign className='mr-2 size-4' />{selectedBooking?.client.email}</DialogDescription>
                            <DialogDescription className='flex'><MapPin className='mr-2 size-5' />{selectedBooking?.client.address}</DialogDescription>
                        </div>
                        <Separator className='my-2' />

                        <AddChargeDialog
                            open={isAddBookingChargeDialogOpen}
                            onOpenChange={setIsAddBookingChargeDialogOpen}
                            bookingId={selectedBooking?.id || null}
                        />
                        <AddPaymentDialog
                            open={isAddPaymentDialogOpen}
                            onOpenChange={setIsAddPaymentDialogOpen}
                            bookingId={selectedBooking?.id || null}
                        />

                        <div className='mt-auto pt-4 pb-8'>
                            <div className='flex items-center justify-between'>
                                <DialogHeader className='font-semibold'>Bill</DialogHeader>
                                <div className='flex flex-row gap-2'>
                                    <Button className='h-6 items-center text-xs' size='sm' onClick={() => setIsAddBookingChargeDialogOpen(true)}>
                                        <Plus className='size-3' /> Charge
                                    </Button>
                                    <Button className='h-6 items-center text-xs' size='sm' onClick={() => setIsAddPaymentDialogOpen(true)}>
                                        <Plus className='size-3' /> Payment
                                    </Button>
                                </div>
                            </div>
                            <DialogDescription className='space-y-1 pt-4 pb-2'>
                                <div className='flex justify-between text-primary-foreground'>
                                    <span>Room ({selectedBooking?.rate?.name || 'N/A'})</span>
                                    <span>{selectedBooking?.total_amount}</span>
                                </div>
                                {(selectedBooking?.booking_charges ?? []).filter((bc) => bc.charge?.type === 'amenity').map((amenity) => (
                                    <div key={amenity.id} className='flex justify-between'>
                                        <span>{amenity.charge?.name} {amenity.quantity > 1 ? `x${amenity.quantity}` : ''}</span>
                                        <span>{amenity.total}</span>
                                    </div>
                                ))}
                                {(selectedBooking?.booking_charges ?? []).filter((bc) => bc.charge?.type === 'damage').map((damage) => (
                                    <div key={damage.id} className='flex justify-between'>
                                        <span>{damage.charge?.name} {damage.quantity > 1 ? `x${damage.quantity}` : ''}</span>
                                        <span>{damage.total}</span>
                                    </div>
                                ))}
                                <Separator className='my-2' />
                                <div className='flex justify-between font-bold text-primary-foreground dark:text-primary'>
                                    <span>Sub Total</span>
                                    <span>{(
                                        Number(selectedBooking?.total_amount ?? 0) +
                                        (selectedBooking?.booking_charges ?? []).reduce((sum, c) => sum + Number(c.total ?? 0), 0)
                                    ).toFixed(2)}</span>
                                </div>
                                {selectedBooking?.payments?.map((payment) => (
                                    <div key={payment.id} className='flex justify-between'>
                                        <span>{payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)}</span>
                                        <span>-{payment.amount}</span>
                                    </div>
                                ))}
                                <Separator className='my-2' />
                                <div className='flex justify-between font-bold text-primary-foreground dark:text-primary'>
                                    <span>Balance</span>
                                    <span>₱ {(
                                        Number(selectedBooking?.total_amount ?? 0) +
                                        (selectedBooking?.booking_charges ?? []).reduce((sum, c) => sum + Number(c.total ?? 0), 0) -
                                        (selectedBooking?.payments ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
                                    ).toFixed(2)}</span>
                                </div>
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <DialogFooter className='-mt-8'>
                    <DialogClose asChild>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => selectedBooking && onEdit(selectedBooking)}
                        >
                            Edit
                        </Button>
                    </DialogClose>
                    {selectedBooking?.id !== undefined && <SoaPdf booking_id={selectedBooking.id} />}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}