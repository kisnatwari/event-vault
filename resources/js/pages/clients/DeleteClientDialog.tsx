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
import type { ClientWithDevices } from './types';

interface DeleteClientDialogProps {
    client: ClientWithDevices;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteClientDialog({
    client,
    open,
    onOpenChange,
}: DeleteClientDialogProps) {
    const form = useForm({});

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove client</DialogTitle>
                    <DialogDescription>
                        This action permanently deletes the client, all devices,
                        and any stored event records—it cannot be reversed.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.delete(`/clients/${client.id}`, {
                            onSuccess: () => onOpenChange(false),
                        });
                    }}
                    className="space-y-4"
                >
                    <DialogFooter>
                        <Button type="submit" variant="destructive" disabled={form.processing}>
                            Delete client
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

