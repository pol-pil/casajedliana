import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Building2, Clock, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hotel Info', href: '/admin/hotel-info' },
];

export default function HotelInfo() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hotel Info" />

            <div className="p-6 space-y-6 max-w-5xl">

                {/* ==============================
                   HOTEL DETAILS
                ============================== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Hotel Details
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage property information and contact details
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div>
                            <Label>Hotel Name</Label>
                            <Input />
                        </div>
                        <div>
                            <Label>Hotel Email</Label>
                            <Input />
                        </div>
                        <div>
                            <Label>Contact Number</Label>
                            <Input />
                        </div>
                        <div>
                            <Label>Hotel Address</Label>
                            <Input />
                        </div>
                    </CardContent>
                </Card>

                {/* ==============================
                   CHECK-IN / CHECK-OUT
                ============================== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Check-In / Check-Out
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Configure arrival and departure times
                        </p>
                    </CardHeader>

                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Check-in Time</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2pm">2:00 PM</SelectItem>
                                    <SelectItem value="3pm">3:00 PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Check-out Time</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="11am">11:00 AM</SelectItem>
                                    <SelectItem value="12pm">12:00 PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* ==============================
                   LOCATION
                ============================== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Location & Currency
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Set timezone and currency preferences
                        </p>
                    </CardHeader>

                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>Currency</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="php">PHP</SelectItem>
                                    <SelectItem value="usd">USD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Timezone</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gmt8">GMT+8</SelectItem>
                                    <SelectItem value="gmt0">GMT+0</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* ==============================
                   BACKUP & RESTORE (MERGED)
                ============================== */}
                <Card>
                    <CardHeader>
                        <CardTitle>Backup & Restore</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage system backups and restore data when needed
                        </p>
                    </CardHeader>

                    <CardContent className="grid md:grid-cols-2 gap-6">

                        {/* BACKUP */}
                        <div className="flex flex-col items-center gap-4 text-center border rounded-lg p-6">
                            <Download className="w-10 h-10 text-blue-500" />
                            <h3 className="font-semibold">Backup Data</h3>

                            <Button className="w-full">
                                Download Backup
                            </Button>
                        </div>

                        {/* RESTORE */}
                        <div className="flex flex-col items-center gap-4 text-center border rounded-lg p-6">
                            <Upload className="w-10 h-10 text-blue-500" />
                            <h3 className="font-semibold">Restore Data</h3>

                            <Input type="file" className="w-full" />

                            <Button className="w-full" variant="outline">
                                Upload & Restore
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* ==============================
                   ACTIONS
                ============================== */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-green-500 hover:bg-green-600">
                        Save Changes
                    </Button>
                </div>

            </div>
        </AppLayout>
    );
}