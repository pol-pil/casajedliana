import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Eye, Printer } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Reports', href: '/reports/history' },
	{ title: 'History', href: '/reports/history' },
];

/* ================= MOCK DATA ================= */

/* HOTEL BOOKINGS */
const hotelBookings = Array.from({ length: 12 }, (_, i) => ({
	id: i + 1,
	date: `2026-02-${(i + 1).toString().padStart(2, '0')}`,
	guest: `Guest ${i + 1}`,
	room: `${100 + i} - Deluxe`,
	checkIn: `2026-02-${(i + 1).toString().padStart(2, '0')}`,
	checkOut: `2026-02-${(i + 2).toString().padStart(2, '0')}`,
	payment: i % 2 === 0 ? 'Paid' : 'Pending',
	status: i % 3 === 0 ? 'Checked Out' : 'Checked In',
}));

/* EVENT BOOKINGS */
const eventBookings = Array.from({ length: 12 }, (_, i) => ({
	id: i + 1,
	date: `2026-03-${(i + 1).toString().padStart(2, '0')}`,
	guest: `Organizer ${i + 1}`,
	venue: i % 2 === 0 ? 'Grand Ballroom' : 'Sky Lounge',
	purpose: i % 3 === 0 ? 'Wedding' : i % 3 === 1 ? 'Corporate Meeting' : 'Birthday',
	eventDate: `2026-03-${(i + 1).toString().padStart(2, '0')}`,
	payment: i % 2 === 0 ? 'Paid' : 'Pending',
	status: i % 3 === 0 ? 'Completed' : 'Reserved',
}));

/* ================= COMPONENT ================= */

export default function History() {
	const rowsPerPage = 5;

	/* SEARCH STATES */
	const [searchHotel, setSearchHotel] = useState('');
	const [searchEvent, setSearchEvent] = useState('');

	/* PAGINATION */
	const [hotelPage, setHotelPage] = useState(1);
	const [eventPage, setEventPage] = useState(1);

	/* HELPERS */

	const paginate = (data: any[], page: number) => {
		const start = (page - 1) * rowsPerPage;
		return data.slice(start, start + rowsPerPage);
	};

	const filterData = (data: any[], search: string, key: string) =>
		data.filter((item) => item[key].toLowerCase().includes(search.toLowerCase()));

	/* FILTERED DATA */

	const filteredHotels = useMemo(() => filterData(hotelBookings, searchHotel, 'guest'), [searchHotel]);

	const filteredEvents = useMemo(() => filterData(eventBookings, searchEvent, 'guest'), [searchEvent]);

	/* PAGINATION UI */

	const renderPagination = (page: number, setPage: any, totalItems: number) => {
		const totalPages = Math.ceil(totalItems / rowsPerPage);

		return (
			<div className='flex items-center justify-between pt-4'>
				<p className='text-sm text-muted-foreground'>
					Page {page} of {totalPages}
				</p>

				<div className='flex gap-2'>
					<Button variant='outline' disabled={page === 1} onClick={() => setPage(page - 1)}>
						Previous
					</Button>

					<Button variant='outline' disabled={page === totalPages} onClick={() => setPage(page + 1)}>
						Next{' '}
					</Button>
				</div>
			</div>
		);
	};

	/* TABLE HELPERS */

	const TableWrapper = ({ children }: any) => (
		<div className='overflow-x-auto rounded-lg border'>
			<table className='w-full text-sm'>{children}</table>
		</div>
	);

	const TableHead = ({ headers }: any) => (
		<thead className='border-b bg-muted/40'>
			<tr>
				{headers.map((h: string) => (
					<th key={h} className='px-4 py-3 text-left font-medium'>
						{h}
					</th>
				))}
			</tr>
		</thead>
	);

	const Td = ({ children }: any) => <td className='px-4 py-3'>{children}</td>;

	/* ================= UI ================= */

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Reports History' />

			<div className='space-y-6 p-6'>
				<Card>
					<CardHeader>
						<CardTitle>Booking History Reports</CardTitle>
					</CardHeader>

					<CardContent>
						<Tabs defaultValue='hotel'>
							<TabsList>
								<TabsTrigger value='hotel'>Hotel Bookings</TabsTrigger>

								<TabsTrigger value='events'>Event Bookings</TabsTrigger>
							</TabsList>

							{/* ================= HOTEL BOOKINGS ================= */}

							<TabsContent value='hotel'>
								<Input
									placeholder='Search guest name...'
									value={searchHotel}
									onChange={(e) => {
										setSearchHotel(e.target.value);
										setHotelPage(1);
									}}
									className='mb-4 w-64'
								/>

								<TableWrapper>
									<TableHead
										headers={['Date', 'Guest Name', 'Room', 'Check-In', 'Check-Out', 'Payment', 'Status', 'Actions']}
									/>
									<tbody>
										{paginate(filteredHotels, hotelPage).map((b) => (
											<tr key={b.id} className='border-b'>
												<Td>{b.date}</Td>
												<Td>{b.guest}</Td>
												<Td>{b.room}</Td>
												<Td>{b.checkIn}</Td>
												<Td>{b.checkOut}</Td>

												<Td>
													<Badge variant={b.payment === 'Paid' ? 'default' : 'secondary'}>{b.payment}</Badge>
												</Td>

												<Td>{b.status}</Td>

												<Td className='flex gap-2'>
													<Button size='icon' variant='outline'>
														<Eye className='h-4 w-4' />
													</Button>

													<Button size='icon' variant='outline'>
														<Printer className='h-4 w-4' />
													</Button>
												</Td>
											</tr>
										))}
									</tbody>
								</TableWrapper>

								{renderPagination(hotelPage, setHotelPage, filteredHotels.length)}
							</TabsContent>

							{/* ================= EVENT BOOKINGS ================= */}

							<TabsContent value='events'>
								<Input
									placeholder='Search organizer...'
									value={searchEvent}
									onChange={(e) => {
										setSearchEvent(e.target.value);
										setEventPage(1);
									}}
									className='mb-4 w-64'
								/>

								<TableWrapper>
									<TableHead
										headers={['Date', 'Organizer', 'Venue', 'Purpose', 'Event Date', 'Payment', 'Status', 'Actions']}
									/>

									<tbody>
										{paginate(filteredEvents, eventPage).map((e) => (
											<tr key={e.id} className='border-b'>
												<Td>{e.date}</Td>

												<Td>{e.guest}</Td>

												<Td>{e.venue}</Td>

												<Td>{e.purpose}</Td>

												<Td>{e.eventDate}</Td>

												<Td>
													<Badge variant={e.payment === 'Paid' ? 'default' : 'secondary'}>{e.payment}</Badge>
												</Td>

												<Td>{e.status}</Td>

												<Td className='flex gap-2'>
													<Button size='icon' variant='outline'>
														<Eye className='h-4 w-4' />
													</Button>

													<Button size='icon' variant='outline'>
														<Printer className='h-4 w-4' />
													</Button>
												</Td>
											</tr>
										))}
									</tbody>
								</TableWrapper>

								{renderPagination(eventPage, setEventPage, filteredEvents.length)}
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
