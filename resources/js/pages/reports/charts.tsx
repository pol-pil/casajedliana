import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';

import { Wallet, CreditCard, AlertCircle, Banknote, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
	clientDistribution: Distribution[]; // ✅ NEW
	kpis: {
		revenue: number;
		payments: number;
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

	const chartData = view === 'monthly' ? monthlyData : yearlyData;

	/*
    |--------------------------------------------------------------------------
    | 🎨 Dynamic Colors (auto assign)
    |--------------------------------------------------------------------------
    */
	const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

	const distribution = clientDistribution.map((item, index) => ({
		...item,
		color: colors[index % colors.length],
	}));

	/*
    |--------------------------------------------------------------------------
    | 📊 Convert to % (for chart display)
    |--------------------------------------------------------------------------
    */

	const total = distribution.reduce((sum, item) => sum + item.value, 0);

	const distributionPercent = distribution
		.map((item) => ({
			...item,
			value: total > 0 ? Math.round((item.value / total) * 100) : 0,
		}))
		.sort((a, b) => b.value - a.value);

	const topDistribution = distributionPercent.slice(0, 5);

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
				<div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
					<Card>
						<CardHeader className='flex items-center gap-2 pb-2'>
							<Wallet className='h-4 w-4 text-blue-500' />
							<CardTitle className='text-xs text-muted-foreground uppercase'>Revenue</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-xl font-bold sm:text-2xl'>₱ {kpis.revenue.toLocaleString()}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex items-center gap-2 pb-2'>
							<CreditCard className='h-4 w-4 text-green-500' />
							<CardTitle className='text-xs text-muted-foreground uppercase'>Payments</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-xl font-bold sm:text-2xl'>₱ {kpis.payments.toLocaleString()}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex items-center gap-2 pb-2'>
							<AlertCircle className='h-4 w-4 text-red-500' />
							<CardTitle className='text-xs text-muted-foreground uppercase'>Balance</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-xl font-bold sm:text-2xl'>₱ {kpis.balance.toLocaleString()}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex items-center gap-2 pb-2'>
							<Banknote className='h-4 w-4 text-yellow-500' />
							<CardTitle className='text-xs text-muted-foreground uppercase'>Cash</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-xl font-bold sm:text-2xl'>₱ {kpis.cash.toLocaleString()}</p>
						</CardContent>
					</Card>
				</div>

				{/* MAIN CHART */}
				<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
					<Card className='lg:col-span-2'>
						<CardHeader>
							<CardTitle>{view === 'monthly' ? 'Monthly Revenue Overview' : 'Yearly Revenue Overview'}</CardTitle>
						</CardHeader>

						<CardContent>
							<div className='h-[400px] w-full'>
								<ResponsiveContainer>
									<LineChart data={chartData}>
										<CartesianGrid strokeDasharray='3 3' vertical={false} />
										<XAxis dataKey='label' />
										<YAxis />
										<Tooltip />
										<Line type='monotone' dataKey='revenue' stroke='#3b82f6' strokeWidth={3} dot={false} />
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* SIDE KPIs */}
					<div className='space-y-4'>
						<Card>
							<CardHeader>
								<CardTitle className='text-xs text-muted-foreground'>ADR</CardTitle>
							</CardHeader>
							<CardContent className='flex items-center justify-between'>
								<span>₱ {kpis.adr.toLocaleString()}</span>

								{getTrend(kpis.adr) === 'up' && <ArrowUpRight className='h-4 w-4 text-green-500' />}
								{getTrend(kpis.adr) === 'down' && <ArrowDownRight className='h-4 w-4 text-red-500' />}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-xs text-muted-foreground'>RevPAR</CardTitle>
							</CardHeader>
							<CardContent className='flex items-center justify-between'>
								<span>₱ {kpis.revpar.toLocaleString()}</span>

								{getTrend(kpis.revpar) === 'up' && <ArrowUpRight className='h-4 w-4 text-green-500' />}
								{getTrend(kpis.revpar) === 'down' && <ArrowDownRight className='h-4 w-4 text-red-500' />}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-xs text-muted-foreground'>Occupancy</CardTitle>
							</CardHeader>
							<CardContent className='flex items-center justify-between'>
								<span>{kpis.occupancy}%</span>

								{getTrend(kpis.occupancy) === 'up' && <ArrowUpRight className='h-4 w-4 text-green-500' />}
								{getTrend(kpis.occupancy) === 'down' && <ArrowDownRight className='h-4 w-4 text-red-500' />}
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Discount DISTRIBUTION */}
				<Card>
					<CardHeader>
						<CardTitle>Discount Distribution</CardTitle>
					</CardHeader>

					<CardContent className='grid grid-cols-1 items-center gap-6 border-t px-4 py-4 lg:grid-cols-[1.5fr_1fr]'>
						<div className='h-[320px] w-full md:h-[380px]'>
							<ResponsiveContainer>
								<BarChart
									layout='vertical'
									data={topDistribution}
									margin={{right: 10}}
									barSize={50}
									barCategoryGap='10%'
								>
									<CartesianGrid strokeDasharray='3 3' horizontal={false} />

									<XAxis type='number' tickFormatter={(v) => `${v}%`} />

									<YAxis type='category' dataKey='name' width={180} tick={{ fontSize: 17 }} />

									<Tooltip formatter={(v: number) => `${v}%`} />

									<Bar dataKey='value' radius={[8, 8, 8, 8]}>
										{topDistribution.map((item, i) => (
											<Cell key={i} fill={item.color} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
						<div className='space-y-2 text-sm'>
							{distributionPercent.map((item) => (
								<div key={item.name} className='flex items-center justify-between'>
									<span className='max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap' title={item.name}>
										{item.name}
									</span>
									<span style={{ color: item.color }}>{item.value}%</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
