import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, BedDouble, Home, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin' },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="p-6 flex flex-col gap-6 w-full min-w-0">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-semibold">Hi, Admin</h1>
                    <p className="text-sm text-muted-foreground">
                        Welcome back to Casa Jedliana Admin!
                    </p>
                </div>

                {/* STATS */}
                <div className="grid gap-4 md:grid-cols-3 w-full min-w-0">
                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <h2 className="text-3xl font-bold">3</h2>
                                <p className="text-sm text-muted-foreground">Total Users</p>
                            </div>
                            <Users className="h-10 w-10 text-muted-foreground" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <h2 className="text-3xl font-bold">10</h2>
                                <p className="text-sm text-muted-foreground">Total Rooms</p>
                            </div>
                            <BedDouble className="h-10 w-10 text-muted-foreground" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <h2 className="text-3xl font-bold">4</h2>
                                <p className="text-sm text-muted-foreground">Total Events</p>
                            </div>
                            <Home className="h-10 w-10 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </div>

                {/* USER TABLE */}
                <div className="rounded-xl border overflow-hidden">
                    <div className="px-4 py-2 font-medium border-b">
                        User Management
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left px-4 py-3">ID</th>
                                    <th className="text-left px-4 py-3">Username</th>
                                    <th className="text-left px-4 py-3">Email</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {[
                                    { id: '#01', name: 'Admin', email: 'Admin@gmail' },
                                    { id: '#02', name: 'Front Desk Officer', email: 'Frontdeskoffice@gmail' },
                                    { id: '#03', name: 'Hotel Manager', email: 'Hotelmanager@gmail.com' },
                                ].map((user, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="px-4 py-3">{user.id}</td>
                                        <td className="px-4 py-3">{user.name}</td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-xl border p-4">
                    <h2 className="font-medium mb-4">Room Management</h2>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                        {[
                            { name: '101-102', type: 'Family Room' },
                            { name: '103-104', type: 'Family Room' },
                            { name: '105', type: 'Rest House' },
                            { name: '201', type: 'Suite Room' },
                            { name: '202', type: 'Suite Room' },
                            { name: '203', type: 'Standard Room' },
                            { name: '204', type: 'Standard Room' },
                            { name: '205', type: 'Standard Room' },
                            { name: '206', type: 'Standard Room' },
                            { name: '207', type: 'Quadro Room' },
                            { name: '208', type: 'Quadro Room' },
                            { name: 'JEDIDIA', type: 'Jedidia Hall' },
                            { name: 'EDIANE', type: 'Ediane Hall' },
                            { name: 'ELIANA', type: 'Eliana Hall' },
                            { name: 'GARDEN', type: 'Garden' },
                            { name: 'ROOF DECK', type: 'Roof Deck Venue' },
                            { name: 'KTV', type: 'KTV' },
                            { name: 'BILLIARDS AND GYM', type: 'Billiards and Gym' },
                        ].map((room, i) => (
                            <Card key={i} className="relative hover:shadow-md transition">
                                <CardContent className="p-4">

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 h-6 w-6"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                     
                                    <div className="flex flex-col gap-1">
                                        <span className="text-lg font-semibold">
                                            {room.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {room.type}
                                        </span>
                                    </div>

                                </CardContent>
                            </Card>
                        ))}

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}