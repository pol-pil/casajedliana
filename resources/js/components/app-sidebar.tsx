import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BedDouble,
    CalendarRange,
    ChartPie,
    ChevronDown,
    Columns3Cog,
    History,
    Hotel,
    ShieldUser,
    UserCog,
    Settings,
} from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

import { useState, useEffect } from 'react';

export function AppSidebar() {
    const { url, props } = usePage();
    const user = (props.auth as any)?.user;
    const isAdmin = user?.role === 'admin';

    const isReportsActive = url.startsWith('/reports');
    const isAdminActive = url.startsWith('/admin') || url.startsWith('/rooms');

    const [openReports, setOpenReports] = useState(isReportsActive);
    const [openAdmin, setOpenAdmin] = useState(isAdminActive);

    useEffect(() => {
        if (isReportsActive) setOpenReports(true);
    }, [url]);

    useEffect(() => {
        if (isAdminActive) setOpenAdmin(true);
    }, [url]);

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: Hotel },
        { title: 'Bookings', href: '/bookings', icon: CalendarRange },
        { title: 'Configurations', href: '/rates', icon: Columns3Cog },
    ];

    const adminNavItems = [
        { title: 'Overview', href: '/admin', icon: ShieldUser },
        { title: 'Rooms', href: '/rooms', icon: BedDouble },
        { title: 'Users', href: '/admin/users', icon: UserCog },
        { title: 'Hotel Info', href: '/admin/hotel-info', icon: Settings },
    ];

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible='icon' variant='inset'>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size='lg' asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                <SidebarMenu>
                    <SidebarMenuItem className='mx-2 -mt-1'>
                        <Collapsible open={openReports} onOpenChange={setOpenReports}>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton isActive={isReportsActive}>
                                    <BarChart3/>
                                    Reports
                                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openReports ? 'rotate-180' : ''}`} />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent className='mt-1 ml-6 space-y-1'>
                                <SidebarMenuButton asChild isActive={url.startsWith('/reports/charts')}>
                                    <Link href='/reports/charts'>
                                        <ChartPie className='mr-2 h-4 w-4' />
                                        Charts
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuButton asChild isActive={url.startsWith('/reports/history')}>
                                    <Link href='/reports/history'>
                                        <History className='mr-2 h-4 w-4' />
                                        History
                                    </Link>
                                </SidebarMenuButton>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarMenuItem>
                </SidebarMenu>

                {isAdmin && (
                    <SidebarMenu>
                        <SidebarMenuItem className='mx-2'>
                            <Collapsible open={openAdmin} onOpenChange={setOpenAdmin}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton isActive={isAdminActive}>
                                        <ShieldUser/>
                                        Admin
                                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openAdmin ? 'rotate-180' : ''}`} />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent className='mt-1 ml-6 space-y-1'>
                                    {adminNavItems.map((item) => (
                                        <SidebarMenuButton key={item.href} asChild isActive={url === item.href}>
                                            <Link href={item.href}>
                                                <item.icon className='mr-2 h-4 w-4' />
                                                {item.title}
                                            </Link>
                                        </SidebarMenuButton>
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className='mt-auto' />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}