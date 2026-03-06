// resources/js/pages/Dashboard.tsx
import { useMemo, useState, useEffect } from 'react';
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

/* ======================= TYPES ======================= */

type RoomStatus = 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Maintenance';

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
	client?: Client;
	room?: Room;
}

/* ======================= STATUS COLORS ======================= */

const statusBadge: Record<RoomStatus, string> = {
	Available: 'bg-green-100 text-green-700',
	Reserved: 'bg-purple-100 text-purple-700',
	Occupied: 'bg-red-100 text-red-700',
	Cleaning: 'bg-yellow-100 text-yellow-700',
	Maintenance: 'bg-gray-200 text-gray-700',
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
		selectedDate: string;
	}>().props;

	const rooms = page.rooms ?? [];
	const bookings = page.bookings ?? [];
	const checkIns = page.checkIns ?? [];
	const checkOuts = page.checkOuts ?? [];
	const selectedDate = page.selectedDate;

	// Debug — keeps your previous debug logging so we can inspect props
	useEffect(() => {
		console.log('DEBUG rooms prop:', rooms);
		console.log('DEBUG bookings prop:', bookings);
		const r206 = (rooms || []).find((r: any) => r.room_number === '206' || (r as any).roomNumber === '206');
		console.log('DEBUG room 206 from props:', r206);
	}, [rooms, bookings]);

	//   /* ======================= AUTO REFRESH (FIXED) ======================= */
	// useEffect(() => {
	//   const interval = setInterval(() => {
	//     router.reload({
	//       only: ['rooms', 'bookings', 'checkIns', 'checkOuts'],
	//     })
	//   }, 5000) // refresh every 5 seconds

	//   return () => clearInterval(interval)
	// }, [])

	const selectedDateState = new Date(selectedDate);

	const [roomScope, setRoomScope] = useState<RoomScope>('hotel');

	const [activeFilter, setActiveFilter] = useState<RoomFilter>('All');

	const [search, setSearch] = useState('');
	const [isDateOpen, setIsDateOpen] = useState(false);
	const [tempDate, setTempDate] = useState<Date | null>(selectedDateState);

	/* ======================= STATUS MAPPER (robust) ======================= */

	const mapStatus = (status?: string): RoomStatus => {
		const s = (status ?? '').toString().trim().toLowerCase();

		if (['occupied', 'checked_in', 'checkedin', 'checked-in'].includes(s)) return 'Occupied';
		if (['reserved', 'confirmed', 'pencil'].includes(s)) return 'Reserved';
		if (['cleaning', 'completed', 'cleaning_needed'].includes(s)) return 'Cleaning';
		if (['maintenance'].includes(s)) return 'Maintenance';
		if (['available', 'vacant', 'free'].includes(s)) return 'Available';

		return 'Available';
	};

	/* helper: check if booking overlaps selected date (inclusive) and is not cancelled */
	const bookingOverlapsSelectedDate = (b: Booking, date: Date) => {
		try {
			const checkIn = new Date(b.check_in);
			const checkOut = new Date(b.check_out);
			if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return false;
			const inRange = checkIn <= date && checkOut >= date;
			const notCancelled = (b.status ?? '').toString().toLowerCase() !== 'cancelled';
			return inRange && notCancelled;
		} catch {
			return false;
		}
	};

	/* ======================= AVAILABILITY (consider selected date) ======================= */

	// get occupied room IDs based on bookings that overlap the selected date
	const occupiedRoomIds = Array.from(
		new Set(bookings.filter((b: Booking) => bookingOverlapsSelectedDate(b, selectedDateState)).map((b: Booking) => b.room_id)),
	);

	const availableCount = rooms.filter((room) => !occupiedRoomIds.includes(room.id)).length;

	/* ======================= ROOM FILTERING (respect DB status, override with booking) ======================= */

	const roomsForDate = (rooms ?? [])
		.filter((room) =>
			roomScope === 'hotel' ? !room.room_type?.toLowerCase().includes('event') : room.room_type?.toLowerCase().includes('event'),
		)
		.map((room) => ({
			id: room.id,
			label: room.room_number ?? 'Room',
			subLabel: room.room_type ?? '',
			status: room.status as RoomStatus, // 🔥 trust backend
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
		return combinedArrivals.filter((b: Booking) =>
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
						<h2 className='mb-3 text-xl font-semibold'>{format(selectedDateState, 'MMMM dd, yyyy')} Summary</h2>

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
							{['All', 'Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'].map((tab) => (
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
										<th className='py-2'>Time</th>
										<th>Guest</th>
										<th>Room</th>
										<th>Booking Status</th>
										<th>Payment</th>
										<th>Room Action</th>
									</tr>
								</thead>

								<tbody>
									{filteredArrivals.map((b: any) => {
										const isArrival = b.type === 'arrival';

										const eventTime = isArrival ? new Date(b.check_in) : new Date(b.check_out);

										const formattedTime = format(eventTime, 'hh:mm a');

										/* BOOKING STATUS BADGE */
										const bookingStatus = mapStatus(b.status);

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
												<td className='py-2'>{formattedTime}</td>

												<td>
													{b.client?.first_name} {b.client?.last_name}
												</td>

												<td>
													{b.room?.room_number} - {b.room?.room_type}
												</td>

												<td>
													<Badge className={statusBadge[bookingStatus]}>{bookingStatus}</Badge>
												</td>

												<td>
													<span className={`rounded px-2 py-1 text-xs ${paymentColor}`}>{paymentLabel}</span>
												</td>

												<td>
													{actionLabel && (
														<span className={`rounded px-2 py-1 text-xs ${actionColor}`}>{actionLabel}</span>
													)}
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
										{format(selectedDateState, 'MMMM dd, yyyy')}
									</Button>
								</PopoverTrigger>

								<PopoverContent className='w-auto p-3'>
									<div className='w-full'>
										<Calendar
											mode='single'
											selected={tempDate ?? undefined}
											onSelect={(d) => d && setTempDate(d)}
											className='w-full'
										/>
									</div>

									<div className='flex justify-end pt-2'>
										<Button
											size='sm'
											onClick={() => {
												if (tempDate) {
													router.get('/dashboard', {
														date: format(tempDate, 'yyyy-MM-dd'),
													});
												}
												setIsDateOpen(false);
											}}
										>
											Apply
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</CardHeader>

						<CardContent className='p-0'>
							<div className='w-full'>
								<Calendar
									mode='single'
									selected={selectedDateState}
									onSelect={(d) =>
										d &&
										router.get('/dashboard', {
											date: format(d, 'yyyy-MM-dd'),
										})
									}
									className='w-full'
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}
