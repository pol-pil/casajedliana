import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Input } from '@/components/ui/input';
import { MoreVertical, Pencil, Trash2, PauseCircle, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Dashboard', href: '/dashboard' },
	{ title: 'Admin', href: '/admin' },
	{ title: 'User Management', href: '/admin/users' },
];

type User = {
	id: string;
	name: string;
	email: string;
	status: string;
};

export default function Index() {
	const [users, setUsers] = useState<User[]>([
		{ id: '#01', name: 'Admin', email: 'Admin@gmail', status: '' },
		{ id: '#02', name: 'Front Desk Officer', email: 'Frontdeskoffice@gmail', status: '' },
		{ id: '#03', name: 'Hotel Manager', email: 'Hotelmanager@gmail.com', status: '' },
	]);

	// CREATE MODAL
	const [open, setOpen] = useState(false);

	// EDIT MODAL
	const [editOpen, setEditOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	// FORM STATE
	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		middleName: '',
		username: '',
		email: '',
		role: '',
	});

	const handleStatusChange = (index: number, value: string) => {
		const updated = [...users];
		updated[index].status = value;
		setUsers(updated);
	};

	const handleChange = (field: string, value: string) => {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// CREATE USER
	const handleCreateUser = () => {
		const newUser: User = {
			id: `#0${users.length + 1}`,
			name: form.username,
			email: form.email,
			status: 'active',
		};

		setUsers((prev) => [...prev, newUser]);

		setForm({
			firstName: '',
			lastName: '',
			middleName: '',
			username: '',
			email: '',
			role: '',
		});

		setOpen(false);
	};

	// EDIT CLICK
	const handleEditClick = (index: number) => {
		const user = users[index];

		setForm({
			firstName: '',
			lastName: '',
			middleName: '',
			username: user.name,
			email: user.email,
			role: '',
		});

		setSelectedIndex(index);
		setEditOpen(true);
	};

	// UPDATE USER
	const handleUpdateUser = () => {
		if (selectedIndex === null) return;

		const updated = [...users];

		updated[selectedIndex] = {
			...updated[selectedIndex],
			name: form.username,
			email: form.email,
		};

		setUsers(updated);
		setEditOpen(false);
	};

	// DELETE
	const handleDeleteUser = (index: number) => {
		const updated = users.filter((_, i) => i !== index);
		setUsers(updated);
	};

	// SUSPEND
	const handleSuspendUser = (index: number) => {
		const updated = [...users];
		updated[index].status = 'inactive';
		setUsers(updated);
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='User Management' />

			<div className='w-full min-w-0 p-6'>
				<Card>
					{/* HEADER */}
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle>User Management</CardTitle>

						{/* CREATE USER */}
						<Dialog open={open} onOpenChange={setOpen}>
							<DialogTrigger asChild>
								<Button size='sm' className='gap-2'>
									<Plus className='h-4 w-4' />
									Create User
								</Button>
							</DialogTrigger>

							<DialogContent className='sm:max-w-lg'>
								<DialogHeader>
									<DialogTitle>Create New User</DialogTitle>
								</DialogHeader>

								<div className='grid gap-4 py-4'>
									<div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
										<Input placeholder='First Name' onChange={(e) => handleChange('firstName', e.target.value)} />
										<Input placeholder='Middle Name' onChange={(e) => handleChange('middleName', e.target.value)} />
										<Input placeholder='Last Name' onChange={(e) => handleChange('lastName', e.target.value)} />
									</div>

									<Input placeholder='Username' onChange={(e) => handleChange('username', e.target.value)} />

									<Input
										type='email'
										placeholder='Email Address'
										onChange={(e) => handleChange('email', e.target.value)}
									/>

									<Select onValueChange={(value) => handleChange('role', value)}>
										<SelectTrigger>
											<SelectValue placeholder='Select Role' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='admin'>Admin</SelectItem>
											<SelectItem value='frontdesk'>Frontdesk</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<DialogFooter>
									<Button variant='outline' onClick={() => setOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleCreateUser}>Create User</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</CardHeader>

					{/* CONTENT */}
					<CardContent className='p-0'>
						<div className='overflow-x-auto'>
							<table className='w-full text-sm'>
								<thead className='bg-muted'>
									<tr>
										<th className='px-4 py-3 text-left'>ID</th>
										<th className='px-4 py-3 text-left'>Username</th>
										<th className='px-4 py-3 text-left'>Email</th>
										<th className='px-4 py-3 text-left'>Status</th>
										<th className='px-4 py-3 text-left'>Action</th>
									</tr>
								</thead>

								<tbody>
									{users.map((user, index) => (
										<tr key={index} className='border-t'>
											<td className='px-4 py-3'>{user.id}</td>
											<td className='px-4 py-3'>{user.name}</td>
											<td className='px-4 py-3'>{user.email}</td>

											<td className='px-4 py-3'>
												<Select value={user.status} onValueChange={(value) => handleStatusChange(index, value)}>
													<SelectTrigger className='w-[150px]'>
														<SelectValue placeholder='Select Status' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='active'>Active</SelectItem>
														<SelectItem value='inactive'>Inactive</SelectItem>
													</SelectContent>
												</Select>
											</td>

											{/* ACTION MENU */}
											<td className='px-4 py-3'>
												<DropdownMenu>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<DropdownMenuTrigger asChild>
																	<Button variant='ghost' size='icon'>
																		<MoreVertical className='h-4 w-4' />
																	</Button>
																</DropdownMenuTrigger>
															</TooltipTrigger>

															<TooltipContent side='right'>Actions</TooltipContent>
														</Tooltip>
													</TooltipProvider>

													<DropdownMenuContent align='end' className='w-48'>
														{/* EDIT */}
														<DropdownMenuItem
															onClick={() => handleEditClick(index)}
															className='flex items-center gap-2'
														>
															<Pencil className='h-4 w-4' />
															Edit Account
														</DropdownMenuItem>

														{/* SUSPEND */}
														<DropdownMenuItem
															onClick={() => handleSuspendUser(index)}
															className='flex items-center gap-2'
														>
															<PauseCircle className='h-4 w-4' />
															Suspend Account
														</DropdownMenuItem>

														{/* DELETE */}
														<DropdownMenuItem
															onClick={() => handleDeleteUser(index)}
															className='flex items-center gap-2 text-red-500'
														>
															<Trash2 className='h-4 w-4' />
															Delete Account
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* EDIT MODAL */}
				<Dialog open={editOpen} onOpenChange={setEditOpen}>
					<DialogContent className='sm:max-w-lg'>
						<DialogHeader>
							<DialogTitle>Edit User</DialogTitle>
						</DialogHeader>

						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
								<Input placeholder='First Name' />
								<Input placeholder='Middle Name' />
								<Input placeholder='Last Name' />
							</div>

							<Input value={form.username} onChange={(e) => handleChange('username', e.target.value)} />

							<Input value={form.email} onChange={(e) => handleChange('email', e.target.value)} />

							<Select value={form.role} onValueChange={(value) => handleChange('role', value)}>
								<SelectTrigger>
									<SelectValue placeholder='Select Role' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='admin'>Admin</SelectItem>
									<SelectItem value='frontdesk'>Frontdesk</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<DialogFooter>
							<Button variant='outline' onClick={() => setEditOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleUpdateUser}>Save Changes</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</AppLayout>
	);
}
