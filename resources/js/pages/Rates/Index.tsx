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
			<div className='h-full xl:flex'>
				<div className='flex flex-1 gap-4 px-8 py-4'>
					<Head title='Configurations' />

					<div className='flex-1 flex-col space-y-4'>
						<RatesChart rates={rates} totalBookings={stats.totalBookings} />
						<RatesSection rates={rates} />
					</div>

					<div className='flex flex-1 flex-col gap-4'>
						<ChargesChart />
						<BookingTypesSection bookingTypes={bookingTypes} />
					</div>

					<div className='flex flex-1 flex-col gap-6'>
						<ChargesSection charges={charges} />
					</div>
				</div>
			</div>
		</AppLayout>
	);
}
