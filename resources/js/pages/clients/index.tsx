import { Head, Link, usePage } from '@inertiajs/react';
import { PlusIcon, Edit3, Trash2, PlusSquare, Key, MoreVertical, Webhook } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddClientDialog from './AddClientDialog';
import EditClientDialog from './EditClientDialog';
import AddDeviceDialog from './AddDeviceDialog';
import EditDeviceDialog from './EditDeviceDialog';
import DeleteClientDialog from './DeleteClientDialog';
import DeleteDeviceDialog from './DeleteDeviceDialog';
import GenerateApiTokenDialog from './GenerateApiTokenDialog';
import ApiTokensList from './ApiTokensList';
import { ClientWithDevices, ClientDevice } from './types';
import { useState, useMemo } from 'react';

interface ClientsPageProps {
    clients: ClientWithDevices[];
}

export default function Clients({ clients }: ClientsPageProps) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingClient, setEditingClient] = useState<ClientWithDevices | null>(
        null,
    );
    const [addingDeviceFor, setAddingDeviceFor] = useState<ClientWithDevices | null>(
        null,
    );
    const [deletingClient, setDeletingClient] = useState<ClientWithDevices | null>(
        null,
    );
    const [editingDevice, setEditingDevice] = useState<ClientDevice | null>(null);
    const [deletingDevice, setDeletingDevice] = useState<ClientDevice | null>(null);
    const [generatingTokenFor, setGeneratingTokenFor] = useState<ClientWithDevices | null>(null);
    const [expandedTokens, setExpandedTokens] = useState<Set<number>>(new Set());

    const columns = useMemo(
        () => [
            { name: 'Name' },
            { name: 'Devices' },
            { name: '' },
        ],
        [],
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Clients & Devices', href: '/clients' }]}>
            <Head title="Clients & Devices" />

            <Card className="w-full max-w-6xl mx-auto">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Clients & Devices</CardTitle>
                        <CardDescription>
                            Track clients, review assigned devices, and open dialogs for
                            precise edits or deletion safeguards.
                        </CardDescription>
                    </div>

                    <Button variant="secondary" onClick={() => setShowAdd(true)}>
                        <PlusIcon className="size-4 mr-2" />
                        Add client
                    </Button>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column.name}
                                            className="border-b pb-3 font-semibold text-muted-foreground"
                                        >
                                            {column.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <>
                                        <tr key={client.id} className="border-b last:border-b-0">
                                            <td className="py-4">
                                                <Link
                                                    href={`/events?client_id=${client.id}`}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {client.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    #{client.id}
                                                </p>
                                                {client.webhook_url && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        🔗 Webhook configured
                                                    </p>
                                                )}
                                            </td>
                                        <td className="py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {client.devices.map((device) => (
                                                    <div
                                                        key={device.id}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Badge variant="secondary">
                                                            {device.name}
                                                            <span className="ml-2 text-xs opacity-70">
                                                                ({device.mac_address})
                                                            </span>
                                                        </Badge>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-5 w-5 p-0"
                                                                    aria-label={`Edit device ${device.name}`}
                                                                    onClick={() =>
                                                                        setEditingDevice(device)
                                                                    }
                                                                >
                                                                    <Edit3 className="h-3 w-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Edit device name</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                                                                    aria-label={`Delete device ${device.name}`}
                                                                    onClick={() =>
                                                                        setDeletingDevice(device)
                                                                    }
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Delete device</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            aria-label="Client actions"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel className="font-semibold">
                                                            {client.name}
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setEditingClient(client)}
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                            Edit client
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setAddingDeviceFor(client)}
                                                        >
                                                            <PlusSquare className="h-4 w-4" />
                                                            Add device
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingClient(client)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                            Delete client
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                const newSet = new Set(expandedTokens);
                                                                if (newSet.has(client.id)) {
                                                                    newSet.delete(client.id);
                                                                } else {
                                                                    newSet.add(client.id);
                                                                }
                                                                setExpandedTokens(newSet);
                                                            }}
                                                        >
                                                            <Key className="h-4 w-4" />
                                                            Manage API tokens
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setGeneratingTokenFor(client)}
                                                        >
                                                            <PlusSquare className="h-4 w-4" />
                                                            Generate API token
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <EditClientDialog
                                                    client={client}
                                                    open={editingClient?.id === client.id}
                                                    onOpenChange={(open) =>
                                                        setEditingClient(open ? client : null)
                                                    }
                                                />

                                                <AddDeviceDialog
                                                    client={client}
                                                    open={addingDeviceFor?.id === client.id}
                                                    onOpenChange={(open) =>
                                                        setAddingDeviceFor(open ? client : null)
                                                    }
                                                />

                                                <DeleteClientDialog
                                                    client={client}
                                                    open={deletingClient?.id === client.id}
                                                    onOpenChange={(open) =>
                                                        setDeletingClient(open ? client : null)
                                                    }
                                                />

                                                <GenerateApiTokenDialog
                                                    client={client}
                                                    open={generatingTokenFor?.id === client.id}
                                                    onOpenChange={(open) =>
                                                        setGeneratingTokenFor(open ? client : null)
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedTokens.has(client.id) && (
                                        <tr>
                                            <td colSpan={3} className="py-4 bg-muted/30">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                                            <Key className="h-4 w-4" />
                                                            API Tokens
                                                        </h4>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setGeneratingTokenFor(client)}
                                                        >
                                                            <PlusSquare className="h-4 w-4 mr-2" />
                                                            Generate Token
                                                        </Button>
                                                    </div>
                                                    <ApiTokensList tokens={client.api_tokens || []} />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <AddClientDialog open={showAdd} onOpenChange={setShowAdd} />

            {editingDevice && (
                <EditDeviceDialog
                    device={editingDevice}
                    open={!!editingDevice}
                    onOpenChange={(open) => setEditingDevice(open ? editingDevice : null)}
                />
            )}

            {deletingDevice && (
                <DeleteDeviceDialog
                    device={deletingDevice}
                    open={!!deletingDevice}
                    onOpenChange={(open) => setDeletingDevice(open ? deletingDevice : null)}
                />
            )}
        </AppLayout>
    );
}

