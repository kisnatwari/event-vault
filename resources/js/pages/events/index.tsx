import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import EventsFilterDrawer from './events-filter-drawer';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Filter, X, RefreshCw, Pause, Play } from 'lucide-react';

interface EventWithRelations {
    id: number;
    device_id: number | null;
    device_id_from_event: string;
    employee_no_string: string;
    name: string;
    event_datetime: string;
    formatted_date: string | null;
    formatted_time: string | null;
    time_ago: string | null;
    received_at: string;
    event_type: string | null;
    event_state: string | null;
    major_event_type: number | null;
    sub_event_type: number | null;
    event_description: string | null;
    ip_address: string | null;
    mac_address: string | null;
    channel_id: number | null;
    device_name: string | null;
    current_verify_mode: string | null;
    device?: {
        id: number;
        name: string;
        client?: {
            id: number;
            name: string;
        };
    } | null;
}

interface Client {
    id: number;
    name: string;
    devices?: Array<{
        id: number;
        name: string;
    }>;
}

interface Device {
    id: number;
    name: string;
    client?: {
        id: number;
        name: string;
    } | null;
}

interface EventsPageProps {
    events: {
        data: EventWithRelations[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    clients: Client[];
    devices: Device[];
    eventTypes: string[];
    verifyModes: string[];
    filters: {
        client_id?: string;
        device_id?: string;
        employee_no_string?: string;
        name?: string;
        date_from?: string;
        date_to?: string;
        event_type?: string;
        major_event_type?: string;
        sub_event_type?: string;
        verify_mode?: string;
        per_page?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

export default function Events({
    events,
    clients,
    devices,
    eventTypes,
    verifyModes,
    filters,
}: EventsPageProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    
    // Get active client name for display
    const activeClient = useMemo(() => {
        if (!filters.client_id) return null;
        return clients.find((c) => c.id === Number(filters.client_id));
    }, [filters.client_id, clients]);
    
    // Auto-refresh state
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
        const saved = localStorage.getItem('events_auto_refresh_enabled');
        return saved ? JSON.parse(saved) : true;
    });
    const [refreshInterval, setRefreshInterval] = useState(() => {
        const saved = localStorage.getItem('events_refresh_interval');
        return saved ? parseInt(saved, 10) : 30;
    });
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).filter(
            (value) => value !== undefined && value !== null && value !== '',
        ).length;
    }, [filters]);

    const applyFilters = () => {
        router.get(
            '/events',
            localFilters,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get('/events', {}, { preserveState: true, preserveScroll: true });
    };

    const handleFilterChange = (key: string, value: string | undefined) => {
        setLocalFilters((prev) => {
            const updated = { ...prev };
            if (value === undefined || value === '') {
                delete updated[key as keyof typeof updated];
            } else {
                updated[key as keyof typeof updated] = value;
            }
            return updated;
        });
    };

    // Get devices for selected client
    const selectedClientDevices = useMemo(() => {
        if (!localFilters.client_id || localFilters.client_id === 'all') return [];
        const client = clients.find((c) => c.id === Number(localFilters.client_id));
        return client?.devices || [];
    }, [localFilters.client_id, clients]);

    // Auto-refresh effect
    useEffect(() => {
        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Set up auto-refresh if enabled
        if (autoRefreshEnabled && refreshInterval > 0) {
            intervalRef.current = setInterval(() => {
                router.reload({
                    only: ['events', 'clients', 'devices', 'eventTypes', 'verifyModes'],
                });
            }, refreshInterval * 1000);
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [autoRefreshEnabled, refreshInterval]);

    // Save preferences to localStorage
    useEffect(() => {
        localStorage.setItem('events_auto_refresh_enabled', JSON.stringify(autoRefreshEnabled));
    }, [autoRefreshEnabled]);

    useEffect(() => {
        localStorage.setItem('events_refresh_interval', refreshInterval.toString());
    }, [refreshInterval]);

    const handleRefreshIntervalChange = (seconds: string) => {
        const value = parseInt(seconds, 10);
        setRefreshInterval(value);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Events', href: '/events' }]}>
            <Head title="Events" />

            <Card className="w-full max-w-7xl mx-auto">
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Events</CardTitle>
                            <CardDescription>
                                View and filter access control events from your devices.
                            </CardDescription>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {/* Auto-refresh controls */}
                            <div className="flex items-center gap-2 border rounded-md px-2 py-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                                    className="gap-2 h-8"
                                >
                                    {autoRefreshEnabled ? (
                                        <Pause className="size-3" />
                                    ) : (
                                        <Play className="size-3" />
                                    )}
                                    <span className="text-xs">
                                        {autoRefreshEnabled ? 'Pause' : 'Resume'}
                                    </span>
                                </Button>
                                <div className="h-4 w-px bg-border" />
                                <div className="flex items-center gap-1">
                                    <RefreshCw className={`size-3 ${autoRefreshEnabled ? 'animate-spin' : ''}`} />
                                    <Select
                                        value={refreshInterval.toString()}
                                        onValueChange={handleRefreshIntervalChange}
                                    >
                                        <SelectTrigger className="h-8 w-20 border-none shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10s</SelectItem>
                                            <SelectItem value="15">15s</SelectItem>
                                            <SelectItem value="30">30s</SelectItem>
                                            <SelectItem value="60">60s</SelectItem>
                                            <SelectItem value="120">2m</SelectItem>
                                            <SelectItem value="300">5m</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="gap-2"
                                >
                                    <X className="size-4" />
                                    Clear ({activeFiltersCount})
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => setShowFilters(true)}
                            >
                                <Filter className="size-4" />
                                Filters
                            </Button>
                            <EventsFilterDrawer
                                open={showFilters}
                                onOpenChange={setShowFilters}
                                clients={clients}
                                devices={devices}
                                eventTypes={eventTypes}
                                verifyModes={verifyModes}
                                localFilters={localFilters}
                                selectedClientDevices={selectedClientDevices}
                                onFilterChange={handleFilterChange}
                                onApplyFilters={applyFilters}
                            />
                        </div>
                    </div>
                    
                    {/* Active Filter Info */}
                    {activeClient && (
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
                            <span className="text-sm text-muted-foreground">Showing events for:</span>
                            <Badge variant="secondary" className="font-medium">
                                {activeClient.name}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    handleFilterChange('client_id', undefined);
                                    applyFilters();
                                }}
                                className="h-6 px-2 ml-auto"
                            >
                                <X className="size-3" />
                            </Button>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        {/* Results Summary */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <p>
                                Showing {events.from || 0} to {events.to || 0} of {events.total}{' '}
                                events
                            </p>
                        </div>

                        {/* Events Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 font-semibold text-muted-foreground">Date & Time</th>
                                        <th className="pb-3 font-semibold text-muted-foreground">Client</th>
                                        <th className="pb-3 font-semibold text-muted-foreground">Device</th>
                                        <th className="pb-3 font-semibold text-muted-foreground">Name</th>
                                        <th className="pb-3 font-semibold text-muted-foreground">Employee ID</th>
                                        <th className="pb-3 font-semibold text-muted-foreground">Event Type</th>
                                        <th className="pb-3 font-semibold text-muted-foreground">Verify Mode</th>
                                        <th className="pb-3 font-semibold text-muted-foreground">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                No events found. Adjust your filters or wait for new events.
                                            </td>
                                        </tr>
                                    ) : (
                                        events.data.map((event) => (
                                            <tr key={event.id} className="border-b last:border-b-0">
                                                <td className="py-4">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex flex-col cursor-pointer">
                                                                {event.formatted_date && (
                                                                    <span className="font-medium">
                                                                        {event.formatted_date}
                                                                    </span>
                                                                )}
                                                                {event.formatted_time && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {event.formatted_time}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        {event.time_ago && (
                                                            <TooltipContent>
                                                                <p>{event.time_ago}</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </td>
                                                <td className="py-4">
                                                    {event.device?.client ? (
                                                        <span className="font-medium">
                                                            {event.device.client.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    {event.device ? (
                                                        <Badge variant="secondary">{event.device.name}</Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            {event.device_id_from_event}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <span className="font-medium">{event.name}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-muted-foreground">
                                                        #{event.employee_no_string}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {event.event_type && (
                                                            <Badge variant="outline">{event.event_type}</Badge>
                                                        )}
                                                        {event.major_event_type !== null &&
                                                            event.sub_event_type !== null && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {event.major_event_type}.{event.sub_event_type}
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {event.current_verify_mode ? (
                                                        <Badge variant="secondary">
                                                            {event.current_verify_mode}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-xs font-mono text-muted-foreground">
                                                        {event.ip_address || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {events.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Page {events.current_page} of {events.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {events.links.map((link, index) => {
                                        if (link.url === null) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 text-sm text-muted-foreground"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => router.get(link.url!)}
                                                disabled={link.active}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

