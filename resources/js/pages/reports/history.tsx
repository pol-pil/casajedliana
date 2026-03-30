import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useMemo } from 'react';
import {
	CheckCircleIcon,
	XCircleIcon,
	ClockIcon,
	AlertCircle,
	EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Eye, Printer } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Reports', href: '/reports/history' },
	{ title: 'History', href: '/reports/history' },
];

type Booking = {
	id: number;
	guest: string;
	contact: string;
	room_display: string;
	check_in: string;
	check_out: string;
	status: string;
	amount: number;
};

const statusConfig = {
	checked_out: {
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

const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
	const config = statusConfig[status] ?? {
		label: status,
		variant: 'secondary' as const,
		icon: AlertCircle,
		color: 'bg-gray-100 text-gray-800',
	};

	const Icon = config.icon;

	return (
		<Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
			<Icon className="h-3 w-3" />
			{config.label}
		</Badge>
	);
};

export default function History() {
	const { bookings } = usePage<{ bookings: Booking[] }>().props;

	const rowsPerPage = 5;
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);

	const paginate = <T,>(data: T[], page: number) => {
		const start = (page - 1) * rowsPerPage;
		return data.slice(start, start + rowsPerPage);
	};

	const formatStatus = (status: string) => {
		return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	};

	const filteredBookings = useMemo(() => {
		return bookings.filter((b) =>
			b.guest.toLowerCase().includes(search.toLowerCase())
		);
	}, [bookings, search]);

	const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Reports History" />

			<div className="space-y-6 p-6">
				<Card>
					<CardHeader>
						<CardTitle>Booking History Reports</CardTitle>
					</CardHeader>

					<CardContent>
						<Input
							placeholder="Search guest name..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							className="mb-4 w-64"
						/>

						<div className="overflow-x-auto rounded-lg border">
							<table className="w-full text-sm">
								<thead className="border-b bg-muted/40">
									<tr>
										{[
											'Guest',
											'Contact',
											'Room',
											'Check-In',
											'Check-Out',
											'Status',
											'Amount',
											'Actions',
										].map((h) => (
											<th key={h} className="px-4 py-3 text-left font-medium">
												{h}
											</th>
										))}
									</tr>
								</thead>

								<tbody>
									{filteredBookings.length === 0 && (
										<tr>
											<td colSpan={8} className="py-6 text-center text-muted-foreground">
												No history records found.
											</td>
										</tr>
									)}

									{paginate(filteredBookings, page).map((b) => (
										<tr key={b.id} className="border-b hover:bg-muted/40">
											<td className="px-4 py-3">{b.guest}</td>
											<td className="px-4 py-3">{b.contact}</td>
											<td className="px-4 py-3">{b.room_display}</td>
											<td className="px-4 py-3">
												{new Date(b.check_in).toLocaleString()}
											</td>
											<td className="px-4 py-3">
												{new Date(b.check_out).toLocaleString()}
											</td>

											<td className="px-4 py-3">
												<StatusBadge status={b.status as keyof typeof statusConfig} />
											</td>

											<td className="px-4 py-3">
												₱ {Number(b.amount).toFixed(2)}
											</td>

											<td className="px-4 py-3 flex items-center gap-2">
												<Button
													size="icon"
													variant="outline"
													onClick={() => {
														window.open(`/bookings/${b.id}/print`, '_blank');
													}}
												>
													<Printer className="h-4 w-4" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{totalPages > 1 && (
							<div className="flex items-center justify-between pt-4">
								<p className="text-sm text-muted-foreground">
									Page {page} of {totalPages}
								</p>

								<div className="flex gap-2">
									<Button
										variant="outline"
										disabled={page === 1}
										onClick={() => setPage(page - 1)}
									>
										Previous
									</Button>

									<Button
										variant="outline"
										disabled={page === totalPages}
										onClick={() => setPage(page + 1)}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}