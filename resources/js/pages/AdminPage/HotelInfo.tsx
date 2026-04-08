import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Building2, Clock, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hotel Info', href: '/admin/hotel-info' }];

export default function HotelInfo() {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Hotel Info' />

			<div className='max-w-5xl space-y-6 p-6'>
				<Card className='mx-auto w-full max-w-xl'>
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
						{/* LOGO UPLOAD */}
						<div className='space-y-2'>
							<Label>Hotel Logo</Label>

							<div className='flex items-center gap-4'>
								{/* PREVIEW PLACEHOLDER */}
								<div className='flex h-40 w-60 items-center justify-center rounded-md border text-xs text-muted-foreground'>
									Logo
								</div>

								<div className='flex w-full flex-col gap-2'>
									<Input type='file' />
									<p className='text-xs text-muted-foreground'>Upload a logo (PNG, JPG). Recommended size: 512x512px.</p>
								</div>
							</div>
						</div>

						<div className='space-y-2'>
							<Label>Hotel Name</Label>
							<Input placeholder='Enter hotel name' />
						</div>

					</CardContent>
				</Card>

			<Card className='mx-auto w-full max-w-xl'>
					<CardHeader>
						<CardTitle>Backup & Restore</CardTitle>
						<p className='text-sm text-muted-foreground'>Manage system backups and restore data when needed</p>
					</CardHeader>

					<CardContent className='grid gap-6 md:grid-cols-2'>
						{/* BACKUP */}
						<div className='flex flex-col items-center gap-4 rounded-lg border p-6 text-center'>
							<Download className='h-10 w-10 text-blue-500' />
							<h3 className='font-semibold'>Backup Data</h3>

							<Button className='w-full'>Download Backup</Button>
						</div>

						{/* RESTORE */}
						<div className='flex flex-col items-center gap-4 rounded-lg border p-6 text-center'>
							<Upload className='h-10 w-10 text-blue-500' />
							<h3 className='font-semibold'>Restore Data</h3>

							<Input type='file' className='w-full' />

							<Button className='w-full' variant='outline'>
								Upload & Restore
							</Button>
						</div>
					</CardContent>
				</Card>

				<div className='flex justify-end gap-2'>
					<Button variant='outline'>Cancel</Button>
					<Button className='bg-green-500 hover:bg-green-600'>Save Changes</Button>
				</div>
			</div>
		</AppLayout>
	);
}
