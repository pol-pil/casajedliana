'use client';

import * as React from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';
import { type PieSectorDataItem } from 'recharts/types/polar/Pie';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Rate = {
	id: number;
	name: string;
	value: number;
	type: 'fixed' | 'percentage';
	bookings_count?: number;
};

type RatesChartProps = {
	rates: Rate[];
	totalBookings?: number;
};

export function RatesChart({ rates, totalBookings = 0 }: RatesChartProps) {
	const id = 'pie-interactive';

	// Filter rates that have been used in bookings
	const usedRates = React.useMemo(() => rates.filter((rate) => (rate.bookings_count || 0) > 0), [rates]);

	// Create data for the chart
	const chartData = React.useMemo(
		() =>
			usedRates.map((rate, index) => {
				const colorIndex = (index % 10) + 1;

				return {
					name: rate.name,
					bookings: rate.bookings_count || 0,
					fill: `var(--chart-${colorIndex})`,
					value: rate.value,
					type: rate.type,
				};
			}),
		[usedRates],
	);

	// Generate chart config dynamically
	const chartConfig = React.useMemo(() => {
		const config: ChartConfig = {
			bookings: {
				label: 'Bookings',
			},
		};

		chartData.forEach((item) => {
			const key = item.name.toLowerCase().replace(/\s+/g, '_');
			config[key] = {
				label: item.name,
				color: item.fill,
			};
		});

		return config;
	}, [chartData]);

	const [activeRate, setActiveRate] = React.useState(chartData[0]?.name || '');

	React.useEffect(() => {
		if (!chartData.length) {
			setActiveRate('');
			return;
		}

		if (!chartData.some((item) => item.name === activeRate)) {
			setActiveRate(chartData[0].name);
		}
	}, [activeRate, chartData]);

	const activeIndex = React.useMemo(() => {
		const index = chartData.findIndex((item) => item.name === activeRate);

		return index >= 0 ? index : 0;
	}, [activeRate, chartData]);

	const rateNames = React.useMemo(() => chartData.map((item) => item.name), [chartData]);

	const totalBookingsCount = React.useMemo(() => chartData.reduce((acc, curr) => acc + curr.bookings, 0), [chartData]);

	// If no real data, show placeholder message
	if (!rates.length || !usedRates.length || totalBookings <= 0) {
		return (
			<Card className='flex flex-col'>
				<CardHeader>
					<CardTitle>Discount Distribution</CardTitle>
					<CardDescription>No booking data available yet</CardDescription>
				</CardHeader>
				<CardContent className='flex h-[300px] items-center justify-center'>
					<p className='text-muted-foreground'>Create bookings to see rates distribution</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card data-chart={id} className='flex flex-col'>
			<ChartStyle id={id} config={chartConfig} />
			<CardHeader className='flex-row justify-between'>
				<div className='grid gap-1'>
					<CardTitle>Discount Distribution</CardTitle>
					<CardDescription>Bookings by discount type</CardDescription>
				</div>
				<Select value={activeRate} onValueChange={setActiveRate}>
					<SelectTrigger className='ml-auto h-7 w-[170px] rounded-lg pl-2.5' aria-label='Select a rate'>
						<SelectValue placeholder='Select rate' />
					</SelectTrigger>
					<SelectContent align='end' className='rounded-xl'>
						{rateNames.map((name) => {
							const key = name.toLowerCase().replace(/\s+/g, '_');
							const config = chartConfig[key];

							if (!config) {
								return null;
							}

							return (
								<SelectItem key={name} value={name} className='rounded-lg [&_span]:flex'>
									<div className='flex items-center gap-2 text-xs'>
										<span
											className='flex h-3 w-3 shrink-0 rounded-xs'
											style={{
												backgroundColor: chartData.find((d) => d.name === name)?.fill,
											}}
										/>
										{name}
									</div>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent className='flex h-60 justify-center pb-0'>
				<ChartContainer id={id} config={chartConfig} className='mx-auto aspect-square w-full max-w-[300px]'>
					<PieChart>
						<ChartTooltip cursor={false} content={<ChartTooltipContent className='w-40' />} />
						<Pie
							data={chartData}
							dataKey='bookings'
							nameKey='name'
							innerRadius={60}
							strokeWidth={5}
							activeIndex={activeIndex}
							onClick={(_, index) => {
								const clicked = chartData[index];
								if (clicked) {
									setActiveRate(clicked.name);
								}
							}}
							activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
								<g>
									<Sector {...props} outerRadius={outerRadius + 10} />
									<Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
								</g>
							)}
						>
							<Label
								content={({ viewBox }) => {
									if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
										const activeData = chartData[activeIndex];
										if (!activeData) {
											return null;
										}

										const percentage = ((activeData.bookings / totalBookingsCount) * 100).toFixed(1);

										return (
											<text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
												<tspan x={viewBox.cx} y={(viewBox.cy || 0) - 10} className='fill-foreground text-3xl font-bold'>
													{activeData.bookings}
												</tspan>
												<tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className='fill-muted-foreground'>
													Bookings
												</tspan>
												<tspan x={viewBox.cx} y={(viewBox.cy || 0) + 30} className='fill-muted-foreground text-xs'>
													({percentage}%)
												</tspan>
											</text>
										);
									}
								}}
							/>
						</Pie>
					</PieChart>
				</ChartContainer>
			</CardContent>

			{/* Legend/Summary */}
			{/* <div className="grid grid-cols-2 gap-2 p-4 pt-0">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
            </div>
            <span className="font-medium">
              {item.bookings} ({((item.bookings / totalBookingsCount) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div> */}
		</Card>
	);
}
