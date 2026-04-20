import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DoorOpen, LogOut, Lock, Check } from 'lucide-react';
import { useDateRange } from '@/contexts/date-range-context';

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
	payments?: { id: number; amount: number }[];
	client?: Client;
	room?: Room;
	payment_status?: string;
}

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
	Unavailable: 'bg-red-100 text-red-600',
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

	const [roomScope, setRoomScope] = useState<RoomScope>('hotel');
	const [activeFilter, setActiveFilter] = useState<RoomFilter>('All');
	const [search, setSearch] = useState('');
	const { range } = useDateRange();

	const bookingOverlapsRange = (b: Booking) => {
		if (!range?.from || !range?.to) return false;
		return new Date(b.check_in) <= range.to && new Date(b.check_out) > range.from && b.status.toLowerCase() !== 'cancelled';
	};

	const occupiedRoomIds = useMemo(
		() => Array.from(new Set(bookings.filter(bookingOverlapsRange).map((b) => b.room_id))),
		[bookings, range],
	);

	const availableCount = useMemo(() => rooms.filter((r) => !occupiedRoomIds.includes(r.id)).length, [rooms, occupiedRoomIds]);

	const summary = [
		{ label: 'Check-ins', value: checkIns.length, icon: DoorOpen },
		{ label: 'Check-outs', value: checkOuts.length, icon: LogOut },
		{ label: 'Unavailable', value: occupiedRoomIds.length, icon: Lock },
		{ label: 'Available', value: availableCount, icon: Check },
	];

	const mapBookingStatus = (status?: string) => {
		const s = (status ?? '').toLowerCase();
		if (s.includes('pencil')) return 'Pencil';
		if (s.includes('reserved')) return 'Reserved';
		if (s.includes('checked_in')) return 'Checked In';
		if (s.includes('checked_out')) return 'Checked Out';
		if (s.includes('cancel')) return 'Cancelled';
		return 'Reserved';
	};

	const combinedArrivals = [...checkIns.map((b) => ({ ...b, type: 'arrival' })), ...checkOuts.map((b) => ({ ...b, type: 'departure' }))];

	const filteredArrivals = useMemo(
		() =>
			combinedArrivals.filter((b) =>
				`${b.client?.first_name ?? ''} ${b.client?.last_name ?? ''}`.toLowerCase().includes(search.toLowerCase()),
			),
		[combinedArrivals, search],
	);

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

	return (
		<AppLayout breadcrumbs={breadcrumbs} showDatePicker>
			<Head title='Dashboard' />

			<div className='mt-6 grid grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-4'>
				<div className='space-y-6 lg:col-span-3'>
					{/* ── Summary cards ── */}
					<div>
						<h2 className='mb-3 text-xl font-semibold'>
							{range?.from && range?.to ? `${format(range.from, 'MMM dd')} – ${format(range.to, 'MMM dd')}` : 'Select Dates'}{' '}
							Summary
						</h2>
						<div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
							{summary.map((item) => (
								<Card key={item.label}>
									<CardContent className='flex items-center justify-between p-4'>
										<div>
											<p className='text-sm text-muted-foreground'>{item.label}</p>
											<p className='text-2xl font-semibold'>{item.value}</p>
										</div>
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

					{/* ── Scope + filter ── */}
					<div className='flex gap-3'>
						<Button variant={roomScope === 'hotel' ? 'default' : 'outline'} onClick={() => setRoomScope('hotel')}>
							Hotel Rooms
						</Button>
						<Button variant={roomScope === 'event' ? 'default' : 'outline'} onClick={() => setRoomScope('event')}>
							Event Rooms
						</Button>
					</div>

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
				</div>

				{/* RIGHT SIDE - QUICK ACTION */}
					<div className='flex flex-col'>
						<div className='mt-auto lg:mt-60'>
							<Card>
								<CardHeader>
									<CardTitle>Quick Action</CardTitle>
								</CardHeader>

								<CardContent className='grid grid-cols-2 gap-3'>
									<Button variant='outline' className='flex h-24 flex-col gap-2'>
										<span>＋</span>
										<span className='text-xs'>New Reservation</span>
									</Button>

									<Button variant='secondary' className='flex h-24 flex-col gap-2'>
										<span>🔍</span>
										<span className='text-xs'>Search</span>
									</Button>

									<Button variant='secondary' className='flex h-24 flex-col gap-2'>
										<span>📖</span>
										<span className='text-xs'>Check-In</span>
									</Button>

									<Button variant='secondary' className='flex h-24 flex-col gap-2'>
										<span>🚪</span>
										<span className='text-xs'>Check-Out</span>
									</Button>

									<Button variant='secondary' className='flex h-24 flex-col gap-2'>
										<span>📦</span>
										<span className='text-xs'>Create Package</span>
									</Button>

									<Button variant='secondary' className='flex h-24 flex-col gap-2'>
										<span>🛏️</span>
										<span className='text-xs'>Manage Rooms</span>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>

				{/* ── Arrivals / Departures table ── */}
				<div className='lg:col-span-4'>
					<Card>
						<CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
							<CardTitle>Arrival / Departure</CardTitle>
							<Input
								placeholder='Search guest...'
								className='w-full sm:w-48'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</CardHeader>
						<CardContent>
							<div className='w-full overflow-x-auto'>
								<table className='w-full min-w-[1000px] border-separate border-spacing-y-1 text-sm'>
									<thead>
										<tr className='border-b text-left'>
											<th className='py-2 whitespace-nowrap'>Check-in Date</th>
											<th className='py-2 whitespace-nowrap'>Check-in Time</th>
											<th className='py-2 whitespace-nowrap'>Check-out Date</th>
											<th className='py-2 whitespace-nowrap'>Check-out Time</th>
											<th className='py-2 whitespace-nowrap'>Guest</th>
											<th className='py-2 whitespace-nowrap'>Room</th>
											<th className='py-2 whitespace-nowrap'>Booking Status</th>
											<th className='py-2 whitespace-nowrap'>Payment Status</th>
										</tr>
									</thead>
									<tbody>
										{filteredArrivals.map((b: any) => {
											const checkInDate = format(new Date(b.check_in), 'MMM dd yyyy');
											const checkInTime = format(new Date(b.check_in), 'hh:mm a');
											const checkOutDate = format(new Date(b.check_out), 'MMM dd yyyy');
											const checkOutTime = format(new Date(b.check_out), 'hh:mm a');
											const bookingStatus = mapBookingStatus(b.status);

											const totalPaid = (b.payments ?? []).reduce(
												(sum: number, p: any) => sum + Number(p.amount ?? 0),
												0,
											);
											const paymentLabel =
												totalPaid <= 0 ? 'Unpaid' : totalPaid < Number(b.total_amount) ? 'Partial' : 'Paid';
											const paymentColor =
												paymentLabel === 'Unpaid'
													? 'bg-red-100 text-red-700'
													: paymentLabel === 'Partial'
														? 'bg-yellow-100 text-yellow-700'
														: 'bg-green-100 text-green-700';

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
														{b.room?.room_number} – {b.room?.room_type}
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
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}
