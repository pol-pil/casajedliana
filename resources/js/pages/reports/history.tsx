import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import { useState, useMemo } from 'react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Printer } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports/history' },
    { title: 'History', href: '/reports/history' },
]

/* ================= MOCK DATA ================= */

const bookingMock = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    date: `2026-02-${(i + 1).toString().padStart(2, '0')}`,
    guest: `Guest ${i + 1}`,
    room: `${100 + i} - Deluxe`,
    payment: i % 2 === 0 ? 'Success' : 'Failed',
    action: i % 3 === 0 ? 'Checked Out' : 'Check-In',
}))

const paymentMock = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    date: `2026-01-${(i + 5).toString().padStart(2, '0')}`,
    guest: `Guest ${i + 1}`,
    charge: `₱${(15000 + i * 2000).toLocaleString()}`,
    status: i % 2 === 0 ? 'Success' : 'Failed',
}))

const tiers = ['Gold', 'Silver', 'Platinum', 'Bronze']

const guestMock = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    guestId: `G-${1000 + i}`,
    fullName: `Guest ${i + 1}`,
    contactNumber: `0917 000 ${1000 + i}`,
    email: `guest${i + 1}@email.com`,
    loyaltyTier: tiers[i % 4],
    date: `2026-02-${(i + 3).toString().padStart(2, '0')}`,
}))

const eventMock = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    eventVenue: i % 2 === 0 ? 'Grand Ballroom' : 'Sky Lounge',
    purposeOfStay:
        i % 3 === 0
            ? 'Wedding Reception'
            : i % 3 === 1
            ? 'Corporate Meeting'
            : 'Birthday Celebration',
    guestName: `Guest ${i + 1}`,
    date: `2026-03-${(i + 1).toString().padStart(2, '0')}`,
}))

/* ================= COMPONENT ================= */

export default function History() {

    const rowsPerPage = 5
    const [searchEvent, setSearchEvent] = useState('')
    const [eventPage, setEventPage] = useState(1)

    const [searchBooking, setSearchBooking] = useState('')
    const [searchPayment, setSearchPayment] = useState('')
    const [searchGuest, setSearchGuest] = useState('')

    const [bookingPage, setBookingPage] = useState(1)
    const [paymentPage, setPaymentPage] = useState(1)
    const [guestPage, setGuestPage] = useState(1)

    const paginate = (data: any[], page: number) => {
        const start = (page - 1) * rowsPerPage
        return data.slice(start, start + rowsPerPage)
    }

    const filterData = (data: any[], search: string, key: string) =>
        data.filter(item =>
            item[key].toLowerCase().includes(search.toLowerCase())
        )

        const filteredEvents = useMemo(
    () => filterData(eventMock, searchEvent, 'guestName'),
    [searchEvent]
)

    const filteredBookings = useMemo(
        () => filterData(bookingMock, searchBooking, 'guest'),
        [searchBooking]
    )

    const filteredPayments = useMemo(
        () => filterData(paymentMock, searchPayment, 'guest'),
        [searchPayment]
    )

    const filteredGuests = useMemo(
        () => filterData(guestMock, searchGuest, 'fullName'),
        [searchGuest]
    )

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Gold':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300'
            case 'Silver':
                return 'bg-gray-100 text-gray-700 border-gray-300'
            case 'Platinum':
                return 'bg-indigo-100 text-indigo-700 border-indigo-300'
            case 'Bronze':
                return 'bg-orange-100 text-orange-700 border-orange-300'
            default:
                return 'bg-muted'
        }
    }

    const renderPagination = (
        page: number,
        setPage: any,
        totalItems: number
    ) => {
        const totalPages = Math.ceil(totalItems / rowsPerPage)

        return (
            <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        )
    }

    const TableWrapper = ({ children }: any) => (
        <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
                {children}
            </table>
        </div>
    )

    const TableHead = ({ headers }: any) => (
        <thead className="bg-muted/40 border-b">
            <tr>
                {headers.map((h: string) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                        {h}
                    </th>
                ))}
            </tr>
        </thead>
    )

    const Td = ({ children }: any) => (
        <td className="px-4 py-3">{children}</td>
    )

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports History" />

            <div className="p-6 space-y-8">

                {/* BOOKINGS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="Search by guest name..."
                            value={searchBooking}
                            onChange={(e) => {
                                setSearchBooking(e.target.value)
                                setBookingPage(1)
                            }}
                            className="w-64 mb-4"
                        />

                        <TableWrapper>
                            <TableHead headers={['Date', 'Guest', 'Room', 'Payment', 'Action']} />
                            <tbody>
                                {paginate(filteredBookings, bookingPage).map(b => (
                                    <tr key={b.id} className="border-b">
                                        <Td>{b.date}</Td>
                                        <Td>{b.guest}</Td>
                                        <Td>{b.room}</Td>
                                        <Td>
                                            <Badge variant={b.payment === 'Success' ? 'default' : 'destructive'}>
                                                {b.payment}
                                            </Badge>
                                        </Td>
                                        <Td>{b.action}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </TableWrapper>

                        {renderPagination(bookingPage, setBookingPage, filteredBookings.length)}
                    </CardContent>
                </Card>

                {/* PAYMENTS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payments History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="Search by guest name..."
                            value={searchPayment}
                            onChange={(e) => {
                                setSearchPayment(e.target.value)
                                setPaymentPage(1)
                            }}
                            className="w-64 mb-4"
                        />

                        <TableWrapper>
                            <TableHead headers={['Date', 'Guest', 'Charge', 'Status', 'Actions']} />
                            <tbody>
                                {paginate(filteredPayments, paymentPage).map(p => (
                                    <tr key={p.id} className="border-b">
                                        <Td>{p.date}</Td>
                                        <Td>{p.guest}</Td>
                                        <Td>{p.charge}</Td>
                                        <Td>
                                            <Badge variant={p.status === 'Success' ? 'default' : 'destructive'}>
                                                {p.status}
                                            </Badge>
                                        </Td>
                                        <Td className="flex gap-2">
                                            <Button size="icon" variant="outline">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="outline">
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </TableWrapper>

                        {renderPagination(paymentPage, setPaymentPage, filteredPayments.length)}
                    </CardContent>
                </Card>

                {/* GUESTS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Guest History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="Search by guest name..."
                            value={searchGuest}
                            onChange={(e) => {
                                setSearchGuest(e.target.value)
                                setGuestPage(1)
                            }}
                            className="w-64 mb-4"
                        />

                        <TableWrapper>
                            <TableHead headers={['Guest ID', 'Full Name', 'Contact', 'Email', 'Loyalty Tier', 'Date']} />
                            <tbody>
                                {paginate(filteredGuests, guestPage).map(g => (
                                    <tr key={g.id} className="border-b">
                                        <Td>{g.guestId}</Td>
                                        <Td>{g.fullName}</Td>
                                        <Td>{g.contactNumber}</Td>
                                        <Td>{g.email}</Td>
                                        <Td>
                                            <Badge className={getTierColor(g.loyaltyTier)} variant="outline">
                                                {g.loyaltyTier}
                                            </Badge>
                                        </Td>
                                        <Td>{g.date}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </TableWrapper>

                        {renderPagination(guestPage, setGuestPage, filteredGuests.length)}
                    </CardContent>
                </Card>

                {/* EVENTS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Event History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                placeholder="Search by guest name..."
                                value={searchEvent}
                                onChange={(e) => {
                                    setSearchEvent(e.target.value)
                                    setEventPage(1)
                                }}
                                className="w-64 mb-4"
                            />

                            <TableWrapper>
                                <TableHead
                                    headers={[
                                        'Event Venue',
                                        'Purpose of Stay',
                                        'Guest Name',
                                        'Date',
                                    ]}
                                />
                                <tbody>
                                    {paginate(filteredEvents, eventPage).map((e) => (
                                        <tr key={e.id} className="border-b">
                                            <Td>{e.eventVenue}</Td>
                                            <Td>{e.purposeOfStay}</Td>
                                            <Td>{e.guestName}</Td>
                                            <Td>{e.date}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </TableWrapper>

                            {renderPagination(eventPage, setEventPage, filteredEvents.length)}
                        </CardContent>
                    </Card>

            </div>
        </AppLayout>
    )
}