'use client';

import * as React from 'react';
import { Pie, PieChart, Sector, Label } from 'recharts';
import { type PieSectorDataItem } from 'recharts/types/polar/Pie';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type Discount = {
	id: number;
	name: string;
	value: number;
	totalDiscount: number;
};

export function DiscountChart({ discounts }: { discounts: Discount[] }) {
	const id = 'discount-pie';

	const chartData = React.useMemo(
		() =>
			discounts.map((discount, index) => ({
				name: discount.name,
				total: discount.totalDiscount,
				value: discount.value,
				fill: `var(--chart-${(index % 10) + 1})`,
			})),
		[discounts],
	);

	const chartConfig: ChartConfig = {
		total: { label: 'Total Discount' },
		...Object.fromEntries(
			chartData.map((item) => [
				item.name.toLowerCase().replace(/\s+/g, '_'),
				{
					label: item.name,
					color: item.fill,
				},
			]),
		),
	};

	const total = chartData.reduce((sum, d) => sum + d.total, 0);

	const [active, setActive] = React.useState(chartData[0]?.name || '');

	React.useEffect(() => {
		if (!chartData.length) {
			setActive('');
			return;
		}

		if (!chartData.some((item) => item.name === active)) {
			setActive(chartData[0].name);
		}
	}, [active, chartData]);

	const activeIndex = React.useMemo(() => {
		const index = chartData.findIndex((item) => item.name === active);

		return index >= 0 ? index : 0;
	}, [active, chartData]);

	const discountNames = React.useMemo(() => chartData.map((d) => d.name), [chartData]);

	if (!discounts.length || total <= 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Total Discount</CardTitle>
					<CardDescription>No discount data available for the selected dates</CardDescription>
				</CardHeader>
				<CardContent className='flex h-[300px] items-center justify-center'>
					<p className='text-muted-foreground'>Select a different date range to view discount usage</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card data-chart={id}>
			<ChartStyle id={id} config={chartConfig} />

			<CardHeader className='flex-row justify-between'>
				<div className='grid gap-1'>
					<div className='flex flex-row justify-between'>
					<CardTitle>Total Discount</CardTitle>
					<CardTitle>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</CardTitle>
					</div>
					<CardDescription>Discount value applied per rate</CardDescription>
				</div>

					<Select value={active} onValueChange={setActive}>
						<SelectTrigger className='ml-auto h-7 w-[170px] rounded-lg pl-2.5' aria-label='Select discount'>
							<SelectValue placeholder='Select discount' />
						</SelectTrigger>

						<SelectContent align='end' className='rounded-xl'>
							{discountNames.map((name) => {
								const item = chartData.find((d) => d.name === name);

								return (
									<SelectItem key={name} value={name} className='rounded-lg [&_span]:flex'>
										<div className='flex items-center gap-2 text-xs'>
											<span className='flex h-3 w-3 shrink-0 rounded-xs' style={{ backgroundColor: item?.fill }} />
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
							dataKey='total'
							nameKey='name'
							innerRadius={60}
							strokeWidth={5}
							activeIndex={activeIndex}
							onClick={(_, index) => {
								const clicked = chartData[index];
								if (clicked) setActive(clicked.name);
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

										const percentage = ((activeData.total / total) * 100).toFixed(1);

										return (
											<text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) - 8}
													className='fill-foreground text-lg font-bold'
												>
													₱{activeData.total.toLocaleString()}
												</tspan>
												<tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className='fill-muted-foreground'>
													Discount Used
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
		</Card>
	);
}
