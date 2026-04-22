import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';

import { Wallet, CreditCard, AlertCircle, Banknote, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Reports', href: '/reports/charts' },
	{ title: 'Charts', href: '/reports/charts' },
];

type ChartData = {
	label: string;
	revenue: number;
};

type Distribution = {
	name: string;
	value: number;
};

type PageProps = {
	monthlyData: ChartData[];
	yearlyData: ChartData[];
	clientDistribution: Distribution[];
	kpis: {
		revenue: number;
		expected: number;
		balance: number;
		cash: number;
		adr: number;
		revpar: number;
		occupancy: number;
	};
};

export default function Charts() {
	const { monthlyData, yearlyData, kpis, clientDistribution } = usePage<PageProps>().props;

	const [view, setView] = useState<'monthly' | 'yearly'>('monthly');

	const chartData = useMemo(() => {
		return view === 'monthly' ? monthlyData : yearlyData;
	}, [view, monthlyData, yearlyData]);

	/*
  |--------------------------------------------------------------------------
  | 🎨 Colors
  |--------------------------------------------------------------------------
  */
	const { distributionPercent, topDistribution } = useMemo(() => {
		const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

		const distribution = clientDistribution.map((item, index) => ({
			...item,
			color: colors[index % colors.length],
		}));

		const total = distribution.reduce((sum, item) => sum + item.value, 0);

		const percent = distribution
			.map((item) => ({
				...item,
				percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
				count: item.value, // 👈 keep original
			}))
			.sort((a, b) => b.value - a.value);

		return {
			distributionPercent: percent,
			topDistribution: percent.slice(0, 5),
		};
	}, [clientDistribution]);

	const getTrend = (value: number) => {
		if (value > 0) return 'up';
		if (value < 0) return 'down';
		return 'neutral';
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title='Charts & Analytics' />

			<div className='space-y-8 p-6'>
				{/* HEADER */}
				<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
					<div>
						<h1 className='text-3xl font-semibold'>Reports & Analytics</h1>
						<p className='text-sm text-muted-foreground'>Financial overview and performance metrics</p>
					</div>

					<Tabs value={view} onValueChange={(v) => setView(v as any)}>
						<TabsList>
							<TabsTrigger value='monthly'>Monthly</TabsTrigger>
							<TabsTrigger value='yearly'>Yearly</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				{/* KPI CARDS */}
				<TooltipProvider>
					<div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
						<UiTooltip>
							<TooltipTrigger asChild>
								<Card className='cursor-pointer'>
									<CardHeader className='flex items-center gap-2 pb-2'>
										<Wallet className='h-4 w-4 text-blue-500' />
										<CardTitle className='text-xs text-muted-foreground uppercase'>Revenue (Collected)</CardTitle>
									</CardHeader>
									<CardContent>
										<p className='text-xl font-bold sm:text-2xl'>₱ {kpis.revenue.toLocaleString()}</p>
									</CardContent>
								</Card>
							</TooltipTrigger>

							<TooltipContent className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
								<p className='text-sm text-muted-foreground'>Total actual cash received from payments.</p>
							</TooltipContent>
						</UiTooltip>

						<UiTooltip>
							<TooltipTrigger asChild>
								<Card className='cursor-pointer'>
									<CardHeader className='flex items-center gap-2 pb-2'>
										<CreditCard className='h-4 w-4 text-green-500' />
										<CardTitle className='text-xs text-muted-foreground uppercase'>Expected Revenue</CardTitle>
									</CardHeader>

									<CardContent>
										<p className='text-xl font-bold sm:text-2xl'>₱ {kpis.expected.toLocaleString()}</p>
									</CardContent>
								</Card>
							</TooltipTrigger>

							<TooltipContent className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
								<p className='text-sm text-muted-foreground'>Total value of all bookings including charges.</p>
							</TooltipContent>
						</UiTooltip>

						<UiTooltip>
							<TooltipTrigger asChild>
								<Card className='cursor-pointer'>
									<CardHeader className='flex items-center gap-2 pb-2'>
										<AlertCircle className='h-4 w-4 text-red-500' />
										<CardTitle className='text-xs text-muted-foreground uppercase'>Outstanding Balance</CardTitle>
									</CardHeader>
									<CardContent>
										<p className='text-xl font-bold sm:text-2xl'>₱ {kpis.balance.toLocaleString()}</p>
									</CardContent>
								</Card>
							</TooltipTrigger>

							<TooltipContent className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
								<p className='text-sm text-muted-foreground'>Unpaid amount remaining from all bookings.</p>
							</TooltipContent>
						</UiTooltip>

						<UiTooltip>
							<TooltipTrigger asChild>
								<Card className='cursor-pointer'>
									<CardHeader className='flex items-center gap-2 pb-2'>
										<Banknote className='h-4 w-4 text-yellow-500' />
										<CardTitle className='text-xs text-muted-foreground uppercase'>Cash Collected</CardTitle>
									</CardHeader>
									<CardContent>
										<p className='text-xl font-bold sm:text-2xl'>₱ {kpis.cash.toLocaleString()}</p>
									</CardContent>
								</Card>
							</TooltipTrigger>

							<TooltipContent className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
								<p className='text-sm text-muted-foreground'>Payments received specifically via cash method.</p>
							</TooltipContent>
						</UiTooltip>
					</div>
				</TooltipProvider>

				{/* MAIN CHART */}
				<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
					<Card className='lg:col-span-2'>
						<CardHeader>
							<CardTitle>{view === 'monthly' ? 'Monthly Revenue Overview' : 'Yearly Revenue Overview'}</CardTitle>
						</CardHeader>

						<CardContent>
							<div className='h-[400px] w-full'>
								{chartData.length === 0 ? (
									<div className='flex h-full items-center justify-center text-muted-foreground'>No data available</div>
								) : (
									<ResponsiveContainer>
										<LineChart data={chartData}>
											<CartesianGrid strokeDasharray='3 3' vertical={false} />
											<XAxis dataKey='label' />

											{/* ✅ FIX: force proper scaling */}
											<YAxis domain={[0, 'auto']} />

											{/* ✅ FIX: better tooltip (we’ll improve more below) */}
											<Tooltip
												content={({ active, payload, label }) => {
													if (active && payload && payload.length) {
														return (
															<div className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
																<p className='text-sm font-medium'>{label}</p>
																<p className='text-sm text-blue-500'>
																	₱ {Number(payload?.[0]?.value || 0).toLocaleString()}
																</p>
															</div>
														);
													}
													return null;
												}}
											/>

											{/* ✅ FIX: make line visible */}
											<Line
												type='monotone'
												dataKey='revenue'
												stroke='#3b82f6'
												strokeWidth={3}
												dot={{ r: 4 }} // 👈 IMPORTANT
												activeDot={{ r: 6 }} // 👈 hover effect
											/>
										</LineChart>
									</ResponsiveContainer>
								)}
							</div>
						</CardContent>
					</Card>

					{/* SIDE KPIs */}
					<TooltipProvider>
						<div className='space-y-4'>
							<Card>
								<CardHeader>
									<CardTitle className='text-xs text-muted-foreground'>ADR (Avg Daily Rate)</CardTitle>
								</CardHeader>
								<CardContent className='flex items-center justify-between'>
									<UiTooltip>
										<TooltipTrigger asChild>
											<span className='cursor-pointer'>₱ {kpis.adr.toLocaleString()}</span>
										</TooltipTrigger>
										<TooltipContent className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
											<p className='text-sm text-muted-foreground'>
												Average Daily Rate — average revenue earned per occupied room.
											</p>
										</TooltipContent>
									</UiTooltip>
									{getTrend(kpis.adr) === 'up' && <ArrowUpRight className='h-4 w-4 text-green-500' />}
									{getTrend(kpis.adr) === 'down' && <ArrowDownRight className='h-4 w-4 text-red-500' />}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='text-xs text-muted-foreground'>RevPAR (Revenue / Room)</CardTitle>
								</CardHeader>
								<CardContent className='flex items-center justify-between'>
									<UiTooltip>
										<TooltipTrigger asChild>
											<span className='cursor-pointer'>₱ {kpis.revpar.toLocaleString()}</span>
										</TooltipTrigger>

										<TooltipContent className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
											<p className='text-sm text-muted-foreground'>
												Revenue Per Available Room — calculated as ADR × occupancy rate.
											</p>
										</TooltipContent>
									</UiTooltip>
									{getTrend(kpis.revpar) === 'up' && <ArrowUpRight className='h-4 w-4 text-green-500' />}
									{getTrend(kpis.revpar) === 'down' && <ArrowDownRight className='h-4 w-4 text-red-500' />}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='text-xs text-muted-foreground'>Occupancy (Room Usage %)</CardTitle>
								</CardHeader>
								<CardContent className='flex items-center justify-between'>
									<UiTooltip>
										<TooltipTrigger asChild>
											<span className='cursor-pointer'>{kpis.occupancy}%</span>
										</TooltipTrigger>

										<TooltipContent className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
											<p className='text-sm text-muted-foreground'>
												Occupancy Rate — percentage of available rooms that are currently occupied.
											</p>
										</TooltipContent>
									</UiTooltip>
									{getTrend(kpis.occupancy) === 'up' && <ArrowUpRight className='h-4 w-4 text-green-500' />}
									{getTrend(kpis.occupancy) === 'down' && <ArrowDownRight className='h-4 w-4 text-red-500' />}
								</CardContent>
							</Card>
						</div>
					</TooltipProvider>
				</div>

				{/* DISTRIBUTION */}
				<Card>
					<CardHeader>
						<CardTitle>Discount Distribution</CardTitle>
					</CardHeader>

					<CardContent className='grid grid-cols-1 gap-6 border-t px-4 py-4 lg:grid-cols-[1.5fr_1fr]'>
						<div className='h-[320px] w-full'>
							{topDistribution.length === 0 ? (
								<div className='flex h-full items-center justify-center text-muted-foreground'>No distribution data</div>
							) : (
								<ResponsiveContainer>
									<BarChart
										layout='vertical'
										data={topDistribution}
										margin={{ right: 10 }}
										barSize={50}
										barCategoryGap='10%'
									>
										<CartesianGrid strokeDasharray='3 3' horizontal={false} />
										<XAxis type='number' tickFormatter={(v) => `${v}%`} />
										<YAxis type='category' dataKey='name' width={180} tick={{ fontSize: 17 }} />
										<Tooltip
											content={({ active, payload }) => {
												if (active && payload && payload.length) {
													const item = payload[0]?.payload;

													return (
														<div className='rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-neutral-900'>
															{/* ✅ Correct title */}
															<p className='text-xs text-muted-foreground'>{item?.name}</p>

															{/* ✅ Show actual count (not %) */}
															<p className='text-sm font-semibold text-blue-500'>{item?.count} bookings</p>
														</div>
													);
												}
												return null;
											}}
										/>

										<Bar dataKey='percentage' radius={[8, 8, 8, 8]}>
											{topDistribution.map((item, i) => (
												<Cell key={i} fill={item.color} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							)}
						</div>

						<div className='space-y-2 text-sm'>
							{distributionPercent.map((item) => (
								<div key={item.name} className='flex items-center justify-between'>
									<span className='max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap'>{item.name}</span>
									<span style={{ color: item.color }}>{item.percentage}%</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
