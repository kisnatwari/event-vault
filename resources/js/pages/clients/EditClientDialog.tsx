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
import type { ClientWithDevices } from './types';

interface EditClientDialogProps {
    client: ClientWithDevices;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditClientDialog({
    client,
    open,
    onOpenChange,
}: EditClientDialogProps) {
    const form = useForm({
        name: client.name,
        webhook_url: client.webhook_url || '',
    });

    useEffect(() => {
        if (open) {
            form.setData('name', client.name);
            form.setData('webhook_url', client.webhook_url || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, client.id, client.name, client.webhook_url]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit client & webhook</DialogTitle>
                    <DialogDescription>
                        Update the client name and configure webhook URL for real-time event delivery.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(`/clients/${client.id}`, {
                            onSuccess: () => onOpenChange(false),
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`edit-client-name-${client.id}`}>Client name</Label>
                        <Input
                            id={`edit-client-name-${client.id}`}
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            required
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">{form.errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`edit-client-webhook-${client.id}`}>Webhook URL (Optional)</Label>
                        <Input
                            id={`edit-client-webhook-${client.id}`}
                            type="url"
                            value={form.data.webhook_url}
                            onChange={(event) => form.setData('webhook_url', event.target.value)}
                            placeholder="https://example.com/webhook"
                        />
                        {form.errors.webhook_url && (
                            <p className="text-xs text-destructive">{form.errors.webhook_url}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Events will be sent to this URL in real-time (fire-and-forget)
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

