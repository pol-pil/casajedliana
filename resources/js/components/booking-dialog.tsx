import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from './ui/field';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CalendarIcon, UserSearch } from 'lucide-react';
import InputComponent from '@/components/input-component';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import SelectComponent from '@/components/select-component';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { PopoverClose } from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

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
	is_custom: boolean;
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
		pencilBookings: number;
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
	roomBlockedDates: Record<string, Array<{ from: string; to: string; booking_id: number }>>;
	filters: {
		searchName?: string;
	};
};

interface BookingFormDialogProps {
	data: any;
	setData: any;
	isDialogOpen: boolean;
	setIsDialogOpen: (open: boolean) => void;
	handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	resetForm: () => void;
	clearErrors: () => void;
	isEditMode: boolean;
	children: React.ReactNode;
	processing: boolean;
	errors: any;
	selectedBooking?: Booking | null;
	selectedRoomId: string;
	setSelectedRoomId: (value: string) => void;
	selectedRateId: string;
	setSelectedRateId: (value: string) => void;
	selectedBookingType: string;
	setSelectedBookingType: (value: string) => void;
	guestCount: string;
	setGuestCount: (value: string) => void;
	dateRange: { from: Date | undefined; to: Date | undefined };
	setDateRange: (value: { from: Date | undefined; to: Date | undefined }) => void;
	checkInTime: string;
	setCheckInTime: (value: string) => void;
	checkOutTime: string;
	setCheckOutTime: (value: string) => void;
}

const FindClientsDialog = ({
	open,
	onOpenChange,
	onSelect,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (client: Client) => void;
}) => {
	const { clients, filters } = usePage<PageProps>().props;

	const [searchName, setSearchName] = useState(filters.searchName || '');

	useEffect(() => {
		const delay = setTimeout(() => {
			router.get(
				'/bookings',
				{ searchName },
				{
					preserveState: true,
					replace: true,
				},
			);
		}, 300);

		return () => clearTimeout(delay);
	}, [searchName]);

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) setSearchName('');
				onOpenChange(isOpen);
			}}
		>
			<DialogContent>
				<DialogHeader className='flex flex-row items-center gap-4'>
					<DialogTitle>Find Client</DialogTitle>
					<Input
						placeholder='Search client...'
						value={searchName}
						onChange={(e) => setSearchName(e.target.value)}
						className='w-50'
					/>
				</DialogHeader>

				<ScrollArea className='h-90'>
					{clients.map((client: any) => (
						<Button
							key={client.id}
							variant='outline'
							className='mb-2 w-full justify-between'
							onClick={() => {
								onSelect(client);
								onOpenChange(false);
								setSearchName('');
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

export default function BookingFormDialog({
	data,
	setData,
	selectedBooking,
	isDialogOpen,
	setIsDialogOpen,
	handleSubmit,
	resetForm,
	clearErrors,
	isEditMode,
	children,
	processing,
	errors,
	selectedRoomId,
	setSelectedRoomId,
	selectedRateId,
	setSelectedRateId,
	selectedBookingType,
	setSelectedBookingType,
	guestCount,
	setGuestCount,
	dateRange,
	setDateRange,
	checkInTime,
	setCheckInTime,
	checkOutTime,
	setCheckOutTime,
}: BookingFormDialogProps) {
	const [isFindClientsDialogOpen, setIsFindClientsDialogOpen] = useState(false);
	const [customDiscount, setCustomDiscount] = useState('');
	const [customDiscountType, setCustomDiscountType] = useState<'percentage' | 'exact'>('percentage');

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

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

	// Use the PageProps type
	const { rooms, rates, bookingTypes, roomBlockedDates } = usePage<PageProps>().props;

	const disabledDates = (date: Date): boolean => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Disable past dates
		if (date < today) return true;

		// If no room selected, only block past dates
		if (!selectedRoomId) return false;

		// Check if room itself is under maintenance/reserved status
		const room = rooms.find((r) => r.id.toString() === selectedRoomId);
		if (room && ['maintenance', 'reserved'].includes(room.status)) return true;

		// Check blocked date ranges for selected room
		const blocked = roomBlockedDates[selectedRoomId] ?? [];
		return blocked.some(({ from, to, booking_id }) => {
			// In edit mode, skip the current booking's own blocked range
			if (isEditMode && selectedBooking && booking_id === selectedBooking.id) return false;

			const fromDate = new Date(from);
			const toDate = new Date(to);
			fromDate.setHours(0, 0, 0, 0);
			toDate.setHours(0, 0, 0, 0);
			return date >= fromDate && date <= toDate;
		});
	};

	useEffect(() => {
		if (dateRange.from && dateRange.to) {
			const fromDate = new Date(dateRange.from);
			const toDate = new Date(dateRange.to);

			fromDate.setHours(0, 0, 0, 0);
			toDate.setHours(0, 0, 0, 0);
			const timeDiff = toDate.getTime() - fromDate.getTime();
			const duration = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
			const checkInDate = new Date(dateRange.from);
			if (checkInTime) {
				const [hours, minutes] = checkInTime.split(':');
				checkInDate.setHours(Number(hours));
				checkInDate.setMinutes(Number(minutes));
				checkInDate.setSeconds(0);
			}
			const checkOutDate = new Date(dateRange.to);
			if (checkOutTime) {
				const [hours, minutes] = checkOutTime.split(':');
				checkOutDate.setHours(Number(hours));
				checkOutDate.setMinutes(Number(minutes));
				checkOutDate.setSeconds(0);
			}

			const room = rooms.find((r) => r.id.toString() === selectedRoomId);

			let roomAmount = 0;

			const rate = selectedRateId !== 'custom' 
			? rates.find((r) => r.id.toString() === selectedRateId) 
			: null;
		
		if (room && duration > 0) {
			roomAmount = room.price * duration;
		
			if (selectedRateId === 'custom' && customDiscount && parseFloat(customDiscount) > 0) {
				// Custom discount calculation
				if (customDiscountType === 'percentage') {
					roomAmount = roomAmount * (1 - parseFloat(customDiscount) / 100);
				} else {
					roomAmount = Math.max(0, roomAmount - parseFloat(customDiscount));
				}
			} else if (rate) {
				// Preset rate calculation
				if (rate.type === 'percentage') {
					roomAmount = roomAmount * (1 - rate.value / 100);
				} else {
					roomAmount = Math.max(0, roomAmount - rate.value);
				}
			}
		}

			setData('check_in', checkInDate.toISOString());
			setData('check_out', checkOutDate.toISOString());

			setData('total_amount', parseFloat(roomAmount.toFixed(2)));

			if (!selectedRoomId) return;

			const isStillAvailable = roomOptions.some((r) => r.value === selectedRoomId && !r.disabled);
			if (!isStillAvailable && !isEditMode) {
				setSelectedRoomId('');
				setData('room_id', '');
			}
		}
	}, [dateRange, checkInTime, checkOutTime, selectedRoomId, selectedRateId, customDiscount, customDiscountType, rooms, rates, setData]);

	const getBlockedRoomIds = (): Set<string> => {
		// In edit mode, never disable any rooms in the select
		if (isEditMode) return new Set();

		const blocked = new Set<string>();
		rooms.forEach((room) => {
			// Block rooms with unavailable status
			if (['maintenance', 'reserved'].includes(room.status)) {
				blocked.add(room.id.toString());
				return;
			}

			// Block rooms whose date ranges overlap the selected date range
			if (dateRange.from && dateRange.to) {
				const ranges = roomBlockedDates[room.id.toString()] ?? [];
				const from = new Date(dateRange.from);
				const to = new Date(dateRange.to);
				from.setHours(0, 0, 0, 0);
				to.setHours(0, 0, 0, 0);
				const isBlocked = ranges.some(({ from: f, to: t }) => {
					const fd = new Date(f);
					fd.setHours(0, 0, 0, 0);
					const td = new Date(t);
					td.setHours(0, 0, 0, 0);
					return from <= td && to >= fd;
				});
				if (isBlocked) blocked.add(room.id.toString());
			}
		});
		return blocked;
	};

	const blockedRoomIds = getBlockedRoomIds();

	const roomOptions = rooms.map((room) => {
		const isUnavailable = blockedRoomIds.has(room.id.toString());
		return {
			value: room.id.toString(),
			label: `${room.room_number} - ${room.room_type} (₱${room.price})${isUnavailable ? ' [Unavailable]' : ''}`,
			disabled: isUnavailable,
		};
	});

	const purposeOptions = ['Leisure', 'Business/Corporate', 'Event/Social', 'Government Event'].map((purpose) => ({
		value: purpose,
		label: purpose,
	}));

	const bookingTypeOptions = bookingTypes.map((type) => ({
		value: type.id.toString(),
		label: type.name,
	}));

	const rateOptions = [
		...rates
			.filter((rate) => isEditMode || !rate.is_custom) // hide custom rates in new booking
			.map((rate) => ({
				value: rate.id.toString(),
				label: `${rate.name} (${rate.type === 'percentage' ? `${rate.value}% off` : `₱${rate.value} off`})`,
			})),
		...(!isEditMode ? [{ value: 'custom', label: 'Custom Discount' }] : []),
	];

	const paymentMethodOptions = ['Cash', 'GCash', 'Credit Card', 'Bank Transfer'].map((method) => ({
		value: method,
		label: method,
	}));

	const resetStayDetails = () => {
		setDateRange({ from: undefined, to: undefined });
		setCheckInTime('08:00');
		setCheckOutTime('17:00');
		setSelectedRoomId('');
		setSelectedRateId('');
		setGuestCount('1');
		setSelectedBookingType('');
		setCustomDiscount('');
		setCustomDiscountType('percentage');
	};

	return (
		<Dialog
			open={isDialogOpen}
			onOpenChange={(open) => {
				if (!open) {
					resetForm();
					clearErrors();
					resetStayDetails();
				}
				setIsDialogOpen(open);
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>

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
											{!isEditMode && (
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
											)}
										</div>
										<FieldGroup className='-space-y-2'>
											<FieldGroup className='grid grid-cols-2 gap-4'>
												<InputComponent
													label='First Name'
													id='first_name'
													type='text'
													placeholder='John'
													maxLength={100}
													value={data.client.first_name}
													onChange={(e) => setData('client.first_name', e.target.value)}
													error={errors['client.first_name']}
												/>
												<InputComponent
													label='Last Name'
													id='last_name'
													type='text'
													placeholder='Doe'
													maxLength={100}
													value={data.client.last_name}
													onChange={(e) => setData('client.last_name', e.target.value)}
													error={errors['client.last_name']}
												/>
											</FieldGroup>

											<FieldGroup className='grid grid-cols-2 gap-4'>
												<InputComponent
													label='Email Address'
													id='email'
													type='email'
													placeholder='john.doe@example.com'
													maxLength={60}
													value={data.client.email}
													onChange={(e) => setData('client.email', e.target.value)}
													error={errors['client.email']}
												/>
												<InputComponent
													label='Contact Number'
													id='contact_number'
													type='tel'
													placeholder='09171234567'
													value={data.client.contact_number}
													onChange={(e) => setData('client.contact_number', e.target.value)}
													error={errors['client.contact_number']}
												/>
											</FieldGroup>

											<InputComponent
												label='Address'
												id='address'
												type='text'
												placeholder='Barangay, Municipality/City, Province'
												value={data.client.address}
												onChange={(e) => setData('client.address', e.target.value)}
												error={errors['client.address']}
											/>

											<InputComponent
												label='Company'
												id='company'
												type='text'
												placeholder='Example Inc.'
												value={data.client.company}
												onChange={(e) => setData('client.company', e.target.value)}
												error={errors['client.company']}
											/>

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
											<FieldGroup className='flex flex-row gap-2'>
												<SelectComponent
													id='rate_id'
													label='Discount'
													placeholder='Select discount'
													value={selectedRateId}
													onChange={(value) => {
														setSelectedRateId(value);
														if (value !== 'custom') {
															setData('rate_id', value);
															setCustomDiscount(''); // clear custom when preset selected
														} else {
															setData('rate_id', ''); // clear rate_id, will be set by backend
														}
													}}
													options={rateOptions}
													error={errors.rate_id}
												/>

												{selectedRateId === 'custom' && (
													<FieldGroup className='flex flex-row gap-2'>
														{/* <SelectComponent
															id='custom_discount_type'
															label='Type'
															placeholder='Type'
															value={customDiscountType}
															onChange={(value) => setCustomDiscountType(value as 'percentage' | 'exact')}
															options={[
																{ value: 'percentage', label: 'Percentage %' },
																{ value: 'exact', label: 'Exact ₱' },
															]}
														/> */}
														<InputComponent
															label={customDiscountType === 'percentage' ? 'Discount (%)' : 'Discount (₱)'}
															id='custom_discount'
															type='number'
															placeholder='0'
															value={customDiscount}
															onChange={(e) => {
																setCustomDiscount(e.target.value);
																setData('custom_discount', e.target.value);
																setData('custom_discount_type', customDiscountType);
															}}
														/>
													</FieldGroup>
												)}
											</FieldGroup>

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

													<SelectComponent
														id='payment_method'
														label='Payment Method'
														placeholder='Select payment method'
														value={data.payment_method}
														onChange={(value) => {
															setData('payment_method', value);
														}}
														options={paymentMethodOptions}
														error={errors.payment_method}
													/>
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
															className={cn(
																'w-full justify-start px-2.5 font-normal',
																errors.check_in && 'border-red-500',
															)}
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
															disabled={disabledDates}
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
												{errors.check_in && <p className='-mt-2 text-xs text-red-500'>{errors.check_in}</p>}
											</Field>

											<SelectComponent
												id='room_id'
												label='Room Selection'
												placeholder='Select Room'
												value={selectedRoomId}
												onChange={(value) => {
													setSelectedRoomId(value);
													setData('room_id', value);
												}}
												options={roomOptions}
												error={errors.room_id}
											/>

											<FieldGroup className='grid grid-cols-2 gap-4'>
												<InputComponent
													label='Number of Guests'
													id='guest_count'
													type='number'
													placeholder='Enter a Number'
													value={guestCount}
													onChange={(e) => {
														setGuestCount(e.target.value);
														setData('guest_count', Number(e.target.value));
													}}
													error={errors.guest_count}
												/>

												<SelectComponent
													id='purpose'
													label='Purpose of Stay'
													placeholder='Select purpose'
													value={data.purpose}
													onChange={(value) => {
														setData('purpose', value);
													}}
													options={purposeOptions}
												/>
											</FieldGroup>

											<SelectComponent
												id='booking_type_id'
												label='Booking Type'
												placeholder='Select booking type'
												value={selectedBookingType}
												onChange={(value) => {
													setSelectedBookingType(value);
													setData('booking_type_id', value);
												}}
												options={bookingTypeOptions}
												error={errors.booking_type_id}
											/>
										</FieldGroup>
									</div>

									{/* Summary Card */}
									<div className='mt-4 rounded-lg border-3 bg-card p-4'>
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
																	Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)),
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
													<span>₱{(data.total_amount - parseFloat(data.downpayment || '0')).toFixed(2)}</span>
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
									<Button type='button' variant='outline' className='flex-1 sm:flex-none' onClick={() => resetForm()}>
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
	);
}
