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

export default function AddClientDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm({
        name: '',
        webhook_url: '',
        devices: [{ name: '', mac_address: '' }],
    });

    const addField = () => {
        form.setData('devices', [...form.data.devices, { name: '', mac_address: '' }]);
    };

    const removeField = (index: number) => {
        const next = form.data.devices.filter((_, idx) => idx !== index);
        form.setData('devices', next.length === 0 ? [{ name: '', mac_address: '' }] : next);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create client</DialogTitle>
                    <DialogDescription>
                        Provide a name and optionally list several devices.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/clients', {
                            onSuccess: () => {
                                form.reset();
                                onOpenChange(false);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="client-name">Client name</Label>
                        <Input
                            id="client-name"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            required
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">{form.errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="client-webhook">Webhook URL (Optional)</Label>
                        <Input
                            id="client-webhook"
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

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                            Devices
                            <Button type="button" variant="outline" size="sm" onClick={addField}>
                                Add device
                            </Button>
                        </div>

                        {form.data.devices.map((device, index) => (
                            <div key={index} className="space-y-2 p-3 border rounded-md">
                                <div className="flex gap-2">
                                    <Input
                                        className="flex-1"
                                        placeholder="Device name"
                                        value={device.name}
                                        onChange={(event) => {
                                            const next = [...form.data.devices];
                                            next[index] = { ...next[index], name: event.target.value };
                                            form.setData('devices', next);
                                        }}
                                    />
                                    {index > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeField(index)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    placeholder="MAC Address (e.g., e0:ba:ad:95:54:a3)"
                                    value={device.mac_address}
                                    onChange={(event) => {
                                        const next = [...form.data.devices];
                                        next[index] = { ...next[index], mac_address: event.target.value };
                                        form.setData('devices', next);
                                    }}
                                    pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Format: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
                                </p>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            Create client
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

