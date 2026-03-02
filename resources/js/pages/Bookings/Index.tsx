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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
	};
	room: {
		room_number: string;
		room_type: string;
	};
	guest_count: string;
	check_in: string;
	check_out: string;
	status: 'confirmed' | 'pending' | 'checked-in' | 'checked-out' | 'cancelled';
	total_amount: number;
	remarks: string;
	balance: number;
	payments: Array<{
		amount: number;
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

type BookingType = {
	id: number;
	name: string;
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

// Add PageProps type definition
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
	'checked-in': {
		label: 'Checked In',
		variant: 'default' as const,
		icon: CheckCircleIcon,
		color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
	},
	'checked-out': {
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
};

const AddChargeDialog = ({
	open,
	onOpenChange,
	onSelect,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (charge: Charge) => void;
}) => {
	const { charges } = usePage<PageProps>().props;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='min-w-200'>
				<DialogHeader>
					<DialogTitle>Add Charge</DialogTitle>
				</DialogHeader>
				<div className='flex flex-row gap-6'>
					<div className='flex-1 space-y-2'>
						<DialogDescription>Amenities</DialogDescription>
						<ScrollArea className='h-90'>
							{charges
								.filter((charge: any) => charge.type === 'amenity')
								.map((charge: any) => (
									<Button
										key={charge.id}
										variant='outline'
										className='mb-2 w-full justify-between'
										onClick={() => {
											onSelect(charge);
											onOpenChange(false);
										}}
									>
										<span>{charge.name}</span>
										<span className='text-muted-foreground'>₱{charge.value}</span>
									</Button>
								))}
						</ScrollArea>
					</div>
					<div className='flex-1 space-y-2'>
						<DialogDescription>Damages</DialogDescription>
						<ScrollArea className='h-90'>
							{charges
								.filter((charge: any) => charge.type === 'damage')
								.map((charge: any) => (
									<Button
										key={charge.id}
										variant='outline'
										className='mb-2 w-full justify-between'
										onClick={() => {
											onSelect(charge);
											onOpenChange(false);
										}}
									>
										<span>{charge.name}</span>
										<span className='text-muted-foreground'>₱{charge.value}</span>
									</Button>
								))}
						</ScrollArea>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant='outline'>Cancel</Button>
					</DialogClose>
				</DialogFooter>
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
	const [isAddChargeDialogOpen, setIsAddChargeDialogOpen] = useState(false);
	const [chargeType, setChargeType] = useState<'amenity' | 'damage'>('amenity');
	const [isFindClientsDialogOpen, setIsFindClientsDialogOpen] = useState(false);

	const [checkInTime, setCheckInTime] = useState('8:00');
	const [checkOutTime, setCheckOutTime] = useState('17:00');

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

	const { data, setData, post, processing, errors } = useForm(emptyForm);

	// Use the PageProps type
	const { bookings, stats, rooms, rates, bookingTypes, charges } = usePage<PageProps>().props;

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

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();

		// Use Inertia's post method directly
		post('/bookings', {
			onSuccess: () => {
				// Show success toast
				toast.success('Booking created successfully!', {
					description: 'The booking has been added to the system.',
					duration: 5000,
					action: {
						label: 'View',
						onClick: () => router.get('/bookings'),
					},
				});

				setIsDialogOpen(false);
				setDateRange({ from: undefined, to: undefined });
				setSelectedRoomId('');
				setSelectedRateId('');
				setSelectedBookingType('');
				setGuestCount('1');
				setData(emptyForm);
				setCheckInTime('08:00');
				setCheckOutTime('17:00');
			},
			onError: (errors) => {
				// Show error toast
				toast.error('Failed to create booking', {
					description: 'Please check the form for errors and try again.',
					duration: 5000,
				});

				// You can also show specific error messages
				if (
					(errors.client as { first_name?: string; last_name?: string })?.first_name ||
					(errors.client as { first_name?: string; last_name?: string })?.last_name
				) {
					toast.error('Please fill in guest information correctly');
				}
				if (errors.room_id) {
					toast.error('Please select a valid room');
				}
			},
		});
	};

	const handleClose = () => {
		setIsDialogOpen(false);
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
		const config = statusConfig[status];
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
	
		const sortedClients = [...clients].sort((a, b) =>
			a.first_name.localeCompare(b.first_name)
		);
	
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
									{client.first_name} {client.last_name} Added Charge
								</span>
								<span className='text-primary-foreground'>
									{client.email}
								</span>
							</Button>
						))}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		);
	};



	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<div className='p-6'>
				<Head title='Bookings' />

				{/* Stats overview */}
				<div className='flex flex-row gap-4 pb-4'>
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
						<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
											<FieldLegend>New Booking</FieldLegend>
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
																		required
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
																		required
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
																		required
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
																<textarea
																	id='remarks'
																	placeholder='Any special requests or requirements...'
																	className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
																	rows={3}
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
																				<SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
																			</SelectGroup>
																		</SelectContent>
																	</Select>
																</Field>
															</FieldGroup>
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
																	required
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
													<Button type='submit' className='flex-1 sm:flex-none' disabled={processing}>
														{processing ? 'Creating...' : 'Create Booking'}
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
									<TableHead className='text-right'></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{bookings.data.map((booking) => {
									const totalPaid = booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
									const balance = booking.total_amount - totalPaid;

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
												<StatusBadge status={booking.status} />
											</TableCell>
											<TableCell className='text-right'>
												<div className='font-medium'>₱{Number(booking.total_amount).toFixed(2)}</div>
												<div className='text-sm text-muted-foreground'>Balance: ₱{balance.toFixed(2)}</div>
											</TableCell>
											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='icon'>
															<MoreHorizontalIcon className='h-4 w-4' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem>
															<EyeIcon className='mr-2 h-4 w-4' />
															View Details
														</DropdownMenuItem>
														<DropdownMenuItem>
															<EditIcon className='mr-2 h-4 w-4' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem className='text-destructive'>
															<TrashIcon className='mr-2 h-4 w-4' />
															Cancel Booking
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
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
				<DialogContent className='min-w-180'>
					<div className='flex flex-row'>
						<div className='flex-1 space-y-4 px-4'>
							<div>
								<DialogHeader className='flex flex-row justify-between font-semibold'>
									<span>Booking Info</span>
									<StatusBadge status={selectedBooking?.status || 'pending'} />
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
								</DialogDescription>
							</div>
							<div>
								<DialogHeader className='font-semibold'>Room Details</DialogHeader>
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
									<div className='flex justify-between'>
										<span>Sub Total</span>
										<span>7000.00</span>
									</div>
								</DialogDescription>
							</div>
							<div>
								<DialogHeader className='font-semibold'>Check-In / Check-Out</DialogHeader>
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
								<DialogHeader className='font-semibold'>Special Request</DialogHeader>
								<DialogDescription className='py-2'>{selectedBooking?.remarks}</DialogDescription>
							</div>
						</div>
						<Separator orientation='vertical' className='mx-4' />
						<div className='flex-1 px-4'>
							<DialogHeader className='font-semibold'>Guest Profile</DialogHeader>
							<div className='flex items-center p-2'>
								<CircleUserRound className='mr-3 size-12 text-primary-foreground' />
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
							<div>
								<div className='flex items-center justify-between'>
									<DialogHeader className='font-semibold'>Additional</DialogHeader>
									<div className='flex gap-2'>
										<Button
											className='flex h-6 h-7 items-center text-xs'
											size='sm'
											onClick={() => {
												setIsAddChargeDialogOpen(true);
											}}
										>
											<Plus className='size-3' />
											Add
										</Button>
									</div>
								</div>

								{/* Amenities Section */}
								<DialogDescription className='py-2 font-medium'>Amenities</DialogDescription>
								<div className='mb-4 flex flex-wrap gap-2'>
									{selectedAmenities.length > 0 ? (
										selectedAmenities.map((amenity) => (
											<Badge key={amenity.id} className='flex items-center gap-1 pr-1'>
												{amenity.name}
												<button
													onClick={() => setSelectedAmenities((prev) => prev.filter((a) => a.id !== amenity.id))}
													className='ml-1 hover:text-destructive'
												>
													×
												</button>
											</Badge>
										))
									) : (
										<DialogDescription className='text-sm text-muted-foreground'>No amenities added</DialogDescription>
									)}
								</div>

								{/* Damages Section */}
								<DialogDescription className='py-2 font-medium'>Damages</DialogDescription>
								<div className='flex flex-wrap gap-2'>
									{selectedDamages.length > 0 ? (
										selectedDamages.map((damage) => (
											<Badge key={damage.id} className='flex items-center gap-1 pr-1'>
												{damage.name}
												<button
													onClick={() => setSelectedDamages((prev) => prev.filter((d) => d.id !== damage.id))}
													className='ml-1 hover:text-destructive'
												>
													×
												</button>
											</Badge>
										))
									) : (
										<DialogDescription className='text-sm text-muted-foreground'>No damages added</DialogDescription>
									)}
								</div>
							</div>

							<AddChargeDialog
								open={isAddChargeDialogOpen}
								onOpenChange={setIsAddChargeDialogOpen}
								onSelect={(charge) => {
									if (charge.type === 'amenity') {
										setSelectedAmenities((prev) => [...prev, charge]);
									} else {
										setSelectedDamages((prev) => [...prev, charge]);
									}
								}}
							/>

							<div className='py-8'>
								<div className='flex items-center justify-between'>
									<DialogHeader className='font-semibold'>Bill</DialogHeader>
									<div className='flex gap-2'>
										<Button
											className='flex h-6 h-7 items-center text-xs'
											size='sm'
											onClick={() => {
												setIsAddChargeDialogOpen(true);
											}}
										>
											<Plus className='size-3' />
											Add Payment
										</Button>
									</div>
								</div>
								<DialogDescription className='space-y-1 py-2'>
									<div className='flex justify-between'>
										<span>Downpayment</span>
										<span>-4000.00</span>
									</div>
									<div className='flex justify-between'>
										<span>Employee Rate</span>
										<span>-790.00</span>
									</div>
									<Separator />
									<div className='flex justify-between'>
										<span className='font-bold text-primary-foreground'>Balance</span>
										<span className='font-bold text-primary-foreground'>{selectedBooking?.total_amount}</span>
									</div>
								</DialogDescription>
							</div>
						</div>
					</div>
					<DialogFooter className='-mt-8'>
						<DialogClose asChild>
							<Button type='button' variant='outline'>
								Edit
							</Button>
						</DialogClose>
						<Button type='submit'>Print SOA</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}
