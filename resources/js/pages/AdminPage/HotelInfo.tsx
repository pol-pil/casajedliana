import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hotel Info', href: '/admin/hotel-info' }];

export default function HotelInfo() {
	const [hotelName, setHotelName] = useState('');
	const [logo, setLogo] = useState<File | null>(null);
	const [restoreFile, setRestoreFile] = useState<File | null>(null);

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
			onSuccess: () => {
				toast.success('Hotel info updated successfully');
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
			onSuccess: () => {
				toast.success('System restored successfully');
			},
			onError: () => {
				toast.error('Restore failed');
			},
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

						<p className='text-sm text-muted-foreground'>
							Update your property information. This will be used across bookings, reports, and system-generated documents.
						</p>
					</CardHeader>

					<CardContent className='space-y-6'>
						<div className='space-y-2'>
							<Label>Hotel Name</Label>
							<Input placeholder='Enter hotel name' value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
						</div>

						{/* LOGO UPLOAD */}
						<div className='space-y-2'>
							<Label>Hotel Logo</Label>

							<div className='flex items-center gap-4'>
								{/* PREVIEW PLACEHOLDER */}
								<div className='flex h-40 w-60 items-center justify-center rounded-md border text-xs text-muted-foreground'>
									Logo
								</div>

								<div className='flex w-full flex-col gap-2'>
									<Input
										type='file'
										onChange={(e) => {
											if (e.target.files?.[0]) {
												setLogo(e.target.files[0]);
											}
										}}
									/>
									<p className='text-xs text-muted-foreground'>Upload a logo (PNG, JPG). Recommended size: 512x512px.</p>
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
					<Button className='bg-secondary hover:bg-primary' onClick={handleSave}>
						Save Changes
					</Button>
				</div>
			</div>
		</AppLayout>
	);
}
