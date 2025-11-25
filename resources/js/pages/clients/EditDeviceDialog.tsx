import { useEffect } from 'react';
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
import type { ClientDevice } from './types';

interface EditDeviceDialogProps {
    device: ClientDevice;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditDeviceDialog({
    device,
    open,
    onOpenChange,
}: EditDeviceDialogProps) {
    const form = useForm({
        name: device.name,
        mac_address: device.mac_address,
    });

    useEffect(() => {
        if (open) {
            form.setData('name', device.name);
            form.setData('mac_address', device.mac_address);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, device.id, device.name, device.mac_address]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit device</DialogTitle>
                    <DialogDescription>
                        Update the device name and MAC address. The MAC address must match the device's actual MAC address.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(`/devices/${device.id}`, {
                            onSuccess: () => onOpenChange(false),
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`edit-device-name-${device.id}`}>Device name</Label>
                        <Input
                            id={`edit-device-name-${device.id}`}
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
                        <Label htmlFor={`edit-device-mac-${device.id}`}>MAC Address</Label>
                        <Input
                            id={`edit-device-mac-${device.id}`}
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
                            Save
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

