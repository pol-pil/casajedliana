import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from './ui/field';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CalendarIcon, UserSearch } from 'lucide-react';
import InputComponent from '@/components/input-component';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import SelectComponent from '@/components/select-component';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { PopoverClose } from '@radix-ui/react-popover';

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

	const [isFindClientsDialogOpen, setIsFindClientsDialogOpen] = useState(false);

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
			setData('check_in', checkInDate.toISOString());
			setData('check_out', checkOutDate.toISOString());

			setData('total_amount', parseFloat(roomAmount.toFixed(2)));

			if (!selectedRoomId) return;

			const isStillAvailable = roomOptions.some((r) => r.value === selectedRoomId);
			if (!isStillAvailable) {
				setSelectedRoomId('');
				setData('room_id', '');
			}
		}
	}, [dateRange, checkInTime, checkOutTime, selectedRoomId, selectedRateId, rooms, rates, setData]);

	const roomOptions = rooms
		.filter((room) => {
			if (!dateRange.from || !dateRange.to) {
				return !['Maintenance'].includes(room.status);
			}

			const selectedFrom = new Date(dateRange.from);
			const selectedTo = new Date(dateRange.to);
			selectedFrom.setHours(0, 0, 0, 0);
			selectedTo.setHours(0, 0, 0, 0);

			if (['Maintenance'].includes(room.status)) return false;

			const blocked = roomBlockedDates[room.id.toString()] ?? [];
			const hasConflict = blocked.some(({ from, to, booking_id }) => {
				if (isEditMode && selectedBooking && booking_id === selectedBooking.id) return false;

				const blockedFrom = new Date(from);
				const blockedTo = new Date(to);
				blockedFrom.setHours(0, 0, 0, 0);
				blockedTo.setHours(0, 0, 0, 0);

				return selectedFrom <= blockedTo && selectedTo >= blockedFrom;
			});

			return !hasConflict;
		})
		.map((room) => ({
			value: room.id.toString(),
			label: `${room.room_number} - ${room.room_type} (₱${room.price})`,
		}));

	const guestNumberOptions = Array.from({ length: 10 }, (_, i) => ({
		value: (i + 1).toString(),
		label: (i + 1).toString(),
	}));

	const purposeOptions = ['Leisure', 'Business/Corporate', 'Event/Social', 'Government Event'].map((purpose) => ({
		value: purpose,
		label: purpose,
	}));

	const bookingTypeOptions = bookingTypes.map((type) => ({
		value: type.id.toString(),
		label: type.name,
	}));

	const rateOptions = rates.map((rate) => ({
		value: rate.id.toString(),
		label: `${rate.name} (${rate.type === 'percentage' ? `${rate.value}% off` : `₱${rate.value} off`})`,
	}));

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
											<SelectComponent
												id='rate_id'
												label='Rate Type'
												placeholder='Select rate type'
												value={selectedRateId}
												onChange={(value) => {
													setSelectedRateId(value);
													setData('rate_id', value);
												}}
												options={rateOptions}
												error={errors.rate_id}
											/>
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
												{errors.check_in && <p className='text-sm text-destructive'>{errors.check_in}</p>}
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
												<SelectComponent
													id='guest_count'
													label='Number of Guests'
													placeholder='Select Guest Count'
													value={guestCount}
													onChange={(value) => {
														setGuestCount(value);
														setData('guest_count', Number(value));
													}}
													options={guestNumberOptions}
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
