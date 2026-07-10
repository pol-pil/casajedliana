import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search} from 'lucide-react';

import UserTable from '@/components/users/UserTable';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import ResetPasswordDialog from '@/components/users/ResetPasswordDialog';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Admin', href: '/admin' },
	{ title: 'Users', href: 'admin/users' },
];

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
		<AppLayout breadcrumbs={breadcrumbs}>
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
					<CreateUserDialog
						open={createOpen}
						setOpen={setCreateOpen}
						form={form}
						setForm={setForm}
						onSubmit={() => {
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
					/>

					<EditUserDialog
						open={editOpen}
						setOpen={setEditOpen}
						editForm={editForm}
						setEditForm={setEditForm}
						editError={editError}
						setEditError={setEditError}
						selectedUser={selectedUser}
						onResetPassword={() => setResetOpen(true)}
						onSave={() => {
							if (!selectedUser) return;

							setEditError({ name: '', email: '' });

							let hasError = false;

							if (!editForm.role) {
								toast.error('Role is required');
								return;
							}

							if (!editForm.name) {
								setEditError((prev) => ({ ...prev, name: 'Name is required' }));
								hasError = true;
							}

							if (!editForm.email) {
								setEditError((prev) => ({ ...prev, email: 'Email is required' }));
								hasError = true;
							} else if (!/^\S+@\S+\.\S+$/.test(editForm.email)) {
								setEditError((prev) => ({ ...prev, email: 'Invalid email format' }));
								hasError = true;
							}

							if (hasError) return;

							router.patch(`/admin/users/${selectedUser.id}`, editForm, {
								onSuccess: () => {
									toast.success('User updated successfully ✨');
									setEditOpen(false);
								},
							});
						}}
					/>

					<ResetPasswordDialog
						open={resetOpen}
						setOpen={setResetOpen}
						resetForm={resetForm}
						setResetForm={setResetForm}
						passwordError={passwordError}
						setPasswordError={setPasswordError}
						confirmOpen={confirmOpen}
						setConfirmOpen={setConfirmOpen}
						onConfirm={() => {
							if (!selectedUser) return;

							router.patch(
								`/admin/users/${selectedUser.id}/password`,
								{ password: resetForm.password },
								{
									onSuccess: () => {
										toast.success('Password updated successfully 🔐');
										setResetOpen(false);
										setConfirmOpen(false);
										setResetForm({ password: '', confirm: '' });
									},
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
					/>

					{/* ✅ DELETE USER DIALOG (ADD HERE) */}
					<DeleteUserDialog
						open={deleteOpen}
						setOpen={setDeleteOpen}
						onDelete={() => {
							if (!selectedUser) return;

							router.delete(`/admin/users/${selectedUser.id}`, {
								onSuccess: () => {
									toast.success('User deleted successfully 🗑️');
									setDeleteOpen(false);
								},
								onError: () => {
									toast.error('Failed to delete user');
								},
							});
						}}
					/>
				</div>

				{/* TABLE */}
				<UserTable
					users={users}
					authUserId={auth.user.id}
					getRoleVariant={getRoleVariant}
					getStatusVariant={getStatusVariant}
					onEdit={(user) => {
						setSelectedUser(user);
						setEditForm({
							name: user.name ?? '',
							email: user.email ?? '',
							role: user.role ?? 'frontdesk',
						});
						setEditOpen(true);
					}}
					onDelete={(user) => {
						setSelectedUser(user);
						setDeleteOpen(true);
					}}
				/>
			</div>
		</AppLayout>
	);
}
