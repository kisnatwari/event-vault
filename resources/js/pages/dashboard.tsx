import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import eventsRoute from '@/routes/events';
import { type BreadcrumbItem } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    Building2,
    Calendar,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    Server,
    Clock,
    ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip as UITooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    totalEvents: number;
    totalClients: number;
    totalDevices: number;
    todayEvents: number;
    todayUniqueCheckIns: number;
    weekGrowth: number;
    monthGrowth: number;
}

interface ChartData {
    date?: string;
    day?: string;
    hour?: string;
    label?: string;
    count: number;
}

interface TopClient {
    id: number;
    name: string;
    device_count: number;
    event_count: number;
}

interface TopDevice {
    id: number;
    name: string;
    mac_address: string;
    client_name: string;
    event_count: number;
}

interface RecentEvent {
    id: number;
    name: string;
    employee_no_string: string;
    event_datetime: string;
    formatted_date: string | null;
    formatted_time: string | null;
    time_ago: string | null;
    device_name: string;
    client_name: string;
    event_type: string | null;
}

interface DashboardProps {
    stats: DashboardStats;
    charts: {
        last7Days: ChartData[];
        last30Days: ChartData[];
        eventsByHour: ChartData[];
        eventsByDayOfWeek: ChartData[];
    };
    topClients: TopClient[];
    topDevices: TopDevice[];
    recentEvents: RecentEvent[];
}

export default function Dashboard({
    stats,
    charts,
    topClients,
    topDevices,
    recentEvents,
}: DashboardProps) {
    const StatCard = ({
        title,
        value,
        description,
        icon: Icon,
        trend,
        trendValue,
    }: {
        title: string;
        value: string | number;
        description?: string;
        icon: React.ElementType;
        trend?: 'up' | 'down';
        trendValue?: number;
    }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && trendValue !== undefined && (
                    <div className="flex items-center mt-2 text-xs">
                        {trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span
                            className={
                                trend === 'up' ? 'text-green-500' : 'text-red-500'
                            }
                        >
                            {Math.abs(trendValue)}% {trend === 'up' ? 'increase' : 'decrease'}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Events"
                        value={stats.totalEvents}
                        description="All time event count"
                        icon={Activity}
                    />
                    <StatCard
                        title="Total Clients"
                        value={stats.totalClients}
                        description="Active clients"
                        icon={Building2}
                    />
                    <StatCard
                        title="Total Devices"
                        value={stats.totalDevices}
                        description="Registered devices"
                        icon={Server}
                    />
                    <StatCard
                        title="Today's Events"
                        value={stats.todayEvents}
                        description={`${stats.todayUniqueCheckIns} unique check-ins`}
                        icon={Calendar}
                        trend={stats.weekGrowth >= 0 ? 'up' : 'down'}
                        trendValue={stats.weekGrowth}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Last 7 Days Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Events - Last 7 Days</CardTitle>
                            <CardDescription>Daily event count</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts.last7Days}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="oklch(0.55 0.22 280)"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Events by Hour (Last 24 Hours) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Events by Hour</CardTitle>
                            <CardDescription>Last 24 hours activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={charts.eventsByHour}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 10 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="oklch(0.55 0.22 280)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Last 30 Days Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Events - Last 30 Days</CardTitle>
                        <CardDescription>Monthly trend overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={charts.last30Days}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="oklch(0.55 0.22 280)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Bottom Row: Top Clients, Top Devices, Recent Events */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Top Clients */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Clients</CardTitle>
                            <CardDescription>By event count</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topClients.length > 0 ? (
                                    topClients.map((client, index) => (
                                        <div
                                            key={client.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {client.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {client.device_count} device
                                                        {client.device_count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">
                                                {client.event_count}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No data available
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Devices */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Devices</CardTitle>
                            <CardDescription>By event count</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topDevices.length > 0 ? (
                                    topDevices.map((device, index) => (
                                        <div
                                            key={device.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {device.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {device.client_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">
                                                {device.event_count}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No data available
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Events */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Events</CardTitle>
                                    <CardDescription>Latest activity</CardDescription>
                                </div>
                                <Link
                                    href={eventsRoute.index().url}
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    View all
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentEvents.length > 0 ? (
                                    recentEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-start justify-between space-x-3 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {event.name || 'Unknown'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        {event.device_name}
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        •
                                                    </span>
                                                    <UITooltip>
                                                        <TooltipTrigger asChild>
                                                            <p className="text-xs text-muted-foreground cursor-help">
                                                                {event.formatted_time}
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{event.time_ago}</p>
                                                        </TooltipContent>
                                                    </UITooltip>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No recent events
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
