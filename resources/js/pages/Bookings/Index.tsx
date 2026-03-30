import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
	CheckCircleIcon,
	XCircleIcon,
	ClockIcon,
	UserIcon,
	MailIcon,
	PhoneIcon,
	PhilippinePeso,
	Plus,
	AlertCircle,
	EyeOff,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';
import BookingFormDialog from '@/components/booking-dialog';
import BookingInfoDialog from '@/components/booking-info-dialog';

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

type Room = {
	id: number;
	room_number: string;
	room_type: string;
	capacity: number;
	price: number;
	status: string;
};

type Rate = {
	id: number;
	name: string;
	value: number;
	type: 'exact' | 'percentage';
};

type BookingType = {
	id: number;
	name: string;
};

type PageProps = {
	bookings: {
		data: Booking[];
		links: any[];
		current_page: number;
		last_page: number;
	};
	stats: {
		totalBookings: number;
		activeGuests: number;
		pencilBookings: number;
		totalRevenue: number;
	};
	rooms: Room[];
	rates: Rate[];
	bookingTypes: BookingType[];
	auth?: {
		user: any;
	};
	errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Bookings',
		href: '/bookings',
	},
];

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

export default function Index() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
	const [selectedRoomId, setSelectedRoomId] = useState<string>('');
	const [guestCount, setGuestCount] = useState<string>('1');
	const [selectedRateId, setSelectedRateId] = useState<string>('');
	const [selectedBookingType, setSelectedBookingType] = useState<string>('');
	const [isBookingInfoDialogOpen, setIsBookingInfoDialogOpen] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

	const [checkInTime, setCheckInTime] = useState('08:00');
	const [checkOutTime, setCheckOutTime] = useState('17:00');

	const [isEditMode, setIsEditMode] = useState(false);
	const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

	const emptyForm = {
		client: {
			first_name: '',
			last_name: '',
			email: '',
			contact_number: '',
			address: '',
			company: '',
		},
		room_id: '',
		rate_id: '',
		check_in: '',
		check_out: '',
		guest_count: 1,
		purpose: '',
		booking_type_id: '',
		total_amount: 0,
		downpayment: '',
		payment_method: '',
		remarks: '',
	};

	const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm(emptyForm);

	// Use the PageProps type
	const { bookings, stats, rooms, rates, bookingTypes, charges, payments } = usePage<PageProps>().props;

	const resetForm = () => {
		setIsDialogOpen(false);
		setIsEditMode(false);
		setEditingBookingId(null);
		setDateRange({ from: undefined, to: undefined });
		setSelectedRoomId('');
		setSelectedRateId('');
		setSelectedBookingType('');
		setGuestCount('1');
		setData(emptyForm);
		setCheckInTime('08:00');
		setCheckOutTime('17:00');
		clearErrors();
		reset();
	};

	useEffect(() => {
		setData('guest_count', parseInt(guestCount) || 1);
	}, [guestCount, setData]);

	const handleErrors = (errors: Record<string, string>, action: 'create' | 'update') => {
		toast.error(`Failed to ${action} booking`);

		Object.values(errors).forEach((message) => {
			const cleaned = message.replace(/client\./g, '').replace(/\bid\b/gi, '');

			toast.error(cleaned.trim());
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (isEditMode && editingBookingId) {
			put(`/bookings/${editingBookingId}`, {
				...data,
				onSuccess: () => {
					toast.success('Booking updated successfully!');
					resetForm();
				},
				onError: (errors) => handleErrors(errors, 'update'),
			});
		} else {
			post('/bookings', {
				onSuccess: () => {
					toast.success('Booking created successfully!');
					resetForm();
				},
				onError: (errors) => handleErrors(errors, 'create'),
			});
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	};

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

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<div className='p-6'>
				<Head title='Bookings' />

				{/* Stats overview */}
				<div className='flex-row gap-4 pb-4 lg:flex'>
					<div className='flex-1 rounded-lg border bg-card p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-muted-foreground'>Total Bookings</p>
								<p className='text-2xl font-bold'>{stats.totalBookings}</p>
							</div>
							<div className='rounded-full bg-primary/40 p-3'>
								<UserIcon className='h-6 w-6 text-primary-foreground' />
							</div>
						</div>
					</div>
					<div className='flex-1 rounded-lg border bg-card p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-muted-foreground'>Active Guests</p>
								<p className='text-2xl font-bold'>{stats.activeGuests}</p>
							</div>
							<div className='rounded-full bg-blue-100 p-3 dark:bg-blue-950'>
								<CheckCircleIcon className='h-6 w-6 text-blue-600 dark:text-blue-300' />
							</div>
						</div>
					</div>
					<div className='flex-1 rounded-lg border bg-card p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-muted-foreground'>Pencil</p>
								<p className='text-2xl font-bold'>{stats.pencilBookings}</p>
							</div>
							<div className='rounded-full bg-yellow-100 p-3 dark:bg-yellow-950'>
								<ClockIcon className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
							</div>
						</div>
					</div>
					<div className='flex-1 rounded-lg border bg-card p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-muted-foreground'>Total Revenue</p>
								<p className='text-2xl font-bold'>
									₱{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
								</p>
							</div>
							<div className='rounded-full bg-green-100 p-3 dark:bg-green-950'>
								<PhilippinePeso className='h-6 w-6 text-green-600 dark:text-green-400' />
							</div>
						</div>
					</div>
				</div>

				{/* Bookings table */}
				<div className='rounded-lg border'>
					<div className='flex flex-row items-center justify-between border-b p-4'>
						<h2 className='text-lg font-semibold'>Recent Bookings</h2>
						<BookingFormDialog
							data={data}
							setData={setData}
							processing={processing}
							errors={errors}
							isDialogOpen={isDialogOpen}
							setIsDialogOpen={setIsDialogOpen}
							handleSubmit={handleSubmit}
							resetForm={resetForm}
							clearErrors={clearErrors}
							isEditMode={isEditMode}
							selectedBooking={selectedBooking}
							selectedRoomId={selectedRoomId}
							setSelectedRoomId={setSelectedRoomId}
							selectedRateId={selectedRateId}
							setSelectedRateId={setSelectedRateId}
							selectedBookingType={selectedBookingType}
							setSelectedBookingType={setSelectedBookingType}
							guestCount={guestCount}
							setGuestCount={setGuestCount}
							dateRange={dateRange}
							setDateRange={setDateRange}
							checkInTime={checkInTime}
							setCheckInTime={setCheckInTime}
							checkOutTime={checkOutTime}
							setCheckOutTime={setCheckOutTime}
						>
							<Button className='flex items-center'>
								<Plus className='h-4 w-4' />
								New Booking
							</Button>
						</BookingFormDialog>
					</div>
					<div className='overflow-auto px-2'>
						<Table>
							<TableHeader>
								<TableRow>
									{/* <TableHead>Booking #</TableHead> */}
									<TableHead>Guest</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Room</TableHead>
									<TableHead>Check-in</TableHead>
									<TableHead>Check-out</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className='text-right'>Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{bookings.data.map((booking) => {
									return (
										<TableRow
											key={booking.id}
											onClick={() => {
												setSelectedBooking(booking);
												setIsBookingInfoDialogOpen(true);
											}}
										>
											<TableCell>
												<div>
													<div className='font-medium'>
														{booking.client.first_name} {booking.client.last_name}
													</div>
													{booking.client.email && (
														<div className='flex items-center gap-1 text-sm text-muted-foreground'>
															<MailIcon className='h-3 w-3' />
															{booking.client.email}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className='flex items-center gap-1'>
													<PhoneIcon className='h-3 w-3' />
													{booking.client.contact_number}
												</div>
											</TableCell>
											<TableCell>
                                                <div>
                                                    <div className='font-medium'>{booking.room.room_number}</div>
                                                    <div className='text-sm text-muted-foreground'>{booking.room.room_type}</div>
                                                </div>
                                            </TableCell>
											<TableCell>
												<div>
													<div className='font-medium'>{formatDate(booking.check_in)}</div>
													<div className='text-sm text-muted-foreground'>{formatTime(booking.check_in)}</div>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<div className='font-medium'>{formatDate(booking.check_out)}</div>
													<div className='text-sm text-muted-foreground'>{formatTime(booking.check_out)}</div>
												</div>
											</TableCell>
											<TableCell>
												<StatusBadge
													status={
														booking.status as
															| 'confirmed'
															| 'pencil'
															| 'checked_in'
															| 'checked_out'
															| 'cancelled'
															| 'no_show'
													}
												/>
											</TableCell>
											<TableCell className='text-right'>
												<div className='font-medium'>
													₱{' '}
													{(
														Number(booking.total_amount ?? 0) +
														(booking.booking_charges ?? []).reduce(
															(sum, charge) => sum + Number(charge.total ?? 0),
															0,
														)
													).toFixed(2)}
												</div>
												<div className='text-sm text-muted-foreground'>
													Balance: ₱{' '}
													{(
														Number(booking.total_amount ?? 0) +
														(booking.booking_charges ?? []).reduce(
															(sum, bookingCharge) => sum + Number(bookingCharge.total ?? 0),
															0,
														) -
														(booking.payments ?? []).reduce(
															(sum, payment) => sum + Number(payment.amount ?? 0),
															0,
														)
													).toFixed(2)}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					{bookings.links && bookings.links.length > 3 && (
						<div className='flex items-center justify-between border-t px-4 py-4'>
							<div className='text-sm text-muted-foreground'>
								Page {bookings.current_page || 1} of {bookings.last_page || 1}
							</div>
							<div className='flex items-center space-x-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										const prevLink = bookings.links.find((link) => link.label === '&laquo; Previous');
										if (prevLink?.url) router.get(prevLink.url);
									}}
									disabled={!bookings.links.find((link) => link.label === '&laquo; Previous')?.url}
								>
									Previous
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => {
										const nextLink = bookings.links.find((link) => link.label === 'Next &raquo;');
										if (nextLink?.url) router.get(nextLink.url);
									}}
									disabled={!bookings.links.find((link) => link.label === 'Next &raquo;')?.url}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
			<BookingInfoDialog
				open={isBookingInfoDialogOpen}
				onOpenChange={(open) => {
					setIsBookingInfoDialogOpen(open);
					if (!open) setSelectedBooking(null);
				}}
				selectedBooking={selectedBooking}
				onEdit={(booking) => {
					setIsBookingInfoDialogOpen(false);
					setIsDialogOpen(true);
					setIsEditMode(true);
					setEditingBookingId(booking.id);
					setSelectedRoomId(booking.room.id.toString());
					setSelectedRateId(booking.rate?.id?.toString() || '');
					setSelectedBookingType(booking.booking_type?.id?.toString() || '');
					setGuestCount(booking.guest_count.toString());
					setDateRange({
						from: new Date(booking.check_in),
						to: new Date(booking.check_out),
					});
					setData({
						client: {
							first_name: booking.client.first_name,
							last_name: booking.client.last_name,
							email: booking.client.email || '',
							contact_number: booking.client.contact_number,
							address: booking.client.address || '',
							company: booking.client.company || '',
						},
						room_id: booking.room.id.toString(),
						rate_id: booking.rate?.id?.toString() || '',
						check_in: booking.check_in,
						check_out: booking.check_out,
						guest_count: Number(booking.guest_count),
						purpose: booking.purpose || '',
						booking_type_id: booking.booking_type?.id?.toString() || '',
						total_amount: Number(booking.total_amount),
						downpayment: '',
						payment_method: '',
						remarks: booking.remarks || '',
					});
				}}
			/>
		</AppLayout>
	);
}
