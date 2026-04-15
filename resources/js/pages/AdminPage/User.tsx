import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { MoreVertical, Pencil, Trash2, PauseCircle, Search, Plus } from 'lucide-react';

type User = {
	id: number;
	name: string;
	email: string;
	role: string;
	status: string;
};

type PageProps = {
	users?: User[];
	filters?: {
		search?: string;
		status?: string;
	};
	auth: {
		user: {
			id: number;
		};
	};
};

export default function Index() {
	const { users = [], filters = {}, auth } = usePage<PageProps>().props;

	const [search, setSearch] = useState(filters.search || '');
	const [status, setStatus] = useState(filters.status || 'all');

	const [createOpen, setCreateOpen] = useState(false);
	const [passwordOpen, setPasswordOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		confirm: '',
		role: 'frontdesk',
	});

	const [newPassword, setNewPassword] = useState('');

	const [editOpen, setEditOpen] = useState(false);
	const [resetOpen, setResetOpen] = useState(false);

	const [editForm, setEditForm] = useState({
		name: '',
		email: '',
		role: 'frontdesk',
	});

	const [editError, setEditError] = useState({
		name: '',
		email: '',
	});

	const [resetForm, setResetForm] = useState({
		password: '',
		confirm: '',
	});

	const [passwordError, setPasswordError] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	useEffect(() => {
		const delay = setTimeout(() => {
			const params: any = {};

			if (search) params.search = search;
			if (status && status !== 'all') params.status = status;

			router.get('/admin/users', params, {
				preserveState: true,
				replace: true,
			});
		}, 400);

		return () => clearTimeout(delay);
	}, [search, status]);

	const resetPassword = () => {
		if (!selectedUser) return;

		router.patch(`/admin/users/${selectedUser.id}/password`, {
			password: newPassword,
		});
	};

	const getStatusVariant = (status: string) => (status === 'active' ? 'default' : 'destructive');

	const getRoleVariant = (role: string) => (role === 'admin' ? 'default' : 'secondary');

	return (
		<AppLayout breadcrumbs={[]}>
			<Head title='User Management' />

			<div className='space-y-4 p-6'>
				{/* TOP BAR */}
				<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
					{/* LEFT SIDE (SEARCH + TABS) */}
					<div className='flex flex-col gap-3 md:flex-row md:items-center'>
						{/* SEARCH */}
						<div className='relative w-full md:w-[280px]'>
							<Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search users...'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className='pl-8'
							/>
						</div>

						{/* TABS */}
						<Tabs value={status} onValueChange={setStatus}>
							<TabsList className='h-9'>
								<TabsTrigger value='all'>All</TabsTrigger>
								<TabsTrigger value='active'>Active</TabsTrigger>
								<TabsTrigger value='inactive'>Inactive</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* RIGHT SIDE (CREATE BUTTON) */}
					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className='mr-2 h-4 w-4' />
								Create User
							</Button>
						</DialogTrigger>

						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create User</DialogTitle>
							</DialogHeader>

							<div className='space-y-4'>
								<div className='space-y-1'>
									<Label>Name</Label>
									<Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
								</div>

								<div className='space-y-1'>
									<Label>Email</Label>
									<Input type='email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
								</div>

								<div className='space-y-1'>
									<Label>Role</Label>
									<Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>

										<SelectContent>
											<SelectItem value='admin'>Admin</SelectItem>
											<SelectItem value='frontdesk'>Frontdesk</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-1'>
									<Label>Password</Label>
									<Input
										type='password'
										value={form.password}
										onChange={(e) => setForm({ ...form, password: e.target.value })}
									/>
								</div>

								<div className='space-y-1'>
									<Label>Confirm Password</Label>
									<Input
										type='password'
										value={form.confirm}
										onChange={(e) => setForm({ ...form, confirm: e.target.value })}
									/>
								</div>
							</div>

							<DialogFooter>
								<Button
									className='w-full'
									onClick={() => {
										if (!form.name || !form.email || !form.password || !form.confirm) {
											toast.error('Please fill all fields');
											return;
										}

										if (form.password !== form.confirm) {
											toast.error('Passwords do not match');
											return;
										}

										router.post('/admin/users', form, {
											onSuccess: () => {
												toast.success('User created successfully 🎉');
												setCreateOpen(false);
												setForm({
													name: '',
													email: '',
													password: '',
													confirm: '',
													role: 'frontdesk',
												});
											},
										});
									}}
								>
									Create User
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Dialog open={editOpen} onOpenChange={setEditOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit User</DialogTitle>
							</DialogHeader>

							<div className='space-y-4'>
								<div className='space-y-1'>
									<Label>Name</Label>
									<Input
										value={editForm.name}
										onChange={(e) => {
											setEditForm({ ...editForm, name: e.target.value });
											setEditError((prev) => ({ ...prev, name: '' }));
										}}
									/>

									{editError.name && <p className='text-sm text-red-500'>{editError.name}</p>}
								</div>

								<div className='space-y-1'>
									<Label>Email</Label>
									<Input
										type='email'
										value={editForm.email}
										onChange={(e) => {
											setEditForm({ ...editForm, email: e.target.value });
											setEditError((prev) => ({ ...prev, email: '' }));
										}}
									/>

									{editError.email && <p className='text-sm text-red-500'>{editError.email}</p>}
								</div>
								<div className='space-y-1'>
									<Label>Role</Label>

									<Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
										<SelectTrigger className='w-[140px]'>
											<SelectValue placeholder='Select role' />
										</SelectTrigger>

										<SelectContent>
											<SelectItem value='admin'>Admin</SelectItem>
											<SelectItem value='frontdesk'>Frontdesk</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<DialogFooter className='flex justify-between'>
								{/* RESET PASSWORD BUTTON */}
								<Button
									variant='outline'
									onClick={() => setResetOpen(true)}
									className='hover:bg-transparent hover:text-foreground'
								>
									Reset Password
								</Button>

								<Button
									onClick={() => {
										if (!selectedUser) return;

										// RESET ERRORS
										setEditError({ name: '', email: '' });

										let hasError = false;

										// ❌ ROLE VALIDATION
										if (!editForm.role) {
											toast.error('Role is required');
											return;
										}
										// ❌ NAME REQUIRED
										if (!editForm.name) {
											setEditError((prev) => ({
												...prev,
												name: 'Name is required',
											}));
											hasError = true;
										}

										// ❌ EMAIL REQUIRED
										if (!editForm.email) {
											setEditError((prev) => ({
												...prev,
												email: 'Email is required',
											}));
											hasError = true;
										}
										// ❌ INVALID EMAIL FORMAT
										else if (!/^\S+@\S+\.\S+$/.test(editForm.email)) {
											setEditError((prev) => ({
												...prev,
												email: 'Invalid email format',
											}));
											hasError = true;
										}

										// STOP IF ERROR
										if (hasError) return;

										if (
											editForm.name === selectedUser.name &&
											editForm.email === selectedUser.email &&
											editForm.role === selectedUser.role
										) {
											toast.error('No changes detected');
											return;
										}

										router.patch(`/admin/users/${selectedUser.id}`, editForm, {
											onSuccess: () => {
												toast.success('User updated successfully ✨');
												setEditOpen(false);
											},

											onError: (errors: Record<string, string>) => {
												if (errors.name || errors.email) {
													setEditError({
														name: errors.name || '',
														email: errors.email || '',
													});
												}

												if (errors.role) {
													toast.error(errors.role); // 🔥 show backend message
												}
											},
										});
									}}
								>
									Save Changes
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Dialog open={resetOpen} onOpenChange={setResetOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Reset Password</DialogTitle>
							</DialogHeader>

							<div className='space-y-4'>
								<div className='space-y-1'>
									<Label>New Password</Label>
									<Input
										type='password'
										value={resetForm.password}
										onChange={(e) => {
											setResetForm({
												...resetForm,
												password: e.target.value,
											});
											setPasswordError('');
										}}
									/>
								</div>

								<div className='space-y-1'>
									<Label>Confirm Password</Label>
									<Input
										type='password'
										value={resetForm.confirm}
										onChange={(e) => {
											setResetForm({
												...resetForm,
												confirm: e.target.value,
											});
											setPasswordError('');
										}}
									/>

									{/* 🔴 ERROR MESSAGE */}
									{passwordError && <p className='text-sm text-red-500'>{passwordError}</p>}
								</div>
							</div>

							<DialogFooter>
								{/* ALERT CONFIRM */}
								<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
									{/* BUTTON (NO TRIGGER) */}
									<Button
										onClick={() => {
											setPasswordError('');

											// ❌ EMPTY
											if (!resetForm.password || !resetForm.confirm) {
												setPasswordError('All fields are required');
												return;
											}

											// ❌ NOT MATCH
											if (resetForm.password !== resetForm.confirm) {
												setPasswordError('Passwords do not match');
												return;
											}

											// ❌ WEAK
											if (resetForm.password.length < 6) {
												setPasswordError('Password must be at least 6 characters');
												return;
											}

											// ✅ ONLY HERE IT OPENS
											setConfirmOpen(true);
										}}
									>
										Update Password
									</Button>

									{/* MODAL */}
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
											<AlertDialogDescription>This will update the user’s password.</AlertDialogDescription>
										</AlertDialogHeader>

										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>

											<AlertDialogAction
												onClick={() => {
													if (!selectedUser) return;

													router.patch(
														`/admin/users/${selectedUser.id}/password`,
														{ password: resetForm.password },
														{
															onSuccess: () => {
																toast.success('Password updated successfully 🔐');

																setResetOpen(false);
																setConfirmOpen(false);

																setResetForm({
																	password: '',
																	confirm: '',
																});
															},

															// ✅ STEP 2 GOES HERE
															onError: (errors: any) => {
																if (errors.password) {
																	setPasswordError(errors.password);
																} else {
																	toast.error('Password update failed');
																}
															},
														},
													);
												}}
											>
												Confirm
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* ✅ DELETE USER DIALOG (ADD HERE) */}
					<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete User?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete the user.
								</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>

								<AlertDialogAction
									className='bg-red-600 hover:bg-red-700'
									onClick={() => {
										if (!selectedUser) return;

										const user = selectedUser;

										router.delete(`/admin/users/${user.id}`, {
											onSuccess: () => {
												toast.success('User deleted successfully 🗑️');
												setDeleteOpen(false);
											},
											onError: () => {
												toast.error('Failed to delete user');
											},
										});
									}}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>

				{/* TABLE */}
				<Card>
					<CardHeader>
						<CardTitle>User Management</CardTitle>
					</CardHeader>

					<CardContent className='p-0'>
						<div className='overflow-x-auto'>
							<table className='w-full text-sm'>
								<thead className='bg-muted'>
									<tr>
										<th className='px-4 py-3 text-left'>ID</th>
										<th className='px-4 py-3 text-left'>Name</th>
										<th className='px-4 py-3 text-left'>Email</th>
										<th className='px-4 py-3 text-left'>Role</th>
										<th className='px-4 py-3 text-left'>Status</th>
										<th className='px-4 py-3 text-left'>Action</th>
									</tr>
								</thead>

								<tbody>
									{users.map((user) => (
										<tr key={user.id} className='border-t'>
											<td className='px-4 py-3'>#{user.id}</td>
											<td className='px-4 py-3'>{user.name}</td>
											<td className='px-4 py-3'>{user.email}</td>

											<td className='px-4 py-3'>
												<Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
											</td>

											<td className='px-4 py-3'>
												<Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
											</td>

											<td className='px-4 py-3'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='icon'>
															<MoreVertical className='h-4 w-4' />
														</Button>
													</DropdownMenuTrigger>

													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															onClick={() => {
																setSelectedUser(user);
																setEditForm({
																	name: user.name ?? '',
																	email: user.email ?? '',
																	role: user.role ?? 'frontdesk',
																});
																setEditOpen(true);
															}}
														>
															<Pencil className='mr-2 h-4 w-4' />
															Edit
														</DropdownMenuItem>

														<AlertDialog>
															<AlertDialogTrigger asChild>
																<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
																	<PauseCircle className='mr-2 h-4 w-4' />
																	{user.status === 'active' ? 'Suspend' : 'Activate'}
																</DropdownMenuItem>
															</AlertDialogTrigger>

															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>Confirm Action</AlertDialogTitle>
																	<AlertDialogDescription>
																		This will change user access.
																	</AlertDialogDescription>
																</AlertDialogHeader>

																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() => router.patch(`/admin/users/${user.id}/status`)}
																	>
																		Confirm
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>

														<DropdownMenuItem
															className='text-red-500 disabled:opacity-50'
															disabled={user.id === auth.user.id}
															onSelect={(e) => {
																if (user.id === auth.user.id) {
																	e.preventDefault();
																	return;
																}

																e.preventDefault();
																setSelectedUser(user);
																setDeleteOpen(true);
															}}
														>
															<Trash2 className='mr-2 h-4 w-4' />
															Delete
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
			</div>
		</AppLayout>
	);
}
