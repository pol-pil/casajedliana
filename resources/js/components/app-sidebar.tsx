import { Link, usePage } from '@inertiajs/react';
import { Banknote, BarChart3, BedDouble, BookOpen, CalendarRange, ChartPie, ChevronDown, Columns3Cog, FileSliders, Folder, History, Hotel, LayoutDashboard, LayoutGrid } from 'lucide-react';
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
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible'
import { useState } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: "/dashboard",
        icon: Hotel,
    },
    {
        title: 'Bookings',
        href: '/bookings',
        icon: CalendarRange,
    },
    {
        title: 'Rooms',
        href: '/rooms',
        icon: BedDouble,
    },
    {
        title: 'Configurations',
        href: '/rates',
        icon: Columns3Cog,
    },
    {
        title: 'Reports & Analytics',
        href: '/reports',
        icon: ChartPie,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {

    const { url } = usePage()

    const isReportsActive =
        url.startsWith('/reports')

    const [open, setOpen] = useState(isReportsActive)


    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                 {/* ==============================
                   REPORTS COLLAPSIBLE MENU
                ============================== */}
                <SidebarMenu>
                    <SidebarMenuItem className='mx-2 -mt-1'>

                        <Collapsible open={open} onOpenChange={setOpen}>

                            {/* Parent */}
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Reports
                                    <ChevronDown
                                        className={`ml-auto h-4 w-4 transition-transform ${
                                            open ? 'rotate-180' : ''
                                        }`}
                                    />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            {/* Children */}
                            <CollapsibleContent className="ml-6 mt-1 space-y-1">

                                <SidebarMenuButton asChild isActive={url === '/reports/charts'}>
                                    <Link href="/reports/charts">
                                        <ChartPie className="mr-2 h-4 w-4" />
                                        Charts
                                    </Link>
                                </SidebarMenuButton>

                                <SidebarMenuButton asChild isActive={url === '/reports/history'}>
                                    <Link href="/reports/history">
                                        <History className="mr-2 h-4 w-4" />
                                        History
                                    </Link>
                                </SidebarMenuButton>

                            </CollapsibleContent>

                        </Collapsible>

                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
