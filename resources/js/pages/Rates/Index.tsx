import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { RatesChart } from '@/components/rates-chart';
import { DiscountChart } from '@/components/discount-chart';
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
	chartRates: Rate[];
	chartStats: Stats;
	chartDiscounts: Discount[];
};

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Configurations',
		href: '/rates',
	},
];

type Discount = {
    id: number;
    name: string;
    value: number;
    totalDiscount: number;
};

export default function Index() {
	const { rates, charges, bookingTypes, chartRates, chartStats, chartDiscounts } = usePage().props as unknown as {
		rates: Rate[];
		charges: Charge[];
		bookingTypes: BookingType[];
		chartRates: Rate[];
		chartStats: Stats;
		chartDiscounts: Discount[];
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs} showDatePicker>
			<div className='px-8 py-4 xl:overflow-hidden'>
				<Head title='Configurations' />

				<div className='grid h-full gap-4 xl:grid-cols-3'>
					{/* Column 1 */}
					<div className='flex h-full flex-col space-y-4 overflow-hidden'>
						<RatesChart rates={chartRates} totalBookings={chartStats.totalBookings} />
						<div className='flex-1'>
							<RatesSection rates={rates} />
						</div>
					</div>

					{/* Column 2 */}
					<div className='flex h-full flex-col space-y-4 overflow-hidden'>
						<DiscountChart discounts={chartDiscounts} />
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
