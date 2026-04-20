import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useMemo, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, CalendarPlus, Ban, Users, Home, Pencil } from 'lucide-react';

import { useDateRange } from '@/contexts/date-range-context';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Dashboard', href: '/dashboard' },
	{ title: 'Admin', href: '/admin' },
];

type LogType = 'CHECK_IN' | 'CHECK_OUT' | 'CREATE_BOOKING' | 'UPDATE_BOOKING' | 'CANCEL_BOOKING';

interface Log {
	id: number;
	staffId: string;
	user: string;
	role: string;
	action: LogType;
	guest: string;
	room: string;
	date: string;
}

const actionColor = (action: LogType) => {
	switch (action) {
		case 'CHECK_IN':
			return 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400';
		case 'CHECK_OUT':
			return 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400';
		case 'CREATE_BOOKING':
			return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400';
		case 'CANCEL_BOOKING':
			return 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400';
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
		case 'UPDATE_BOOKING':
			return 'Booking Updated';
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
		case 'UPDATE_BOOKING':
			return <Pencil className='h-3.5 w-3.5' />;
		case 'CANCEL_BOOKING':
			return <Ban className='h-3.5 w-3.5' />;
	}
};

type PageProps = {
	users?: {
		id: number;
		name: string;
		email: string;
		role: string;
	}[];
	logs?: Log[];
	auth?: {
		user?: {
			name: string;
			role: string;
		};
	};
};

export default function Index() {
	const { range } = useDateRange();
	const { users = [], logs = [], auth } = usePage<PageProps>().props;

	const adminCount = users.filter((u) => u.role?.toLowerCase() === 'admin').length;
	const frontdeskCount = users.filter((u) => u.role?.toLowerCase() === 'frontdesk').length;
	const totalUsers = users.length;
	const start = useMemo(() => range?.from?.toLocaleDateString('en-CA'), [range?.from]);

	const end = useMemo(() => range?.to?.toLocaleDateString('en-CA'), [range?.to]);

	useEffect(() => {
		if (!start || !end) return;

		const params = new URLSearchParams(window.location.search);
		const currentStart = params.get('start');
		const currentEnd = params.get('end');

		// 🛑 STOP if already same → prevents loop
		if (currentStart === start && currentEnd === end) return;

		router.get(
			'/admin',
			{ start, end },
			{
				preserveScroll: true,
				replace: true,
			},
		);
	}, [start, end]);

	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState<LogType | 'ALL'>('ALL');
	const [page, setPage] = useState(1);

	const perPage = 10;

	const filteredLogs = useMemo(() => {
		return logs.filter((log) => {
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
		<AppLayout breadcrumbs={breadcrumbs} showDatePicker>
			<Head title='Admin Dashboard' />

			<div className='flex w-full min-w-0 flex-col gap-6 p-6'>
				{/* HEADER */}
				<div>
					<h1 className='text-2xl font-semibold'>
						Welcome {auth?.user?.role ? auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1) : 'User'},{' '}
						{auth?.user?.name ?? ''}
					</h1>
					<p className='text-sm text-muted-foreground'>
						Welcome back to Casa Jedliana{' '}
						{auth?.user?.role ? auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1) : 'User'},{' '}
						{auth?.user?.name ?? ''}!
					</p>
				</div>

				{/* STATS */}
				<div className='mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-3'>
					{/* ADMIN */}
					<Card>
						<CardContent className='flex items-center justify-between p-5'>
							<div className='flex-1 text-center'>
								<h2 className='text-3xl font-bold'>{adminCount}</h2>
								<p className='text-sm text-muted-foreground'>Admins</p>
							</div>
							<div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950'>
								<Users className='h-8 w-8 text-red-600 dark:text-red-400' />
							</div>
						</CardContent>
					</Card>

					{/* FRONTDESK */}
					<Card>
						<CardContent className='flex items-center justify-between p-5'>
							<div className='flex-1 text-center'>
								<h2 className='text-3xl font-bold'>{frontdeskCount}</h2>
								<p className='text-sm text-muted-foreground'>Frontdesk</p>
							</div>
							<div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950'>
								<Users className='h-8 w-8 text-blue-600 dark:text-blue-400' />
							</div>
						</CardContent>
					</Card>

					{/* TOTAL USERS */}
					<Card>
						<CardContent className='flex items-center justify-between p-5'>
							<div className='flex-1 text-center'>
								<h2 className='text-3xl font-bold'>{totalUsers}</h2>
								<p className='text-sm text-muted-foreground'>Total Users</p>
							</div>
							<div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950'>
								<Users className='h-8 w-8 text-green-600 dark:text-green-400' />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* USER MANAGEMENT */}
				<div className='mx-auto w-full max-w-5xl'>
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
											<TableHead>Role</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{users.length > 0 ? (
											users.map((user) => (
												<TableRow key={user.id}>
													<TableCell>#{user.id}</TableCell>
													<TableCell>{user.name}</TableCell>
													<TableCell>{user.email}</TableCell>
													<TableCell>
														<Badge className='capitalize'>{user.role}</Badge>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={4} className='py-6 text-center text-muted-foreground'>
													No active users found
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* ACTIVITY LOGS */}
				<Card>
					<CardContent className='p-0'>
						<div className='border-b px-4 py-3'>
							<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
								{/* TITLE */}
								<h2 className='font-semibold whitespace-nowrap'>Frontdesk Activity Logs</h2>

								{/* SEARCH + TABS */}
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

									{/* TABS */}
									<div className='flex items-center overflow-x-auto rounded-xl border bg-muted p-1'>
										{[
											{ type: 'ALL', label: 'All', icon: null },
											{ type: 'CHECK_IN', label: 'Check-in', icon: LogIn },
											{ type: 'CHECK_OUT', label: 'Check-out', icon: LogOut },
											{ type: 'CREATE_BOOKING', label: 'Booking', icon: CalendarPlus },
											{ type: 'UPDATE_BOOKING', label: 'Updated', icon: Pencil },
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
										<TableHead>Name</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Action</TableHead>
										<TableHead>Guest</TableHead>
										<TableHead>Room</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{paginatedLogs.length > 0 ? (
										paginatedLogs.map((log) => (
											<TableRow key={log.id}>
												<TableCell>{log.staffId}</TableCell>
												<TableCell>{log.user}</TableCell>
												<TableCell>
													<Badge className='capitalize'>{log.role}</Badge>
												</TableCell>
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
										))
									) : (
										<TableRow>
											<TableCell colSpan={6} className='py-6 text-center text-muted-foreground'>
												No activity found
											</TableCell>
										</TableRow>
									)}
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
