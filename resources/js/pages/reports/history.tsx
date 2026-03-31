import { Head, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    AlertCircle,
    EyeOff,
    MailIcon,
    PhoneIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports/history' },
    { title: 'History', href: '/reports/history' },
]

type Booking = {
    id: number
    created_at: string
    client?: {
        first_name: string
        last_name: string
        email?: string
        contact_number: string
    }
    room?: {
        room_number: string
        room_type: string
    }
    check_in: string
    check_out: string
    status: string
    total_amount: number
    payments?: any[]
    booking_charges?: any[]
}

type PageProps = {
    bookings: {
        data: Booking[]
        links: any[]
        current_page: number
        last_page: number
    }
    filters: {
        search?: string
    }
}

const statusConfig = {
    confirmed: {
        label: 'Confirmed',
        icon: CheckCircleIcon,
        color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
    },
    pencil: {
        label: 'Pencil',
        icon: ClockIcon,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
    },
    checked_in: {
        label: 'Checked In',
        icon: CheckCircleIcon,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    checked_out: {
        label: 'Checked Out',
        icon: CheckCircleIcon,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300',
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircleIcon,
        color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    },
    no_show: {
        label: 'No Show',
        icon: EyeOff,
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    },
}

const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
    const config = statusConfig[status] ?? {
        label: status,
        icon: AlertCircle,
        color: 'bg-gray-100 text-gray-800',
    }

    const Icon = config.icon

    return (
        <Badge className={cn('flex items-center gap-1', config.color)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    )
}

export default function History() {
    const { bookings, filters } = usePage<PageProps>().props
    const [search, setSearch] = useState(filters.search || '')

    // ✅ Debounced search
    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                '/reports/history',
                { search },
                {
                    preserveState: true,
                    replace: true,
                }
            )
        }, 300)

        return () => clearTimeout(delay)
    }, [search])

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })

    const formatTime = (date: string) =>
        new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History" />

            <div className="p-6">
                <div className="rounded-lg border">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Booking History</h2>
                    </div>

                    {/* ✅ Search (fixed) */}
                    <div className="flex justify-between p-4">
                        <Input
                            placeholder="Search guest..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64"
                        />
                    </div>

                    <div className="overflow-auto px-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Guest</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Check-in</TableHead>
                                    <TableHead>Check-out</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {bookings.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-6 text-center">
                                            No history records found
                                        </TableCell>
                                    </TableRow>
                                )}

                                {bookings.data.map((booking) => {
                                    const total =
                                        Number(booking.total_amount ?? 0) +
                                        (booking.booking_charges ?? []).reduce(
                                            (sum, c) => sum + Number(c.total ?? 0),
                                            0
                                        )

                                    const paid = (booking.payments ?? []).reduce(
                                        (sum, p) => sum + Number(p.amount ?? 0),
                                        0
                                    )

                                    return (
                                        <TableRow key={booking.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {booking.client?.first_name ?? '—'}{' '}
                                                        {booking.client?.last_name ?? ''}
                                                    </div>
                                                    {booking.client?.email && (
                                                        <div className="flex gap-1 text-sm text-muted-foreground">
                                                            <MailIcon className="h-3 w-3" />
                                                            {booking.client.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <PhoneIcon className="h-3 w-3" />
                                                    {booking.client?.contact_number ?? '—'}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {booking.room?.room_number ?? '—'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {booking.room?.room_type ?? ''}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {formatDate(booking.check_in)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatTime(booking.check_in)}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {formatDate(booking.check_out)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatTime(booking.check_out)}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <StatusBadge status={booking.status as any} />
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="font-medium">
                                                    ₱ {total.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Balance: ₱ {(total - paid).toFixed(2)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* ✅ Pagination (fixed) */}
                    {bookings.links && bookings.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-4">
                            <div className="text-sm text-muted-foreground">
                                Page {bookings.current_page} of {bookings.last_page}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const prev = bookings.links.find((l) =>
                                            l.label.includes('Previous')
                                        )
                                        if (prev?.url)
                                            router.get(prev.url, {}, { preserveState: true })
                                    }}
                                >
                                    Previous
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const next = bookings.links.find((l) =>
                                            l.label.includes('Next')
                                        )
                                        if (next?.url)
                                            router.get(next.url, {}, { preserveState: true })
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}