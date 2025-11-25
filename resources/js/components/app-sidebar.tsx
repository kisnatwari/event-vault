import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { resolveUrl } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Building, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Clients',
        href: '/clients',
        icon: Building,
    },
    {
        title: 'Events',
        href: '/events',
        icon: Calendar,
    },
];

export function AppSidebar() {
    const page = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-border/40 [--sidebar-width:14rem] [--sidebar-width-icon:4rem]"
        >
            <SidebarHeader className="px-2 py-3 border-b border-border/40">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            className={cn(
                                'h-9 gap-2.5 px-2.5 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-sm hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 transition-all',
                                isCollapsed && 'px-2 justify-center'
                            )}
                        >
                            <Link href={dashboard()} prefetch>
                                <Sparkles className={cn('h-4 w-4 shrink-0', isCollapsed && 'h-4 w-4')} />
                                {!isCollapsed && (
                                    <span className="font-semibold text-sm tracking-tight">EventVault</span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-1.5 py-3">
                <SidebarMenu className="space-y-0.5">
                    {mainNavItems.map((item) => {
                        const isActive = page.url.startsWith(resolveUrl(item.href));
                        const Icon = item.icon;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        'h-8 gap-2.5 px-2.5 rounded-md transition-all group',
                                        isActive
                                            ? 'bg-primary/10 text-primary font-medium shadow-sm'
                                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                    )}
                                >
                                    <Link href={item.href} prefetch>
                                        <Icon className={cn(
                                            'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                                            isCollapsed && 'mx-auto',
                                            isActive && 'text-primary'
                                        )} />
                                        {!isCollapsed && (
                                            <span className="text-xs font-medium">{item.title}</span>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="px-1.5 py-2 border-t border-border/40">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
