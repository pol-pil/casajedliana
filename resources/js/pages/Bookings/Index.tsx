import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
	CalendarIcon,
	MoreHorizontalIcon,
	CheckCircleIcon,
	XCircleIcon,
	ClockIcon,
	UserIcon,
	MailIcon,
	PhoneIcon,
	PhilippinePeso,
	Plus,
	AlertCircle,
	EyeIcon,
	EditIcon,
	TrashIcon,
	CircleUserRound,
	Phone,
	AtSign,
	MapPin,
	UserRoundSearch,
	UserSearch,
	CircleDollarSign,
	EyeOff,
	ListRestart,
	CheckCircle,
	Check,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PopoverClose } from '@radix-ui/react-popover';
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';
import { set } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import SoaPdf from '@/components/soa-pdf';

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

type Charge = {
	id: number;
	name: string;
	value: number;
	type: 'amenity' | 'damage';
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

type Payment = {
	id: number;
	booking_id: number;
	amount: number;
	payment_method: string;
	payment_type: string;
};

type BookingType = {
	id: number;
	name: string;
};

type BookingCharge = {
	id: number;
	booking_id: number;
	charge_id: number;
	quantity: number;
	value: number;
	total: number;
};

type Client = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	contact_number: string;
	address: string;
	company: string;
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
		pendingBookings: number;
		totalRevenue: number;
	};
	rooms: Room[];
	rates: Rate[];
	bookingTypes: BookingType[];
	charges: Charge[];
	clients: Client[];
	payments: Payment[];
	bookingCharges: BookingCharge[];
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
	pending: {
		label: 'Pending Payment',
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
	'checked_out': {
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

const AddChargeDialog = ({
	open,
	onOpenChange,
	booking,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: Booking | null;
}) => {
	const { data, setData, post, processing, reset } = useForm({
		booking_id: booking?.id || '',
		charge_id: '',
		quantity: '1',
		value: '',
		total: '',
	});

	useEffect(() => {
		if (booking) {
			setData('booking_id', booking.id);
		}
	}, [booking]);

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

	const { charges } = usePage<PageProps>().props;
	const total_amount = (parseFloat(data.value) || 0) * parseInt(data.quantity);

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
			<DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-md'>
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

										const selectedCharge = charges.find((c: any) => c.id.toString() === value);

										if (selectedCharge) {
											setData('value', selectedCharge.value.toString());
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
												.filter((charge: any) => charge.type === 'amenity')
												.map((charge: any) => (
													<SelectItem key={charge.id} value={charge.id.toString()}>
														<span>{charge.name}</span>
														<span className='text-muted-foreground'>₱{charge.value}</span>
													</SelectItem>
												))}
										</SelectGroup>
										<SelectGroup>
											<SelectLabel className='pt-4 text-xs text-gray-400'>Damage</SelectLabel>
											{charges
												.filter((charge: any) => charge.type === 'damage')
												.map((charge: any) => (
													<SelectItem key={charge.id} value={charge.id.toString()}>
														<span>{charge.name}</span>
														<span className='text-muted-foreground'>₱{charge.value}</span>
													</SelectItem>
												))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</Field>
							<FieldGroup className='grid grid-cols-2 gap-4'>
								<Field>
									<FieldLabel>Quantity</FieldLabel>
									<Input
										type='number'
										step='1'
										min='1'
										required
										value={data.quantity}
										onChange={(e) => setData('quantity', e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel>Total</FieldLabel>
									<Input type='number' value={total_amount.toFixed(2)} readOnly />
								</Field>
							</FieldGroup>
						</FieldSet>
					</FieldGroup>

					<FieldSeparator className='py-6' />

					<DialogFooter>
						<Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type='submit' disabled={processing} onClick={() => setData('total', total_amount.toString())}>
							{processing ? 'Adding...' : 'Add Charge'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

const AddPaymentDialog = ({
	open,
	onOpenChange,
	booking,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: Booking | null;
}) => {
	const { data, setData, post, processing, reset } = useForm({
		booking_id: booking?.id || '',
		amount: '',
		payment_type: '',
		payment_method: '',
	});

	useEffect(() => {
		if (booking) {
			setData('booking_id', booking.id);
		}
	}, [booking]);

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
				if (!isOpen) {
					reset();
				}
				onOpenChange(isOpen);
			}}
		>
			<DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-md'>
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<FieldSet>
							<FieldLegend>Add Payment</FieldLegend>
							<FieldSeparator />

							<Field>
								<FieldLabel>Payment Type</FieldLabel>
								<Select value={data.payment_type} onValueChange={(value) => setData('payment_type', value)}>
									<SelectTrigger>
										<SelectValue placeholder='Select type' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='downpayment'>Downpayment</SelectItem>
										<SelectItem value='partial'>Partial Payment</SelectItem>
										<SelectItem value='full'>Full Payment</SelectItem>
									</SelectContent>
								</Select>
							</Field>

							<FieldGroup className='grid grid-cols-2 gap-4'>
								<Field>
									<FieldLabel>Amount</FieldLabel>
									<Input
										type='number'
										step='0.01'
										min='0'
										required
										value={data.amount}
										onChange={(e) => setData('amount', e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel>Payment Method</FieldLabel>
									<Select value={data.payment_method} onValueChange={(value) => setData('payment_method', value)}>
										<SelectTrigger>
											<SelectValue placeholder='Select method' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='cash'>Cash</SelectItem>
											<SelectItem value='gcash'>GCash</SelectItem>
											<SelectItem value='credit_card'>Credit Card</SelectItem>
											<SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
										</SelectContent>
									</Select>
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
							{processing ? 'Adding...' : 'Add Payment'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
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

	const [selectedAmenities, setSelectedAmenities] = useState<Charge[]>([]);
	const [selectedDamages, setSelectedDamages] = useState<Charge[]>([]);
	const [isAddBookingChargeDialogOpen, setIsAddBookingChargeDialogOpen] = useState(false);
	const [chargeType, setChargeType] = useState<'amenity' | 'damage'>('amenity');
	const [isFindClientsDialogOpen, setIsFindClientsDialogOpen] = useState(false);
	const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

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

	const { data, setData, post, put, processing, errors } = useForm(emptyForm);

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
	};

	// Calculate duration when dates change
	useEffect(() => {
		if (dateRange.from && dateRange.to) {
			// Create date-only objects (time set to 00:00:00)
			const fromDate = new Date(dateRange.from);
			const toDate = new Date(dateRange.to);

			fromDate.setHours(0, 0, 0, 0);
			toDate.setHours(0, 0, 0, 0);

			// Calculate duration using date-only objects
			const timeDiff = toDate.getTime() - fromDate.getTime();
			const duration = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

			// Combine CHECK-IN date + time for saving to database
			const checkInDate = new Date(dateRange.from);
			if (checkInTime) {
				const [hours, minutes] = checkInTime.split(':');
				checkInDate.setHours(Number(hours));
				checkInDate.setMinutes(Number(minutes));
				checkInDate.setSeconds(0);
			}

			// Combine CHECK-OUT date + time for saving to database
			const checkOutDate = new Date(dateRange.to);
			if (checkOutTime) {
				const [hours, minutes] = checkOutTime.split(':');
				checkOutDate.setHours(Number(hours));
				checkOutDate.setMinutes(Number(minutes));
				checkOutDate.setSeconds(0);
			}

			const room = rooms.find((r) => r.id.toString() === selectedRoomId);
			const rate = rates.find((r) => r.id.toString() === selectedRateId);

			let roomAmount = 0;

			if (room && duration > 0) {
				roomAmount = room.price * duration;

				if (rate) {
					if (rate.type === 'percentage') {
						roomAmount = roomAmount * (1 - rate.value / 100);
					} else {
						roomAmount = Math.max(0, roomAmount - rate.value);
					}
				}
			}

			// SAVE datetime with time
			setData('check_in', checkInDate.toISOString());
			setData('check_out', checkOutDate.toISOString());

			setData('total_amount', parseFloat(roomAmount.toFixed(2)));
		}
	}, [dateRange, checkInTime, checkOutTime, selectedRoomId, selectedRateId, rooms, rates, setData]);

	// Update guest count
	useEffect(() => {
		setData('guest_count', parseInt(guestCount) || 1);
	}, [guestCount, setData]);

	const handleErrors = (errors: Record<string, string>, action: 'create' | 'update') => {
		toast.error(`Failed to ${action} booking`);

		Object.values(errors).forEach((message) => {
			toast.error(message);
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

	const handleClose = () => {
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
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
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

	const FindClientsDialog = ({
		open,
		onOpenChange,
		onSelect,
	}: {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onSelect: (client: Client) => void;
	}) => {
		const { clients } = usePage<PageProps>().props;

		const sortedClients = [...clients].sort((a, b) => a.first_name.localeCompare(b.first_name));

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Find Client</DialogTitle>
					</DialogHeader>

					<ScrollArea className='h-90'>
						{sortedClients.map((client: any) => (
							<Button
								key={client.id}
								variant='outline'
								className='mb-2 w-full justify-between'
								onClick={() => {
									onSelect(client);
									onOpenChange(false);
								}}
							>
								<span>
									{client.first_name} {client.last_name}
								</span>
								<span className='text-primary-foreground'>{client.email}</span>
							</Button>
						))}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		);
	};

	const updateStatus = (status: string) => {
		if (!selectedBooking?.id) return;

		router.patch(
			`/bookings/${selectedBooking.id}/status`,
			{ status },
			{
				preserveScroll: true,
				onSuccess: () => {
					toast.success(`Booking ${status.replace('_', ' ')} successfully`);
				},
				onError: () => {
					toast.error('Failed to update booking status');
				},
			},
		);
	};

	const allowedActions: Record<string, string[]> = {
		pending: ['cancelled'],
		confirmed: ['checked_in', 'cancelled', 'no_show'],
		checked_in: ['checked_out'],
		checked_out: [],
		no_show: ['checked_in'],
		cancelled: [],
	};

	const can = (action: string) => !allowedActions[selectedBooking?.status ?? '']?.includes(action);

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
								<p className='text-sm font-medium text-muted-foreground'>Pending</p>
								<p className='text-2xl font-bold'>{stats.pendingBookings}</p>
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
						<Dialog
							open={isDialogOpen}
							onOpenChange={(open) => {
								if (!open) {
									resetForm();
								}
								setIsDialogOpen(open);
							}}
						>
							<DialogTrigger asChild>
								<Button className='flex items-center'>
									<Plus className='h-4 w-4' />
									New Booking
								</Button>
							</DialogTrigger>
							<DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-5xl'>
								<form onSubmit={handleSubmit}>
									<FieldGroup>
										<FieldSet>
											<FieldLegend>{isEditMode ? 'Edit Booking' : 'New Booking'}</FieldLegend>
											<FieldSeparator />

											<div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
												{/* Left Column */}
												<div className='space-y-8'>
													<div>
														<div className='mb-2 flex flex-row items-center gap-2'>
															<h3 className='text-lg font-semibold'>Guest Information</h3>
															<Button
																type='button'
																size='sm'
																className='h-6 rounded-full'
																onClick={() => {
																	setIsFindClientsDialogOpen(true);
																}}
															>
																<UserSearch />
																Find
															</Button>
														</div>
														<FieldGroup className='-space-y-2'>
															<FieldGroup className='grid grid-cols-2 gap-4'>
																<Field>
																	<FieldLabel htmlFor='first_name'>First Name</FieldLabel>
																	<Input
																		id='first_name'
																		type='text'
																		placeholder='John'
																		maxLength={100}
																		value={data.client.first_name}
																		onChange={(e) => setData('client.first_name', e.target.value)}
																	/>
																</Field>
																<Field>
																	<FieldLabel htmlFor='last_name'>Last Name</FieldLabel>
																	<Input
																		id='last_name'
																		type='text'
																		placeholder='Doe'
																		maxLength={100}
																		value={data.client.last_name}
																		onChange={(e) => setData('client.last_name', e.target.value)}
																	/>
																</Field>
															</FieldGroup>

															<FieldGroup className='grid grid-cols-2 gap-4'>
																<Field>
																	<FieldLabel htmlFor='email'>Email Address</FieldLabel>
																	<Input
																		id='email'
																		type='email'
																		placeholder='john.doe@example.com'
																		maxLength={60}
																		value={data.client.email}
																		onChange={(e) => setData('client.email', e.target.value)}
																	/>
																</Field>

																<Field>
																	<FieldLabel htmlFor='contact_number'>Contact Number</FieldLabel>
																	<Input
																		id='contact_number'
																		type='tel'
																		placeholder='09171234567'
																		value={data.client.contact_number}
																		onChange={(e) => setData('client.contact_number', e.target.value)}
																	/>
																</Field>
															</FieldGroup>

															<Field>
																<FieldLabel htmlFor='address'>Address</FieldLabel>
																<Input
																	id='address'
																	type='text'
																	placeholder='Barangay, Municipality/City, Province'
																	value={data.client.address}
																	onChange={(e) => setData('client.address', e.target.value)}
																/>
															</Field>

															<Field>
																<FieldLabel htmlFor='address'>Company</FieldLabel>
																<Input
																	id='company'
																	type='text'
																	placeholder='Example Inc.'
																	value={data.client.company}
																	onChange={(e) => setData('client.company', e.target.value)}
																/>
															</Field>

															<Field>
																<FieldLabel htmlFor='remarks'>Remarks/Special Requests</FieldLabel>
																<Textarea
																	id='remarks'
																	placeholder='Any special requests or requirements...'
																	value={data.remarks}
																	onChange={(e) => setData('remarks', e.target.value)}
																/>
															</Field>
														</FieldGroup>
													</div>

													<div>
														<h3 className='mb-2 text-lg font-semibold'>Payment Information</h3>
														<FieldGroup className='-space-y-2'>
															<Field>
																<FieldLabel htmlFor='rate_id'>Rate Type</FieldLabel>
																<Select
																	value={selectedRateId}
																	onValueChange={(value) => {
																		setSelectedRateId(value);
																		setData('rate_id', value);
																	}}
																>
																	<SelectTrigger>
																		<SelectValue placeholder='Select rate type' />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectGroup>
																			{rates.map((rate) => (
																				<SelectItem key={rate.id} value={rate.id.toString()}>
																					{rate.name}
																					{rate.name === 'Regular'
																						? ''
																						: rate.type === 'percentage'
																							? ` (-${rate.value}%)`
																							: ` (-₱${rate.value})`}
																				</SelectItem>
																			))}
																		</SelectGroup>
																	</SelectContent>
																</Select>
															</Field>
															{!isEditMode && (
																<FieldGroup className='grid grid-cols-2 gap-4'>
																	<Field>
																		<FieldLabel htmlFor='downpayment'>Downpayment</FieldLabel>
																		<Input
																			id='downpayment'
																			type='number'
																			value={data.downpayment}
																			onChange={(e) => setData('downpayment', e.target.value)}
																		/>
																	</Field>
																	<Field>
																		<FieldLabel htmlFor='payment_method'>Payment Method</FieldLabel>
																		<Select
																			value={data.payment_method}
																			onValueChange={(value) => setData('payment_method', value)}
																		>
																			<SelectTrigger>
																				<SelectValue placeholder='Select payment method' />
																			</SelectTrigger>
																			<SelectContent>
																				<SelectGroup>
																					<SelectItem value='cash'>Cash</SelectItem>
																					<SelectItem value='gcash'>GCash</SelectItem>
																					<SelectItem value='credit_card'>Credit Card</SelectItem>
																					<SelectItem value='bank_transfer'>
																						Bank Transfer
																					</SelectItem>
																				</SelectGroup>
																			</SelectContent>
																		</Select>
																	</Field>
																</FieldGroup>
															)}
														</FieldGroup>
													</div>
												</div>

												<FindClientsDialog
													open={isFindClientsDialogOpen}
													onOpenChange={setIsFindClientsDialogOpen}
													onSelect={(client) => {
														setData('client', {
															first_name: client.first_name ?? '',
															last_name: client.last_name ?? '',
															email: client.email ?? '',
															contact_number: client.contact_number ?? '',
															address: client.address ?? '',
															company: client.company ?? '',
														});
													}}
												/>

												{/* Right Column */}
												<div className='flex flex-col justify-between'>
													<div>
														<h3 className='mb-2 text-lg font-semibold'>Stay Details</h3>
														<FieldGroup className='-space-y-2'>
															<Field>
																<FieldLabel htmlFor='date-picker-range'>Dates</FieldLabel>
																<Popover>
																	<PopoverTrigger asChild>
																		<Button
																			variant='outline'
																			id='date-picker-range'
																			className='w-full justify-start px-2.5 font-normal'
																		>
																			<CalendarIcon className='mr-2 h-4 w-4' />
																			{dateRange.from
																				? dateRange.to
																					? `${formatDate(dateRange.from.toISOString())} (${checkInTime}) - ${formatDate(dateRange.to.toISOString())} (${checkOutTime})`
																					: `${formatDate(dateRange.from.toISOString())} ${checkInTime}`
																				: 'Select dates'}
																		</Button>
																	</PopoverTrigger>
																	<PopoverContent className='w-auto p-0' align='start'>
																		<Calendar
																			initialFocus
																			mode='range'
																			defaultMonth={dateRange.from}
																			selected={dateRange}
																			onSelect={(range) =>
																				setDateRange({
																					from: range?.from || undefined,
																					to: range?.to || undefined,
																				})
																			}
																			numberOfMonths={2}
																			disabled={(date) => date < new Date()}
																		/>
																		<FieldSeparator className='-mb-3' />
																		<FieldGroup className='grid grid-cols-3 gap-4 p-4'>
																			<Field>
																				<FieldLabel htmlFor='checkInTime' className='-mb-2'>
																					Check-in Time
																				</FieldLabel>
																				<Input
																					type='time'
																					id='checkInTime'
																					step='900'
																					value={checkInTime}
																					onChange={(e) => setCheckInTime(e.target.value)}
																				/>
																			</Field>
																			<Field>
																				<FieldLabel htmlFor='checkOutTime' className='-mb-2'>
																					Check-out Time
																				</FieldLabel>
																				<Input
																					type='time'
																					id='checkOutTime'
																					step='900'
																					value={checkOutTime}
																					onChange={(e) => setCheckOutTime(e.target.value)}
																				/>
																			</Field>
																			<PopoverClose asChild>
																				<Button className='mt-6 w-full'>Done</Button>
																			</PopoverClose>
																		</FieldGroup>
																	</PopoverContent>
																</Popover>
															</Field>

															<Field>
																<FieldLabel htmlFor='room_id'>Room Selection</FieldLabel>
																<Select
																	value={selectedRoomId}
																	onValueChange={(value) => {
																		setSelectedRoomId(value);
																		setData('room_id', value);
																	}}
																>
																	<SelectTrigger>
																		<SelectValue placeholder='Select Room' />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectGroup>
																			{rooms.map((room) => (
																				<SelectItem key={room.id} value={room.id.toString()}>
																					{room.room_number} - {room.room_type} (₱{room.price})
																				</SelectItem>
																			))}
																		</SelectGroup>
																	</SelectContent>
																</Select>
															</Field>

															<FieldGroup className='grid grid-cols-2 gap-4'>
																<Field>
																	<FieldLabel htmlFor='guest_count'>Number of Guests</FieldLabel>
																	<Select value={guestCount} onValueChange={setGuestCount}>
																		<SelectTrigger>
																			<SelectValue placeholder='Number of guests' />
																		</SelectTrigger>
																		<SelectContent>
																			{[1, 2, 3, 4, 5, 6].map((num) => (
																				<SelectItem key={num} value={num.toString()}>
																					{num}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																</Field>

																<Field>
																	<FieldLabel htmlFor='purpose'>Purpose of Stay</FieldLabel>
																	<Select
																		value={data.purpose}
																		onValueChange={(value) => setData('purpose', value)}
																	>
																		<SelectTrigger>
																			<SelectValue placeholder='Select purpose' />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectGroup>
																				<SelectItem value='Leisure'>Leisure</SelectItem>
																				<SelectItem value='Business/Corporate'>
																					Business/Corporate
																				</SelectItem>
																				<SelectItem value='Events/Social'>Event/Social</SelectItem>
																				<SelectItem value='Government Event'>
																					Government Event
																				</SelectItem>
																			</SelectGroup>
																		</SelectContent>
																	</Select>
																</Field>
															</FieldGroup>

															<Field>
																<FieldLabel htmlFor='booking_type_id'>Booking Type</FieldLabel>
																<Select
																	value={selectedBookingType}
																	onValueChange={(value) => {
																		setSelectedBookingType(value);
																		setData('booking_type_id', value);
																	}}
																>
																	<SelectTrigger>
																		<SelectValue placeholder='Select booking type' />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectGroup>
																			{bookingTypes.map((booking_type) => (
																				<SelectItem
																					key={booking_type.id}
																					value={booking_type.id.toString()}
																				>
																					{booking_type.name}
																				</SelectItem>
																			))}
																		</SelectGroup>
																	</SelectContent>
																</Select>
															</Field>
														</FieldGroup>
													</div>

													{/* Summary Card */}
													<div className='rounded-lg border-3 bg-card p-4'>
														<h3 className='mb-2 text-lg font-semibold'>Booking Summary</h3>
														<div className='space-y-2 text-sm'>
															<div className='flex justify-between'>
																<span className='text-muted-foreground'>Room:</span>
																<span>
																	{selectedRoomId
																		? `${rooms.find((r) => r.id.toString() === selectedRoomId)?.room_number} - ${rooms.find((r) => r.id.toString() === selectedRoomId)?.room_type}`
																		: 'Not selected'}
																</span>
															</div>
															<div className='flex justify-between'>
																<span className='text-muted-foreground'>Duration:</span>
																<span>
																	{dateRange.from && dateRange.to
																		? (() => {
																				// Same calculation as in useEffect
																				const fromDate = new Date(dateRange.from);
																				const toDate = new Date(dateRange.to);
																				fromDate.setHours(0, 0, 0, 0);
																				toDate.setHours(0, 0, 0, 0);
																				const duration = Math.max(
																					1,
																					Math.ceil(
																						(toDate.getTime() - fromDate.getTime()) /
																							(1000 * 3600 * 24),
																					),
																				);
																				return `${duration} night(s)`;
																			})()
																		: '0 night(s)'}
																</span>
															</div>
															<div className='flex justify-between'>
																<span className='text-muted-foreground'>Room rate:</span>
																<span>
																	{selectedRoomId
																		? `₱${rooms.find((r) => r.id.toString() === selectedRoomId)?.price} per night`
																		: '₱0.00'}
																</span>
															</div>
															<div className='flex justify-between'>
																<span className='text-muted-foreground'>Downpayment:</span>
																<span>₱{parseFloat(data.downpayment || '0').toFixed(2)}</span>
															</div>
															<div className='mt-2 border-t pt-2'>
																<div className='flex justify-between font-semibold'>
																	<span>Total Amount:</span>
																	<span className='text-lg'>₱{data.total_amount.toFixed(2)}</span>
																</div>
																<div className='mt-1 flex justify-between text-muted-foreground'>
																	<span>Balance due at check-in:</span>
																	<span>
																		₱
																		{(data.total_amount - parseFloat(data.downpayment || '0')).toFixed(
																			2,
																		)}
																	</span>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>

											<FieldSeparator />

											<div className='flex flex-col-reverse items-center justify-between gap-4 sm:flex-row'>
												<div className='text-sm text-muted-foreground'>
													<p></p>
												</div>
												<div className='flex w-full gap-3 sm:w-auto'>
													<Button
														type='button'
														variant='outline'
														className='flex-1 sm:flex-none'
														onClick={() => handleClose()}
													>
														Cancel
													</Button>
													<Button type='submit' disabled={processing}>
														{processing
															? isEditMode
																? 'Updating...'
																: 'Creating...'
															: isEditMode
																? 'Update Booking'
																: 'Create Booking'}
													</Button>
												</div>
											</div>
										</FieldSet>
									</FieldGroup>
								</form>
							</DialogContent>
						</Dialog>
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
											{/* <TableCell className="font-medium">#{booking.id.toString().padStart(6, '0')}</TableCell> */}
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
											<TableCell>{formatDateTime(booking.check_in)}</TableCell>
											<TableCell>{formatDateTime(booking.check_out)}</TableCell>
											<TableCell>
												<StatusBadge
													status={
														booking.status as
															| 'confirmed'
															| 'pending'
															| 'checked_in'
															| 'checked_out'
															| 'cancelled'
													}
												/>
											</TableCell>
											<TableCell className='text-right'>
												<div className='font-medium'>₱{Number(booking.total_amount).toFixed(2)}</div>
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
			<Dialog
				open={isBookingInfoDialogOpen}
				onOpenChange={(open) => {
					setIsBookingInfoDialogOpen(open);
					if (!open) setSelectedBooking(null);
				}}
			>
				<DialogContent className='lg:min-w-200'>
					<div className='lg:flex'>
						<div className='mr-4 flex-4 space-y-4 px-4 pr-8 lg:border-r-1'>
							<div>
								<DialogHeader className='flex flex-row justify-between font-semibold'>
									<span>Booking Info</span>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' className='h-full rounded-full p-1'>
												<StatusBadge
													status={
														(selectedBooking?.status as
															| 'confirmed'
															| 'pending'
															| 'checked_in'
															| 'checked_out'
															| 'cancelled') || 'pending'
													}
												/>
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent>
											<DropdownMenuItem
												className='focus:text-blue-500'
												onClick={() => updateStatus('checked_in')}
												disabled={can('checked_in')}
											>
												<CheckCircleIcon className='mr-2 h-4 w-4' />
												Check In
											</DropdownMenuItem>

											<DropdownMenuItem
												className='focus:text-red-700'
												onClick={() => updateStatus('checked_out')}
												disabled={can('checked_out')}
											>
												<EyeIcon className='mr-2 h-4 w-4' />
												Check Out
											</DropdownMenuItem>

											<DropdownMenuItem
												className='focus:text-orange-600'
												onClick={() => updateStatus('no_show')}
												disabled={can('no_show')}
											>
												<EyeOff className='mr-2 h-4 w-4' />
												No Show
											</DropdownMenuItem>

											<DropdownMenuSeparator />

											<DropdownMenuItem
												className='text-destructive focus:bg-red-200'
												onClick={() => updateStatus('cancelled')}
												disabled={can('cancelled')}
											>
												<TrashIcon className='mr-2 h-4 w-4' />
												Cancel Booking
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</DialogHeader>
								<DialogDescription className='space-y-1 py-2'>
									<div className='flex justify-between'>
										<span>Booking ID</span>
										<span>BK-{selectedBooking?.id}</span>
									</div>
									<div className='flex justify-between'>
										<span>Booking Date</span>
										<span>{selectedBooking && formatDate(selectedBooking.created_at)}</span>
									</div>
									<div className='flex justify-between'>
										<span>Booking Time</span>
										<span>{selectedBooking && formatTime(selectedBooking.created_at)}</span>
									</div>
									<div className='flex justify-between'>
										<span>Booking Type</span>
										<span>{selectedBooking?.booking_type.name}</span>
									</div>
									<div className='flex justify-between'>
										<span>Purpose of Booking</span>
										<span>{selectedBooking?.purpose}</span>
									</div>
								</DialogDescription>
							</div>
							<div>
								<DialogHeader className='text-left font-semibold'>Room Details</DialogHeader>
								<DialogDescription className='space-y-1 py-2'>
									<div className='flex justify-between'>
										<span>Room Type</span>
										<span>{selectedBooking?.room.room_type}</span>
									</div>
									<div className='flex justify-between'>
										<span>Room Number</span>
										<span>{selectedBooking?.room.room_number}</span>
									</div>
									<div className='flex justify-between'>
										<span>Number of Guests</span>
										<span>{selectedBooking?.guest_count}</span>
									</div>
								</DialogDescription>
							</div>
							<div>
								<DialogHeader className='text-left font-semibold'>Check-In / Check-Out</DialogHeader>
								<DialogDescription className='space-y-1 py-2'>
									<div className='flex justify-between'>
										<span>Check-In Date</span>
										<span>{selectedBooking && formatDate(selectedBooking.check_in)}</span>
									</div>
									<div className='flex justify-between'>
										<span>Check-In Time</span>
										<span>{selectedBooking && formatTime(selectedBooking.check_in)}</span>
									</div>
									<div className='flex justify-between'>
										<span>Check-Out Date</span>
										<span>{selectedBooking && formatDate(selectedBooking.check_out)}</span>
									</div>
									<div className='flex justify-between'>
										<span>Check-Out Time</span>
										<span>{selectedBooking && formatTime(selectedBooking.check_out)}</span>
									</div>
								</DialogDescription>
							</div>
							<div>
								<DialogHeader className='text-left font-semibold'>Special Request</DialogHeader>
								<DialogDescription className='py-2'>{selectedBooking?.remarks}</DialogDescription>
							</div>
						</div>

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
								<DialogDescription className='flex items-center'>
									<Phone className='mr-2 size-4' />
									{selectedBooking?.client.contact_number}
								</DialogDescription>
								<DialogDescription className='flex items-center'>
									<AtSign className='mr-2 size-4' />
									{selectedBooking?.client.email}
								</DialogDescription>
								<DialogDescription className='flex items-center'>
									<MapPin className='mr-2 size-4' />
									{selectedBooking?.client.address}
								</DialogDescription>
							</div>
							<Separator className='my-2' />

							<AddChargeDialog
								open={isAddBookingChargeDialogOpen}
								onOpenChange={setIsAddBookingChargeDialogOpen}
								booking={selectedBooking}
							/>

							<AddPaymentDialog
								open={isAddPaymentDialogOpen}
								onOpenChange={setIsAddPaymentDialogOpen}
								booking={selectedBooking}
							/>

							<div className='mt-auto pt-4 pb-8'>
								<div className='flex items-center justify-between'>
									<DialogHeader className='font-semibold'>Bill</DialogHeader>
									<div>
										<div className='flex flex-row gap-2'>
											<Button
												className='h-6 items-center text-xs'
												size='sm'
												onClick={() => {
													setIsAddBookingChargeDialogOpen(true);
												}}
											>
												<Plus className='size-3' />
												Charge
											</Button>
											<Button
												className='h-6 items-center text-xs'
												size='sm'
												onClick={() => {
													setIsAddPaymentDialogOpen(true);
												}}
											>
												<Plus className='size-3' />
												Payment
											</Button>
										</div>
									</div>
								</div>
								<DialogDescription className='space-y-1 pt-4 pb-2'>
									<div className='flex justify-between text-primary-foreground'>
										<span>Room ({selectedBooking?.rate?.name || 'N/A'})</span>
										<span>{selectedBooking?.total_amount}</span>
									</div>
									{(selectedBooking?.booking_charges ?? [])
										.filter((bc) => bc.charge?.type === 'amenity')
										.map((amenity) => (
											<div key={amenity.id} className='flex justify-between'>
												<span>
													{amenity.charge?.name} {amenity.quantity > 1 ? `x${amenity.quantity}` : ''}
												</span>
												<span>{amenity.total}</span>
											</div>
										))}
									{(selectedBooking?.booking_charges ?? [])
										.filter((bc) => bc.charge?.type === 'damage')
										.map((damage) => (
											<div key={damage.id} className='flex justify-between'>
												<span>
													{damage.charge?.name} {damage.quantity > 1 ? `x${damage.quantity}` : ''}
												</span>
												<span>{damage.total}</span>
											</div>
										))}
									<Separator className='my-2' />
									<div className='flex justify-between font-bold text-primary-foreground dark:text-primary'>
										<span>Sub Total</span>
										<span>
											{' '}
											{(
												Number(selectedBooking?.total_amount ?? 0) +
												(selectedBooking?.booking_charges ?? []).reduce(
													(sum, charge) => sum + Number(charge.total ?? 0),
													0,
												)
											).toFixed(2)}
										</span>
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
										<span>
											₱{' '}
											{(
												Number(selectedBooking?.total_amount ?? 0) +
												(selectedBooking?.booking_charges ?? []).reduce(
													(sum, bookingCharge) => sum + Number(bookingCharge.total ?? 0),
													0,
												) -
												(selectedBooking?.payments ?? []).reduce(
													(sum, payment) => sum + Number(payment.amount ?? 0),
													0,
												)
											).toFixed(2)}
										</span>
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
								onClick={() => {
									if (!selectedBooking) return;
									setIsBookingInfoDialogOpen(false);
									setIsDialogOpen(true);
									setIsEditMode(true);
									setEditingBookingId(selectedBooking.id);

									setSelectedRoomId(selectedBooking.room.id.toString());
									setSelectedRateId(selectedBooking.rate?.id?.toString() || '');
									setSelectedBookingType(selectedBooking.booking_type?.id?.toString() || '');
									setGuestCount(selectedBooking.guest_count.toString());

									setDateRange({
										from: new Date(selectedBooking.check_in),
										to: new Date(selectedBooking.check_out),
									});

									setData({
										client: {
											first_name: selectedBooking.client.first_name,
											last_name: selectedBooking.client.last_name,
											email: selectedBooking.client.email || '',
											contact_number: selectedBooking.client.contact_number,
											address: selectedBooking.client.address || '',
											company: selectedBooking.client.company || '',
										},
										room_id: selectedBooking.room.id.toString(),
										rate_id: selectedBooking.rate?.id?.toString() || '',
										check_in: selectedBooking.check_in,
										check_out: selectedBooking.check_out,
										guest_count: Number(selectedBooking.guest_count),
										purpose: selectedBooking.purpose || '',
										booking_type_id: selectedBooking.booking_type?.id?.toString() || '',
										total_amount: Number(selectedBooking.total_amount),
										downpayment: '',
										payment_method: '',
										remarks: selectedBooking.remarks || '',
									});
								}}
							>
								Edit
							</Button>
						</DialogClose>
						{selectedBooking?.id !== undefined && <SoaPdf booking_id={selectedBooking.id} />}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}
