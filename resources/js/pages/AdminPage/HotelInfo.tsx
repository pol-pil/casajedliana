import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Admin', href: '/admin' },
	{ title: 'Hotel Info', href: '/admin/hotel-info' },
];

export default function HotelInfo() {
	const { hotel } = usePage().props as any;

	const [hotelName, setHotelName] = useState(hotel?.hotel_name || '');
	const [logo, setLogo] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [restoreFile, setRestoreFile] = useState<File | null>(null);

	useEffect(() => {
		if (hotel?.hotel_name) {
			setHotelName(hotel.hotel_name);
		}
	}, [hotel]);

	function handleSave() {
		if (!hotelName) {
			toast.error('Hotel name is required');
			return;
		}

		const formData = new FormData();
		formData.append('hotel_name', hotelName);

		if (logo) {
			formData.append('logo', logo);
		}

		router.post('/admin/hotel-info', formData, {
			forceFormData: true,
			preserveScroll: true,
			onSuccess: () => {
				toast.success('Hotel info updated successfully');
				router.reload({ only: ['hotel'] });
				setPreview(null);
				setLogo(null);
			},
			onError: () => {
				toast.error('Failed to update hotel info');
			},
		});
	}

	function handleBackup() {
		window.location.href = '/admin/backup/download';
	}

	function handleRestore() {
		if (!restoreFile) {
			toast.error('Please select a backup file');
			return;
		}

		const formData = new FormData();
		formData.append('backup', restoreFile);

		router.post('/admin/backup/restore', formData, {
			forceFormData: true,
			onSuccess: () => toast.success('System restored successfully'),
			onError: () => toast.error('Restore failed'),
		});
	}

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Hotel Info' />

			<div className='max-w-5xl space-y-6 p-6'>
				<Card className='mx-auto w-full max-w-2xl'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Building2 className='h-5 w-5' />
							Hotel Details
						</CardTitle>
					</CardHeader>

					<CardContent className='space-y-6'>
						<div className='space-y-2'>
							<Label>Hotel Name</Label>
							<Input value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
						</div>

						{/* LOGO */}
						<div className='space-y-2'>
							<Label>Hotel Logo</Label>

							<div className='flex items-center gap-4'>
								<div className='flex h-40 w-60 items-center justify-center overflow-hidden rounded-md border'>
									{preview ? (
										<img src={preview} className='h-full w-full object-contain' />
									) : hotel?.logo ? (
										<img src={`/storage/${hotel.logo}`} className='h-full w-full object-contain' />
									) : (
										<span className='text-xs text-muted-foreground'>No Logo</span>
									)}
								</div>

								<div className='flex w-full flex-col gap-2'>
									<Input
										type='file'
										accept='image/*'
										onChange={(e) => {
											if (e.target.files?.[0]) {
												const file = e.target.files[0];
												setLogo(file);
												setPreview(URL.createObjectURL(file));
											}
										}}
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className='mx-auto w-full max-w-2xl'>
					<CardHeader>
						<CardTitle>Backup & Restore</CardTitle>
						<p className='text-sm text-muted-foreground'>Manage system backups and restore data when needed</p>
					</CardHeader>

					<CardContent className='grid gap-6 md:grid-cols-2'>
						{/* BACKUP */}
						<div className='flex flex-col items-center gap-4 rounded-lg border p-6 text-center'>
							<Download className='h-10 w-10 text-blue-500' />
							<h3 className='font-semibold'>Backup Data</h3>

							<Button className='w-full' onClick={handleBackup}>
								Download Backup
							</Button>
						</div>

						{/* RESTORE */}
						<div className='flex flex-col items-center gap-4 rounded-lg border p-6 text-center'>
							<Upload className='h-10 w-10 text-blue-500' />
							<h3 className='font-semibold'>Restore Data</h3>

							<Input
								type='file'
								className='w-full'
								onChange={(e) => {
									if (e.target.files?.[0]) {
										setRestoreFile(e.target.files[0]);
									}
								}}
							/>

							<Button className='w-full' variant='outline' onClick={handleRestore}>
								Upload & Restore
							</Button>
						</div>
					</CardContent>
				</Card>

				<div className='flex justify-end gap-2'>
					<Button variant='outline'>Cancel</Button>
					<Button onClick={handleSave}>Save Changes</Button>
				</div>
			</div>
		</AppLayout>
	);
}
