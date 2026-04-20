import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarDays } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { useDateRange } from '@/contexts/date-range-context';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import AppearanceToggleTab from './appearance-tabs';
import AppearanceToggleButton from './appearance-button';

const presets = [
	{ label: 'Today', range: { from: new Date(), to: new Date() } },
	{ label: 'This Month', range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
	{ label: 'This Year', range: { from: startOfYear(new Date()), to: endOfYear(new Date()) } },
];

function getGreeting(hour: number): string {
	if (hour >= 5 && hour < 12) return 'Good Morning';
	if (hour >= 12 && hour < 18) return 'Good Afternoon';
	if (hour >= 18 && hour < 22) return 'Good Evening';
	return 'Hello';
}

export function AppSidebarHeader({
	breadcrumbs = [],
	showDatePicker = false,
}: {
	breadcrumbs?: BreadcrumbItemType[];
	showDatePicker?: boolean;
}) {
	const { range, setRange } = useDateRange();
	const [isOpen, setIsOpen] = useState(false);
	const [now, setNow] = useState(() => new Date());
	const { auth } = usePage<SharedData>().props;

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const greeting = getGreeting(now.getHours());
	const formattedTime = format(now, 'h:mm a');

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

	const [weather, setWeather] = useState<{
		temp: number;
		icon: string;
	} | null>(null);

	useEffect(() => {
		const cached = localStorage.getItem('weather');
	
		if (cached) {
			setWeather(JSON.parse(cached));
		}
	
		const fetchWeather = async () => {
			try {
				const res = await fetch(
					'https://api.open-meteo.com/v1/forecast?latitude=15.4467&longitude=120.9853&current_weather=true'
				);
				const data = await res.json();
	
				const code = data.current_weather.weathercode;
				const temp = data.current_weather.temperature;
	
				const iconMap: Record<number, string> = {
					// Clear
					0: '☀️',
					// Mainly clear, partly cloudy, overcast
					1: '🌤️', 2: '⛅', 3: '☁️',
					// Fog
					45: '🌫️', 48: '🌫️',
					// Drizzle
					51: '🌦️', 53: '🌦️', 55: '🌦️',
					// Freezing drizzle
					56: '🌧️', 57: '🌧️',
					// Rain
					61: '🌧️', 63: '🌧️', 65: '🌧️',
					// Freezing rain
					66: '🌨️', 67: '🌨️',
					// Rain showers
					80: '🌦️', 81: '🌧️', 82: '🌧️',
					// Thunderstorm
					95: '⛈️', 96: '⛈️', 99: '⛈️',
				};
	
				const newWeather = {
					temp,
					icon: iconMap[code] || '❓',
					timestamp: Date.now(),
				};
	
				setWeather(newWeather);
				localStorage.setItem('weather', JSON.stringify(newWeather));
			} catch (err) {
				console.error(err);
			}
		};
	
		// Only fetch if no cache OR older than 15 mins
		const shouldFetch =
			!cached || Date.now() - JSON.parse(cached).timestamp > 1000 * 60 * 15;
	
		if (shouldFetch) fetchWeather();
	
		const interval = setInterval(fetchWeather, 1000 * 60 * 15);
		return () => clearInterval(interval);
	}, []);

	return (
		<header className='flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4'>
			<div className='flex w-full items-center justify-between'>
				<div className='flex flex-row items-center gap-2'>
					<SidebarTrigger className='-ml-1' />
					<Breadcrumbs breadcrumbs={breadcrumbs} />
					<AppearanceToggleButton/>
				</div>
				<div className='absolute left-1/2 -translate-x-1/2 items-center justify-center text-center text-sm'>
					<p>{greeting}!</p>
					<div className='flex gap-2'>
					<p>{formattedTime}</p>
					{weather && (
						<p>
							{weather.icon} {weather.temp}°C
						</p>
					)}
					</div>
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
