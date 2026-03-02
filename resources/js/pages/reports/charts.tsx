import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import { useState } from 'react'

/* ==============================
   SHADCN COMPONENTS
============================== */
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

/* ==============================
   RECHARTS
============================== */
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts'

/* ==============================
   ICONS
============================== */
import {
    Wallet,
    CreditCard,
    AlertCircle,
    Banknote,
    TrendingUp,
    BarChart3,
    DollarSign,
    Hotel,
} from 'lucide-react'

/* ==============================
   BREADCRUMBS
============================== */
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports/charts' },
    { title: 'Charts & Analytics', href: '/reports/charts' },
]

/* ==============================
   MOCK DATA
============================== */
const monthlyData = [
    { label: 'Jan', revenue: 12000 },
    { label: 'Feb', revenue: 15000 },
    { label: 'Mar', revenue: 18000 },
    { label: 'Apr', revenue: 14000 },
    { label: 'May', revenue: 22000 },
    { label: 'Jun', revenue: 26000 },
]

const yearlyData = [
    { label: '2020', revenue: 180000 },
    { label: '2021', revenue: 210000 },
    { label: '2022', revenue: 260000 },
    { label: '2023', revenue: 300000 },
    { label: '2024', revenue: 340000 },
]

/* ==============================
   ICON STYLES (BADGE STYLE)
============================== */
const iconStyles = {
    revenue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    payment: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    balance: 'bg-red-500/10 text-red-600 dark:text-red-400',
    cash: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    adr: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    revpar: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    total: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    occupancy: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
}

export default function Charts() {

    const [view, setView] = useState<'monthly' | 'yearly'>('monthly')

    const chartData = view === 'monthly' ? monthlyData : yearlyData

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Charts & Analytics" />

            <div className="p-6 space-y-8">

                {/* =========================
                   HEADER + TABS
                ========================== */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Reports & Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Financial overview and performance metrics
                        </p>
                    </div>

                    <Tabs
                        value={view}
                        onValueChange={(value) =>
                            setView(value as 'monthly' | 'yearly')
                        }
                    >
                        <TabsList>
                            <TabsTrigger value="monthly">
                                Monthly
                            </TabsTrigger>
                            <TabsTrigger value="yearly">
                                Yearly
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* =========================
                   TOP KPI CARDS
                ========================== */}
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                    {/* Today Revenue */}
                    <Card className="rounded-xl border bg-card hover:shadow-md transition">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconStyles.revenue}`}>
                                    <Wallet className="h-3.5 w-3.5" />
                                </div>
                                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Today Revenue
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {view === 'monthly' ? '₱18,500' : '₱320,000'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Payments */}
                    <Card className="rounded-xl border bg-card hover:shadow-md transition">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconStyles.payment}`}>
                                    <CreditCard className="h-3.5 w-3.5" />
                                </div>
                                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Payments Collected
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {view === 'monthly' ? '₱12,000' : '₱250,000'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Outstanding */}
                    <Card className="rounded-xl border bg-card hover:shadow-md transition">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconStyles.balance}`}>
                                    <AlertCircle className="h-3.5 w-3.5" />
                                </div>
                                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Outstanding Balance
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {view === 'monthly' ? '₱6,200' : '₱40,000'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Cash */}
                    <Card className="rounded-xl border bg-card hover:shadow-md transition">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconStyles.cash}`}>
                                    <Banknote className="h-3.5 w-3.5" />
                                </div>
                                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Cash On Hand
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {view === 'monthly' ? '₱25,400' : '₱410,000'}
                            </p>
                        </CardContent>
                    </Card>

                </div>

                {/* =========================
                   CHART + SIDE KPIs
                ========================== */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Chart */}
                    <Card className="lg:col-span-2 rounded-xl border bg-card">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                {view === 'monthly'
                                    ? 'Monthly Revenue Overview'
                                    : 'Yearly Revenue Overview'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[420px] pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Right KPI Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                        {/* ADR */}
                        <Card className="rounded-xl border bg-card">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconStyles.adr}`}>
                                        <TrendingUp className="h-3.5 w-3.5" />
                                    </div>
                                    <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Average Daily Rate
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">
                                    {view === 'monthly' ? '₱2,500' : '₱2,800'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* RevPAR */}
                        <Card className="rounded-xl border bg-card">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconStyles.revpar}`}>
                                        <BarChart3 className="h-3.5 w-3.5" />
                                    </div>
                                    <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                                        RevPAR
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">
                                    {view === 'monthly' ? '₱2,050' : '₱2,300'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Revenue */}
                        <Card className="rounded-xl border bg-card">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconStyles.total}`}>
                                        <DollarSign className="h-3.5 w-3.5" />
                                    </div>
                                    <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Revenue
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">
                                    {view === 'monthly' ? '₱107,000' : '₱1,200,000'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Occupancy */}
                        <Card className="rounded-xl border bg-card">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`h-6 w-6 rounded-md flex items-center justify-center ${iconStyles.occupancy}`}>
                                        <Hotel className="h-3.5 w-3.5" />
                                    </div>
                                    <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Occupancy Rate
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">
                                    {view === 'monthly' ? '82%' : '88%'}
                                </p>
                            </CardContent>
                        </Card>

                    </div>

                </div>

            </div>
        </AppLayout>
    )
}