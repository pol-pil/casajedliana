import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { RatesChart } from '@/components/rates-chart';
import { ChargesChart } from '@/components/charges-chart';
import ChargesSection from '@/components/charge-section';
import RatesSection from '@/components/rates-section';
import BookingTypesSection from '@/components/booking-types-section';

type Rate = {
	id: number;
	name: string;
	value: number;
	type: 'fixed' | 'percentage';
};

type Charge = {
	id: number;
	name: string;
	value: number;
	type: 'amenity' | 'damage';
};

type BookingType = {
	id: number;
	name: string;
};

type Stats = {
	totalBookings: number;
};

type PageData = {
	rates: Rate[];
	charges: Charge[];
	bookingTypes: BookingType[];
	stats: Stats;
};

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Configurations',
		href: '/rates',
	},
];

export default function Index() {
	const { rates, charges, bookingTypes, stats } = usePage().props as unknown as {
		rates: Rate[];
		charges: Charge[];
		bookingTypes: BookingType[];
		stats: Stats;
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<div className='px-8 py-4 xl:overflow-hidden'>
				<Head title='Configurations' />

				<div className='grid h-full gap-4 xl:grid-cols-3'>
					{/* Column 1 */}
					<div className='flex h-full flex-col space-y-4 overflow-hidden'>
						<RatesChart rates={rates} totalBookings={stats.totalBookings} />
						<div className='flex-1'>
							<RatesSection rates={rates} />
						</div>
					</div>

					{/* Column 2 */}
					<div className='flex h-full flex-col space-y-4 overflow-hidden'>
						<ChargesChart />
						<div className='flex-1'>
							<BookingTypesSection bookingTypes={bookingTypes} />
						</div>
					</div>

					{/* Column 3 */}
					<div className='flex h-full flex-col gap-6 overflow-hidden'>
						<div className='flex-1'>
							<ChargesSection charges={charges} />
						</div>
					</div>
				</div>
			</div>
		</AppLayout>
	);
}
