import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ClientWithDevices } from './types';

interface AddDeviceDialogProps {
    client: ClientWithDevices;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddDeviceDialog({
    client,
    open,
    onOpenChange,
}: AddDeviceDialogProps) {
    const form = useForm({ name: '', mac_address: '' });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add device</DialogTitle>
                    <DialogDescription>
                        Provide a friendly name and the device's MAC address (e.g., e0:ba:ad:95:54:a3).
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(`/clients/${client.id}/devices`, {
                            onSuccess: () => {
                                onOpenChange(false);
                                form.reset();
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`device-name-${client.id}`}>Device name</Label>
                        <Input
                            id={`device-name-${client.id}`}
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            placeholder="e.g., Main Entrance"
                            required
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">{form.errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`device-mac-${client.id}`}>MAC Address</Label>
                        <Input
                            id={`device-mac-${client.id}`}
                            value={form.data.mac_address}
                            onChange={(event) => form.setData('mac_address', event.target.value)}
                            placeholder="e.g., e0:ba:ad:95:54:a3"
                            pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                            required
                        />
                        {form.errors.mac_address && (
                            <p className="text-xs text-destructive">{form.errors.mac_address}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Format: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            Add
                        </Button>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

