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
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { ArrowUpDown } from 'lucide-react';

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

interface EventsFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clients: Client[];
    devices: Device[];
    eventTypes: string[];
    verifyModes: string[];
    localFilters: {
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
    selectedClientDevices: Device[];
    onFilterChange: (key: string, value: string | undefined) => void;
    onApplyFilters: () => void;
}

export default function EventsFilterDrawer({
    open,
    onOpenChange,
    clients,
    devices,
    eventTypes,
    verifyModes,
    localFilters,
    selectedClientDevices,
    onFilterChange,
    onApplyFilters,
}: EventsFilterDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="overflow-y-auto max-h-[96vh]">
                <DrawerHeader>
                    <DrawerTitle>Filter & Sort Events</DrawerTitle>
                    <DrawerDescription>
                        Configure filters and sorting options for events
                    </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Client Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="client-filter">Client</Label>
                            <Select
                                value={localFilters.client_id || 'all'}
                                onValueChange={(value) =>
                                    onFilterChange('client_id', value === 'all' ? undefined : value)
                                }
                            >
                                <SelectTrigger id="client-filter">
                                    <SelectValue placeholder="All clients" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All clients</SelectItem>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={String(client.id)}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Device Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="device-filter">Device</Label>
                            <Select
                                value={localFilters.device_id || 'all'}
                                onValueChange={(value) =>
                                    onFilterChange('device_id', value === 'all' ? undefined : value)
                                }
                            >
                                <SelectTrigger id="device-filter">
                                    <SelectValue placeholder="All devices" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All devices</SelectItem>
                                    {(localFilters.client_id
                                        ? selectedClientDevices
                                        : devices
                                    ).map((device) => (
                                        <SelectItem key={device.id} value={String(device.id)}>
                                            {device.name}
                                            {device.client && (
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    ({device.client.name})
                                                </span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Employee Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="employee-filter">Employee ID</Label>
                            <Input
                                id="employee-filter"
                                placeholder="e.g., 1"
                                value={localFilters.employee_no_string || ''}
                                onChange={(e) =>
                                    onFilterChange(
                                        'employee_no_string',
                                        e.target.value || undefined,
                                    )
                                }
                            />
                        </div>

                        {/* Name Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="name-filter">Name</Label>
                            <Input
                                id="name-filter"
                                placeholder="Search by name"
                                value={localFilters.name || ''}
                                onChange={(e) =>
                                    onFilterChange('name', e.target.value || undefined)
                                }
                            />
                        </div>

                        {/* Date From */}
                        <div className="space-y-2">
                            <Label htmlFor="date-from">Date From</Label>
                            <Input
                                id="date-from"
                                type="date"
                                value={localFilters.date_from || ''}
                                onChange={(e) =>
                                    onFilterChange('date_from', e.target.value || undefined)
                                }
                            />
                        </div>

                        {/* Date To */}
                        <div className="space-y-2">
                            <Label htmlFor="date-to">Date To</Label>
                            <Input
                                id="date-to"
                                type="date"
                                value={localFilters.date_to || ''}
                                onChange={(e) =>
                                    onFilterChange('date_to', e.target.value || undefined)
                                }
                            />
                        </div>

                        {/* Event Type */}
                        <div className="space-y-2">
                            <Label htmlFor="event-type-filter">Event Type</Label>
                            <Select
                                value={localFilters.event_type || 'all'}
                                onValueChange={(value) =>
                                    onFilterChange('event_type', value === 'all' ? undefined : value)
                                }
                            >
                                <SelectTrigger id="event-type-filter">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {eventTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Major Event Type */}
                        <div className="space-y-2">
                            <Label htmlFor="major-event-type">Major Event Type</Label>
                            <Input
                                id="major-event-type"
                                type="number"
                                placeholder="e.g., 5"
                                value={localFilters.major_event_type || ''}
                                onChange={(e) =>
                                    onFilterChange(
                                        'major_event_type',
                                        e.target.value || undefined,
                                    )
                                }
                            />
                        </div>

                        {/* Sub Event Type */}
                        <div className="space-y-2">
                            <Label htmlFor="sub-event-type">Sub Event Type</Label>
                            <Input
                                id="sub-event-type"
                                type="number"
                                placeholder="e.g., 75"
                                value={localFilters.sub_event_type || ''}
                                onChange={(e) =>
                                    onFilterChange(
                                        'sub_event_type',
                                        e.target.value || undefined,
                                    )
                                }
                            />
                        </div>

                        {/* Verify Mode */}
                        <div className="space-y-2">
                            <Label htmlFor="verify-mode-filter">Verify Mode</Label>
                            <Select
                                value={localFilters.verify_mode || 'all'}
                                onValueChange={(value) =>
                                    onFilterChange('verify_mode', value === 'all' ? undefined : value)
                                }
                            >
                                <SelectTrigger id="verify-mode-filter">
                                    <SelectValue placeholder="All modes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All modes</SelectItem>
                                    {verifyModes.map((mode) => (
                                        <SelectItem key={mode} value={mode}>
                                            {mode}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Per Page */}
                        <div className="space-y-2">
                            <Label htmlFor="per-page">Per Page</Label>
                            <Select
                                value={localFilters.per_page || '50'}
                                onValueChange={(value) =>
                                    onFilterChange('per_page', value)
                                }
                            >
                                <SelectTrigger id="per-page">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                    <SelectItem value="200">200</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Sorting Section */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <ArrowUpDown className="size-4" />
                        Sorting
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sort-by">Sort By</Label>
                            <Select
                                value={localFilters.sort_by || 'created_at'}
                                onValueChange={(value) =>
                                    onFilterChange('sort_by', value)
                                }
                            >
                                <SelectTrigger id="sort-by">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">Created At</SelectItem>
                                    <SelectItem value="event_datetime">Event Date & Time</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="employee_no_string">Employee ID</SelectItem>
                                    <SelectItem value="event_type">Event Type</SelectItem>
                                    <SelectItem value="current_verify_mode">Verify Mode</SelectItem>
                                    <SelectItem value="ip_address">IP Address</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sort-order">Order</Label>
                            <Select
                                value={localFilters.sort_order || 'desc'}
                                onValueChange={(value) =>
                                    onFilterChange('sort_order', value)
                                }
                            >
                                <SelectTrigger id="sort-order">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Descending (Latest First)</SelectItem>
                                    <SelectItem value="asc">Ascending (Oldest First)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onApplyFilters}>Apply Filters</Button>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

