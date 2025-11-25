import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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

interface DeleteDeviceDialogProps {
    device: ClientDevice;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteDeviceDialog({
    device,
    open,
    onOpenChange,
}: DeleteDeviceDialogProps) {
    const form = useForm({});

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove device</DialogTitle>
                    <DialogDescription>
                        This action permanently deletes the device "{device.name}" and all
                        associated event records—it cannot be reversed. Are you sure you want to
                        continue?
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.delete(`/devices/${device.id}`, {
                            onSuccess: () => onOpenChange(false),
                        });
                    }}
                    className="space-y-4"
                >
                    <DialogFooter>
                        <Button type="submit" variant="destructive" disabled={form.processing}>
                            Delete device
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

