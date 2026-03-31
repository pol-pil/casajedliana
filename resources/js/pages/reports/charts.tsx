import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { useState } from 'react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
    Cell,
} from 'recharts'

import {
    Wallet,
    CreditCard,
    AlertCircle,
    Banknote,
} from 'lucide-react'

type ChartData = {
    label: string
    revenue: number
}

type PageProps = {
    monthlyData: ChartData[]
    yearlyData: ChartData[]
    kpis: {
        revenue: number
        payments: number
        balance: number
        cash: number
        adr: number
        revpar: number
        occupancy: number
    }
}

export default function Charts() {
    const { monthlyData, yearlyData, kpis } = usePage<PageProps>().props

    const [view, setView] = useState<'monthly' | 'yearly'>('monthly')

    const chartData = view === 'monthly' ? monthlyData : yearlyData

    const distribution = [
        { name: 'Regular', value: 45, color: '#3b82f6' },
        { name: 'Corporate', value: 20, color: '#8b5cf6' },
        { name: 'Supplier Discount', value: 15, color: '#06b6d4' },
        { name: 'Government', value: 12, color: '#10b981' },
        { name: 'Employee', value: 8, color: '#f59e0b' },
    ]

    return (
        <AppLayout>
            <Head title="Charts & Analytics" />

            <div className="p-6 space-y-8">

                {/* HEADER */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
                        <p className="text-muted-foreground text-sm">
                            Financial overview and performance metrics
                        </p>
                    </div>

                    <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                        <TabsList>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                    <Card>
                        <CardHeader className="flex items-center gap-2 pb-2">
                            <Wallet className="text-blue-500 h-4 w-4" />
                            <CardTitle className="text-xs uppercase text-muted-foreground">
                                Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl sm:text-2xl font-bold">
                                ₱ {kpis.revenue.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex items-center gap-2 pb-2">
                            <CreditCard className="text-green-500 h-4 w-4" />
                            <CardTitle className="text-xs uppercase text-muted-foreground">
                                Payments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl sm:text-2xl font-bold">
                                ₱ {kpis.payments.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex items-center gap-2 pb-2">
                            <AlertCircle className="text-red-500 h-4 w-4" />
                            <CardTitle className="text-xs uppercase text-muted-foreground">
                                Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl sm:text-2xl font-bold">
                                ₱ {kpis.balance.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex items-center gap-2 pb-2">
                            <Banknote className="text-yellow-500 h-4 w-4" />
                            <CardTitle className="text-xs uppercase text-muted-foreground">
                                Cash
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl sm:text-2xl font-bold">
                                ₱ {kpis.cash.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                </div>

                {/* MAIN CHART + SIDE KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LINE CHART */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                {view === 'monthly'
                                    ? 'Monthly Revenue Overview'
                                    : 'Yearly Revenue Overview'}
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="h-[400px] w-full min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                                        <XAxis dataKey="label" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />

                                        <Tooltip />

                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SIDE KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xs text-muted-foreground">
                                    Average Daily Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-bold">
                                    ₱ {kpis.adr.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xs text-muted-foreground">
                                    RevPAR
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-bold">
                                    ₱ {kpis.revpar.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xs text-muted-foreground">
                                    Occupancy Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-bold">
                                    {kpis.occupancy}%
                                </p>
                            </CardContent>
                        </Card>

                    </div>

                </div>

                {/* CLIENT DISTRIBUTION */}
                <Card>
                    <CardHeader>
                        <CardTitle>Client Booking Distribution</CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 items-center px-6 py-6">

                        {/* CHART */}
                        <div className="h-[260px] w-full min-w-0 pr-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={distribution}
                                    margin={{ left: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis type="number" tickFormatter={(v) => `${v}%`} />

                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={160}
                                        tick={{ fontSize: 12 }}
                                    />

                                    <Tooltip formatter={(v) => `${v}%`} />

                                    <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                                        {distribution.map((item, i) => (
                                            <Cell key={i} fill={item.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* LEGEND */}
                        <div className="space-y-5 pt-2">
                            {distribution.map((item) => (
                                <div key={item.name} className="flex items-center justify-between py-1">

                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-3.5 h-3.5 rounded"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {item.name}
                                        </span>
                                    </div>

                                    <span
                                        className="text-sm font-semibold"
                                        style={{ color: item.color }}
                                    >
                                        {item.value}%
                                    </span>
                                </div>
                            ))}
                        </div>

                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    )
}