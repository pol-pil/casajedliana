import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, BedDouble, Home, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
				<div className='grid w-full min-w-0 gap-4 md:grid-cols-3'>
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

					{/* ROOMS */}
					<Card className='transition hover:shadow-md'>
						<CardContent className='flex items-center justify-between p-5'>
							<div className='text-center'>
								<h2 className='text-3xl font-bold'>10</h2>
								<p className='text-sm text-muted-foreground'>Total Rooms</p>
							</div>

							<div className='flex h-20 w-20 items-center justify-center rounded-full bg-green-100'>
								<BedDouble className='h-10 w-10 text-green-600' />
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

				<div className='rounded-xl border p-4'>
					<h2 className='mb-4 font-medium'>Room Management</h2>

					<div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
						{[
							{ name: '101-102', type: 'Family Room' },
							{ name: '103-104', type: 'Family Room' },
							{ name: '105', type: 'Rest House' },
							{ name: '201', type: 'Suite Room' },
							{ name: '202', type: 'Suite Room' },
							{ name: '203', type: 'Standard Room' },
							{ name: '204', type: 'Standard Room' },
							{ name: '205', type: 'Standard Room' },
							{ name: '206', type: 'Standard Room' },
							{ name: '207', type: 'Quadro Room' },
							{ name: '208', type: 'Quadro Room' },
							{ name: 'JEDIDIA', type: 'Jedidia Hall' },
							{ name: 'EDIANE', type: 'Ediane Hall' },
							{ name: 'ELIANA', type: 'Eliana Hall' },
							{ name: 'GARDEN', type: 'Garden' },
							{ name: 'ROOF DECK', type: 'Roof Deck Venue' },
							{ name: 'KTV', type: 'KTV' },
							{ name: 'BILLIARDS AND GYM', type: 'Billiards and Gym' },
						].map((room, i) => (
							<Card key={i} className='relative transition hover:shadow-md'>
								<CardContent className='p-4'>
									<Button size='icon' variant='ghost' className='absolute top-2 right-2 h-6 w-6'>
										<Pencil className='h-4 w-4' />
									</Button>

									<div className='flex flex-col gap-1'>
										<span className='text-lg font-semibold'>{room.name}</span>
										<span className='text-sm text-muted-foreground'>{room.type}</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</AppLayout>
	);
}
