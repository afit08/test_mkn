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
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, PackageSearch, ArrowRightLeft } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    // ✅ Use optional chaining and type assertion safely
    const page = usePage();
    const auth = (page.props as any).auth; // safe workaround
    const userRole = auth?.user?.role ?? ''; // default to empty string if undefined

    // Common menu items
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Product',
            href: '/products',
            icon: PackageSearch,
        },
        {
            title: 'Transaction',
            href: '/transactions',
            icon: ArrowRightLeft,
        },
    ];

    // Add "Users" menu only for admin
    if (userRole === 'admin') {
        mainNavItems.push({
            title: 'Users',
            href: '/users',
            icon: LayoutGrid, // replace with proper icon
        });
    }

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
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
