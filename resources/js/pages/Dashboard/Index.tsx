// resources/js/pages/Dashboard.tsx
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';

/* ======================= UI ======================= */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* ======================= ICONS ======================= */
import { DoorOpen, LogOut, Lock, Check, CalendarDays } from 'lucide-react';

import { DateRange } from 'react-day-picker';

/* ======================= TYPES ======================= */

type RoomStatus = 'Available' | 'Reserved' | 'Occupied' | 'Maintenance';

type RoomFilter = 'All' | RoomStatus;
type RoomScope = 'hotel' | 'event';

interface Client {
	id: number;
	first_name: string;
	last_name: string;
}

interface Room {
	id: number;
	room_number?: string;
	room_type?: string;
	status?: string;
}

interface Booking {
	id: number;
	room_id: number;
	status: string;
	check_in: string;
	check_out: string;
	total_amount: number;
	payment_status?: string;
	client?: Client;
	room?: Room;
}

/* ======================= STATUS COLORS ======================= */

const statusBadge: Record<RoomStatus, string> = {
	Available: 'bg-green-100 text-green-700',
	Reserved: 'bg-purple-100 text-purple-700',
	Occupied: 'bg-red-100 text-red-700',
	Maintenance: 'bg-gray-200 text-gray-700',
};

const bookingStatusBadge: Record<string, string> = {
	Reserved: 'bg-purple-100 text-purple-700',
	Pencil: 'bg-orange-100 text-orange-700',
	'Checked In': 'bg-green-100 text-green-700',
	'Checked Out': 'bg-blue-100 text-blue-700',
	Cancelled: 'bg-gray-200 text-gray-700',
};
const summaryIconStyle: Record<string, string> = {
	'Check-ins': 'bg-blue-100 text-blue-600',
	'Check-outs': 'bg-orange-100 text-orange-600',
	Occupied: 'bg-red-100 text-red-600',
	Available: 'bg-green-100 text-green-600',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard() {
	const page = usePage<{
		rooms?: Room[];
		bookings?: Booking[];
		checkIns?: Booking[];
		checkOuts?: Booking[];
		startDate: string;
		endDate: string;
	}>().props;

	const rooms = page.rooms ?? [];
	const bookings = page.bookings ?? [];
	const checkIns = page.checkIns ?? [];
	const checkOuts = page.checkOuts ?? [];
	const startDate = page.startDate;
	const endDate = page.endDate;

	const [roomScope, setRoomScope] = useState<RoomScope>('hotel');

	const [activeFilter, setActiveFilter] = useState<RoomFilter>('All');

	const [search, setSearch] = useState('');
	const [isDateOpen, setIsDateOpen] = useState(false);

	const [range, setRange] = useState<DateRange | undefined>({
		from: startDate ? new Date(startDate) : new Date(),
		to: endDate ? new Date(endDate) : new Date(),
	});

	const mapBookingStatus = (status?: string) => {
		const s = (status ?? '').toString().trim().toLowerCase();

		if (s.includes('pencil')) return 'Pencil';
		if (s.includes('reserved')) return 'Reserved';
		if (s.includes('checked_in')) return 'Checked In';
		if (s.includes('checked_out')) return 'Checked Out';
		if (s.includes('cancel')) return 'Cancelled';

		return 'Reserved';
	};
	/* helper: check if booking overlaps selected date (inclusive) and is not cancelled */
	const bookingOverlapsRange = (b: Booking) => {
		if (!range?.from || !range?.to) return false;

		const checkIn = new Date(b.check_in);
		const checkOut = new Date(b.check_out);

		return checkIn <= range.to && checkOut > range.from && b.status.toLowerCase() !== 'cancelled';
	};

	/* ======================= AVAILABILITY (consider selected date) ======================= */

	// get occupied room IDs based on bookings that overlap the selected date
	const occupiedRoomIds = useMemo(() => {
		return Array.from(new Set(bookings.filter((b) => bookingOverlapsRange(b)).map((b) => b.room_id)));
	}, [bookings, range]);

	const availableCount = useMemo(() => {
		return rooms.filter((room) => !occupiedRoomIds.includes(room.id)).length;
	}, [rooms, occupiedRoomIds]);

	/* ======================= ROOM FILTERING (respect DB status, override with booking) ======================= */
	const roomsForDate = (rooms ?? [])
		.filter((room) =>
			roomScope === 'hotel'
				? !(room.room_type ?? '').toLowerCase().includes('event')
				: (room.room_type ?? '').toLowerCase().includes('event'),
		)
		.map((room) => ({
			id: room.id,
			label: room.room_number ?? 'Room',
			subLabel: room.room_type ?? '',
			status: (room.status ?? 'Available') as RoomStatus,
		}))
		.filter((room) => (activeFilter === 'All' ? true : room.status === activeFilter));

	/* ======================= SUMMARY ======================= */

	const summary = [
		{ label: 'Check-ins', value: checkIns?.length ?? 0, icon: DoorOpen },
		{ label: 'Check-outs', value: checkOuts?.length ?? 0, icon: LogOut },
		{
			label: 'Occupied',
			value: occupiedRoomIds.length,
			icon: Lock,
		},
		{
			label: 'Available',
			value: availableCount,
			icon: Check,
		},
	];

	/* ======================= ARRIVALS ======================= */

	const combinedArrivals = [
		...(checkIns ?? []).map((b) => ({ ...b, type: 'arrival' })),
		...(checkOuts ?? []).map((b) => ({ ...b, type: 'departure' })),
	];

	const filteredArrivals = useMemo(() => {
		return combinedArrivals.filter((b: any) =>
			`${b.client?.first_name ?? ''} ${b.client?.last_name ?? ''}`.toLowerCase().includes(search.toLowerCase()),
		);
	}, [combinedArrivals, search]);

	/* ======================= UI ======================= */

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Dashboard' />

			<div className='grid grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-4'>
				{/* LEFT */}
				<div className='space-y-6 lg:col-span-3'>
					{/* SUMMARY */}
					<div>
						<h2 className='mb-3 text-xl font-semibold'>
							{range?.from && range?.to ? `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd')}` : 'Select Dates'}{' '}
							Summary
						</h2>

						<div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
							{summary.map((item) => (
								<Card key={item.label}>
									<CardContent className='flex items-center justify-between p-4 text-center'>
										{/* Left Side: Label + Value */}
										<div>
											<p className='text-sm text-muted-foreground'>{item.label}</p>
											<p className='text-2xl font-semibold'>{item.value}</p>
										</div>

										{/* Right Side: Colored Icon Badge */}
										<div
											className={`flex h-10 w-10 items-center justify-center rounded-full ${summaryIconStyle[item.label]}`}
										>
											<item.icon className='h-5 w-5' />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* HOTEL / EVENT TOGGLE */}
					<div className='flex gap-3'>
						<Button variant={roomScope === 'hotel' ? 'default' : 'outline'} onClick={() => setRoomScope('hotel')}>
							Hotel Rooms
						</Button>

						<Button variant={roomScope === 'event' ? 'default' : 'outline'} onClick={() => setRoomScope('event')}>
							Event Rooms
						</Button>
					</div>

					{/* STATUS FILTER */}
					<Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as RoomFilter)}>
						<TabsList>
							{['All', 'Available', 'Reserved', 'Occupied', 'Maintenance'].map((tab) => (
								<TabsTrigger key={tab} value={tab}>
									{tab}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>

					{/* ROOM GRID */}
					<div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
						{roomsForDate.map((room) => (
							<div key={room.id} className='rounded-lg border p-3'>
								<p className='font-semibold'>{room.label}</p>
								<p className='text-xs text-muted-foreground'>{room.subLabel}</p>
								<Badge className={`mt-2 ${statusBadge[room.status]}`}>{room.status}</Badge>
							</div>
						))}
					</div>

					{/* ARRIVAL TABLE */}
					<Card>
						<CardHeader className='flex justify-between'>
							<CardTitle>Arrival / Departure</CardTitle>
							<Input
								placeholder='Search guest...'
								className='w-48'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</CardHeader>

						<CardContent>
							<table className='w-full text-sm'>
								<thead>
									<tr className='border-b text-left'>
										<th className='py-2'>Check-in Date</th>
										<th>Check-in Time</th>
										<th>Check-out Date</th>
										<th>Check-out Time</th>
										<th>Guest</th>
										<th>Room</th>
										<th>Booking Status</th>
										<th>Payment Status</th>
									</tr>
								</thead>

								<tbody>
									{filteredArrivals.map((b: any) => {
										const checkInDate = format(new Date(b.check_in), 'MMM dd yyyy');
										const checkInTime = format(new Date(b.check_in), 'hh:mm a');

										const checkOutDate = format(new Date(b.check_out), 'MMM dd yyyy');
										const checkOutTime = format(new Date(b.check_out), 'hh:mm a');
										/* BOOKING STATUS BADGE */
										const bookingStatus = mapBookingStatus(b.status);

										/* PAYMENT BADGE */
										const paymentRaw = (b.payment_status ?? '').toLowerCase();

										let paymentLabel = 'Unpaid';
										let paymentColor = 'bg-red-100 text-red-700';

										if (paymentRaw === 'paid' || paymentRaw === 'successful') {
											paymentLabel = 'Successful';
											paymentColor = 'bg-green-100 text-green-700';
										} else if (paymentRaw === 'cancelled') {
											paymentLabel = 'Cancelled';
											paymentColor = 'bg-gray-200 text-gray-700';
										}

										/* ROOM ACTION OVERVIEW (ROBUST VERSION) */

										let actionLabel: string | null = null;
										let actionColor = '';

										const statusLower = (b.status ?? '').toString().trim().toLowerCase();

										// normalize variations
										if (statusLower.includes('reserved') || statusLower.includes('pencil')) {
											actionLabel = 'Check in';
											actionColor = 'bg-blue-100 text-blue-700';
										} else if (
											statusLower.includes('checked') ||
											statusLower.includes('occupied') ||
											statusLower.includes('complete')
										) {
											actionLabel = 'Check out';
											actionColor = 'bg-orange-100 text-orange-700';
										} else if (statusLower.includes('cancel')) {
											actionLabel = 'Cancelled';
											actionColor = 'bg-gray-200 text-gray-700';
										}

										return (
											<tr key={`${b.id}-${b.type}`} className='border-b'>
												<td className='py-2'>{checkInDate}</td>

												<td>{checkInTime}</td>

												<td>{checkOutDate}</td>

												<td>{checkOutTime}</td>

												<td>
													{b.client?.first_name} {b.client?.last_name}
												</td>

												<td>
													{b.room?.room_number} - {b.room?.room_type}
												</td>

												<td>
													<Badge className={bookingStatusBadge[bookingStatus]}>{bookingStatus}</Badge>
												</td>

												<td>
													<Badge className={paymentColor}>{paymentLabel}</Badge>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</CardContent>
					</Card>
				</div>

				{/* RIGHT CALENDAR */}
				<div className='space-y-4 lg:col-span-1'>
					<Card className='overflow-hidden'>
						<CardHeader className='pb-2'>
							<Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
								<PopoverTrigger asChild>
									<Button variant='outline' className='w-full justify-start'>
										<CalendarDays className='mr-2 h-4 w-4' />
										{range?.from && range?.to
											? `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd')} Summary`
											: 'Summary'}
									</Button>
								</PopoverTrigger>

								<PopoverContent className='w-[650px] overflow-visible p-4'>
									<Calendar
										mode='range'
										selected={range}
										onSelect={setRange}
										numberOfMonths={2}
										pagedNavigation
										className='w-full rounded-md border'
									/>

									<div className='flex justify-end pt-2'>
										<Button
											size='sm'
											onClick={() => {
												if (!range?.from || !range?.to) return;

												router.get(
													'/dashboard',
													{
														start: format(range.from, 'yyyy-MM-dd'),
														end: format(range.to, 'yyyy-MM-dd'),
													},
													{
														preserveState: true,
														replace: true,
													},
												);

												setIsDateOpen(false);
											}}
										>
											Apply
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</CardHeader>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}
