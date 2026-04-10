import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, CalendarPlus, Ban, Users, Home } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Dashboard', href: '/dashboard' },
	{ title: 'Admin', href: '/admin' },
];

type LogType = 'CHECK_IN' | 'CHECK_OUT' | 'CREATE_BOOKING' | 'CANCEL_BOOKING';

interface Log {
	id: number;
	staffId: string;
	user: string;
	action: LogType;
	guest: string;
	room: string;
	date: string;
}

// MOCK DATA
const mockLogs: Log[] = Array.from({ length: 35 }).map((_, i) => ({
	id: i + 1,
	staffId: `FD-${100 + (i % 5)}`,
	user: `Frontdesk ${String.fromCharCode(65 + (i % 3))}`,
	action: ['CHECK_IN', 'CHECK_OUT', 'CREATE_BOOKING', 'CANCEL_BOOKING'][i % 4] as LogType,
	guest: `Guest ${i + 1}`,
	room: `${100 + (i % 10)}`,
	date: `Apr 10, ${8 + (i % 10)}:${(i % 60).toString().padStart(2, '0')} AM`,
}));

const actionColor = (action: LogType) => {
	switch (action) {
		case 'CHECK_IN':
			return 'bg-green-500/20 text-green-400';
		case 'CHECK_OUT':
			return 'bg-blue-500/20 text-blue-400';
		case 'CREATE_BOOKING':
			return 'bg-yellow-500/20 text-yellow-400';
		case 'CANCEL_BOOKING':
			return 'bg-red-500/20 text-red-400';
	}
};

const actionLabel = (action: LogType) => {
	switch (action) {
		case 'CHECK_IN':
			return 'Check-in';
		case 'CHECK_OUT':
			return 'Check-out';
		case 'CREATE_BOOKING':
			return 'Booking Created';
		case 'CANCEL_BOOKING':
			return 'Cancelled';
	}
};

const actionIcon = (action: LogType) => {
	switch (action) {
		case 'CHECK_IN':
			return <LogIn className='h-3.5 w-3.5' />;
		case 'CHECK_OUT':
			return <LogOut className='h-3.5 w-3.5' />;
		case 'CREATE_BOOKING':
			return <CalendarPlus className='h-3.5 w-3.5' />;
		case 'CANCEL_BOOKING':
			return <Ban className='h-3.5 w-3.5' />;
	}
};

export default function Index() {
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState<LogType | 'ALL'>('ALL');
	const [page, setPage] = useState(1);

	const perPage = 10;

	const filteredLogs = useMemo(() => {
		return mockLogs.filter((log) => {
			const keyword = search.toLowerCase();

			const matchSearch =
				log.user.toLowerCase().includes(keyword) ||
				log.staffId.toLowerCase().includes(keyword) ||
				log.guest.toLowerCase().includes(keyword) ||
				log.room.includes(keyword);

			const matchFilter = filter === 'ALL' || log.action === filter;

			return matchSearch && matchFilter;
		});
	}, [search, filter]);

	const totalPages = Math.ceil(filteredLogs.length / perPage);

	const paginatedLogs = useMemo(() => {
		const start = (page - 1) * perPage;
		return filteredLogs.slice(start, start + perPage);
	}, [filteredLogs, page]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Admin Dashboard' />

			<div className='flex w-full min-w-0 flex-col gap-6 p-6'>
				{/* HEADER */}
				<div>
					<h1 className='text-2xl font-semibold'>Hi, Admin</h1>
					<p className='text-sm text-muted-foreground'>Welcome back to Casa Jedliana Admin!</p>
				</div>

				{/* STATS */}
				<div className='mx-auto grid w-full max-w-3xl gap-4 md:grid-cols-2'>
					<Card>
						<CardContent className='flex items-center justify-between p-5'>
							<div className='text-center'>
								<h2 className='text-3xl font-bold'>3</h2>
								<p className='text-sm text-muted-foreground'>Total Users</p>
							</div>
							<div className='flex h-20 w-20 items-center justify-center rounded-full bg-blue-100'>
								<Users className='h-10 w-10 text-blue-600' />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='flex items-center justify-between p-5'>
							<div className='text-center'>
								<h2 className='text-3xl font-bold'>4</h2>
								<p className='text-sm text-muted-foreground'>Total Events</p>
							</div>
							<div className='flex h-20 w-20 items-center justify-center rounded-full bg-orange-100'>
								<Home className='h-10 w-10 text-orange-600' />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* USER MANAGEMENT */}
				<Card>
					<CardContent className='p-0'>
						<div className='border-b px-4 py-3'>
							<h2 className='font-semibold'>User Management</h2>
						</div>

						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Username</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{[
										{ id: '#01', name: 'Admin', email: 'Admin@gmail' },
										{ id: '#02', name: 'Front Desk Officer', email: 'Frontdeskoffice@gmail' },
										{ id: '#03', name: 'Hotel Manager', email: 'Hotelmanager@gmail.com' },
									].map((user, i) => (
										<TableRow key={i}>
											<TableCell>{user.id}</TableCell>
											<TableCell>{user.name}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												<span className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-700'>Active</span>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>

				{/*LOGS */}
				<Card>
					<CardContent className='p-0'>
						<div className='border-b px-4 py-3'>
							<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
								{/* LEFT: TITLE */}
								<h2 className='font-semibold whitespace-nowrap'>Frontdesk Activity Logs</h2>

								{/* RIGHT: SEARCH + TABS INLINE */}
								<div className='flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3'>
									{/* SEARCH */}
									<Input
										placeholder='Search...'
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											setPage(1);
										}}
										className='w-full md:w-60'
									/>

									{/* TABS INLINE */}
									<div className='flex items-center overflow-x-auto rounded-xl border bg-muted p-1'>
										{[
											{ type: 'ALL', label: 'All', icon: null },
											{ type: 'CHECK_IN', label: 'Check-in', icon: LogIn },
											{ type: 'CHECK_OUT', label: 'Check-out', icon: LogOut },
											{ type: 'CREATE_BOOKING', label: 'Booking', icon: CalendarPlus },
											{ type: 'CANCEL_BOOKING', label: 'Cancelled', icon: Ban },
										].map(({ type, label, icon: Icon }) => {
											const isActive = filter === type;
 
											return (
												<button
													key={type}
													onClick={() => {
														setFilter(type as any);
														setPage(1);
													}}
													className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
														isActive
															? 'bg-background text-foreground shadow-sm'
															: 'text-muted-foreground hover:text-foreground'
													}`}
												>
													{Icon && <Icon className='h-4 w-4' />}
													{label}
												</button>
											);
										})}
									</div>
								</div>
							</div>
						</div>

						{/* TABLE */}
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Staff</TableHead>
										<TableHead>Action</TableHead>
										<TableHead>Guest</TableHead>
										<TableHead>Room</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{paginatedLogs.map((log) => (
										<TableRow key={log.id}>
											<TableCell>{log.staffId}</TableCell>
											<TableCell>{log.user}</TableCell>
											<TableCell>
												<Badge className={`flex items-center gap-1 ${actionColor(log.action)}`}>
													{actionIcon(log.action)}
													{actionLabel(log.action)}
												</Badge>
											</TableCell>
											<TableCell>{log.guest}</TableCell>
											<TableCell>{log.room}</TableCell>
											<TableCell>{log.date}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* PAGINATION */}
						<div className='flex justify-between border-t px-4 py-3'>
							<p className='text-sm'>
								Page {page} of {totalPages}
							</p>

							<div className='flex gap-2'>
								<Button disabled={page === 1} onClick={() => setPage(page - 1)}>
									Previous
								</Button>
								<Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
									Next
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
