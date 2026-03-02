import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Card, CardHeader } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AtSign, CircleUserRound, MapPin, Phone, Plus } from 'lucide-react';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Dashboard',
		href: dashboard().url,
	},
];

export default function Dashboard() {
	const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Dashboard' />
			<div className='px-80 py-40'>
				<Dialog open={isChargeDialogOpen}>
					<DialogContent className='min-w-160'>
						<div className='flex flex-row'>
							<div className='flex-1 space-y-4 px-4'>
								<div>
									<DialogHeader className='font-semibold'>Booking Info</DialogHeader>
									<DialogDescription className='space-y-1 py-2'>
										<div className='flex justify-between'>
											<span>Booking ID</span>
											<span>bjfksjdkfsjd</span>
										</div>
										<div className='flex justify-between'>
											<span>Booking Date</span>
											<span>bjfksjdkfsjd</span>
										</div>
										<div className='flex justify-between'>
											<span>Booking Time</span>
											<span>bjfksjdkfsjd</span>
										</div>
									</DialogDescription>
								</div>
								<div>
									<DialogHeader className='font-semibold'>Room Details</DialogHeader>
									<DialogDescription className='space-y-1 py-2'>
										<div className='flex justify-between'>
											<span>Room Type</span>
											<span>bjfksjdkfsjd</span>
										</div>
										<div className='flex justify-between'>
											<span>Room Number</span>
											<span>bjfksjdkfsjd</span>
										</div>
										<div className='flex justify-between'>
											<span>Number of Guests</span>
											<span>bjfksjdkfsjd</span>
										</div>
										<div className='flex justify-between'>
											<span>Price</span>
											<span>bjfksjdkfsjd</span>
										</div>
									</DialogDescription>
								</div>
								<div>
									<DialogHeader className='font-semibold'>Check-In / Check-Out</DialogHeader>
									<DialogDescription className='space-y-1 py-2'>
										<div className='flex justify-between'>
											<span>Check-In Date</span>
											<span>bjfksjdkfsjd</span>
										</div>
										<div className='flex justify-between'>
											<span>Check-In Time</span>
											<span>bjfksjdkfsjd</span>
										</div>
										<div className='flex justify-between'>
											<span>Check-Out Date</span>
											<span>bjfksjdkfsjd</span>
										</div>
										<div className='flex justify-between'>
											<span>Check-Out Time</span>
											<span>bjfksjdkfsjd</span>
										</div>
									</DialogDescription>
								</div>
								<div>
									<DialogHeader className='font-semibold'>Special Request</DialogHeader>
									<DialogDescription className='py-2'>bjfksjdkfsjd</DialogDescription>
								</div>
							</div>
							<Separator orientation='vertical' className='mx-4' />
							<div className='flex-1 px-4'>
								<DialogHeader className='font-semibold'>Guest Profile</DialogHeader>
								<div className='flex items-center p-2 '>
									<CircleUserRound className='mr-3 size-12' />
									<div>
										<DialogHeader className='font-semibold'>John Doe</DialogHeader>
										<DialogDescription>Gidhasjdhajsdh</DialogDescription>
									</div>
								</div>
								<div className='px-3 py-2 space-y-1'>
									<DialogDescription className='flex items-center'>
										<Phone className='mr-2 size-4' />
										asadasdasd
									</DialogDescription>
									<DialogDescription className='flex items-center'>
										<AtSign className='mr-2 size-4' />
										asadasdasd
									</DialogDescription>
                                    <DialogDescription className='flex items-center'>
										<MapPin className='mr-2 size-4' />
										asadasdasd
									</DialogDescription>
								</div>
                                <Separator className='my-2'/>
                                <div>
                                    <DialogHeader className='font-semibold'>Additional</DialogHeader>
                                    <DialogDescription className='py-2'>Ammenities</DialogDescription>
                                    <Badge className='mr-2'>asdasdasd</Badge>
                                    <Badge className='mr-2'>qweqwe</Badge>
                                    <Badge className='mr-2'>utyjhj</Badge>
                                </div>
							</div>
						</div>
						<DialogFooter className='-mt-10'>
							<DialogClose asChild>
								<Button type='button' variant='outline'>
									Close
								</Button>
							</DialogClose>
							<Button type='submit'>Edit</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</AppLayout>
	);
}
