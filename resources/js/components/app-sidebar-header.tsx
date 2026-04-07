import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarDays } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { useDateRange } from '@/contexts/date-range-context';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';

const presets = [
	{ label: 'Today', range: { from: new Date(), to: new Date() } },
	{ label: 'This Month', range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
	{ label: 'This Year', range: { from: startOfYear(new Date()), to: endOfYear(new Date()) } },
];

export function AppSidebarHeader({
	breadcrumbs = [],
	showDatePicker = false,
}: {
	breadcrumbs?: BreadcrumbItemType[];
	showDatePicker?: boolean;
}) {
	const { range, setRange } = useDateRange();
	const [isOpen, setIsOpen] = useState(false);

	const applyRange = (newRange: DateRange | undefined) => {
		setRange(newRange);
	};

	const handleApply = (overrideRange?: DateRange) => {
		const target = overrideRange ?? range;
		if (!target?.from || !target?.to) return;

		router.get(
			window.location.pathname,
			{
				start: format(target.from, 'yyyy-MM-dd'),
				end: format(target.to, 'yyyy-MM-dd'),
			},
			{ preserveState: true, replace: true },
		);

		setIsOpen(false);
	};

	return (
		<header className='flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4'>
			<div className='flex w-full items-center justify-between'>
				<div className='flex flex-row items-center gap-2'>
					<SidebarTrigger className='-ml-1' />
					<Breadcrumbs breadcrumbs={breadcrumbs} />
				</div>
				{showDatePicker && (
					<Popover open={isOpen} onOpenChange={setIsOpen}>
						<PopoverTrigger asChild>
							<Button className='p-5' variant='outline' size='sm'>
								<CalendarDays className='mr-2 h-4 w-4' />
								{range?.from && range?.to
									? `${format(range.from, 'MMM dd')} – ${format(range.to, 'MMM dd')}`
									: 'Select Dates'}
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-auto p-4' align='end'>
							<Calendar mode='range' selected={range} onSelect={applyRange} numberOfMonths={2} />

							<div className='flex justify-between pt-2'>
								<div className='mb-3 flex gap-2'>
									{presets.map((preset) => (
										<Button
											key={preset.label}
											variant='outline'
											size='sm'
											onClick={() => {
												setRange(preset.range);
												handleApply(preset.range);
											}}
										>
											{preset.label}
										</Button>
									))}
								</div>
								<Button size='sm' onClick={() => handleApply()} disabled={!range?.from || !range?.to}>
									Apply
								</Button>
							</div>
						</PopoverContent>
					</Popover>
				)}
			</div>
		</header>
	);
}
