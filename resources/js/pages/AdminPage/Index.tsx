import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, Home,} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Dashboard', href: '/dashboard' },
	{ title: 'Admin', href: '/admin' },
];

export default function Index() {
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
				<div className="grid w-full gap-4 md:grid-cols-2 max-w-3xl mx-auto">
					{/* USERS */}
					<Card className='transition hover:shadow-md'>
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

					{/* EVENTS */}
					<Card className='transition hover:shadow-md'>
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

				{/* USER TABLE */}
				<Card>
					<CardContent className='p-0'>
						{/* HEADER */}
						<div className='flex items-center justify-between border-b px-4 py-3'>
							<h2 className='font-semibold'>User Management</h2>
						</div>

						{/* TABLE */}
						<div className='overflow-x-auto'>
							<Table className="text-[15px]">
								{/* HEADER */}
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Username</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>

								{/* BODY */}
								<TableBody>
									{[
										{ id: '#01', name: 'Admin', email: 'Admin@gmail' },
										{ id: '#02', name: 'Front Desk Officer', email: 'Frontdeskoffice@gmail' },
										{ id: '#03', name: 'Hotel Manager', email: 'Hotelmanager@gmail.com' },
									].map((user, i) => (
										<TableRow key={i} className='transition hover:bg-muted/50'>
											<TableCell className='font-medium'>{user.id}</TableCell>

											<TableCell>{user.name}</TableCell>

											<TableCell className='text-muted-foreground'>{user.email}</TableCell>

											<TableCell>
												<span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700'>
													Active
												</span>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
