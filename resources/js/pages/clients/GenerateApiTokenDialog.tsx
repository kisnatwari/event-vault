import { useForm, usePage } from '@inertiajs/react';
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
import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface GenerateApiTokenDialogProps {
    client: ClientWithDevices;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function GenerateApiTokenDialog({
    client,
    open,
    onOpenChange,
}: GenerateApiTokenDialogProps) {
    const form = useForm({
        name: '',
        expires_at: '',
    });
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { flash } = usePage().props as any;

    // Check for generated token in flash when dialog opens
    useEffect(() => {
        if (open && flash?.api_token_generated) {
            setGeneratedToken(flash.api_token_generated.token);
        }
    }, [open, flash]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(`/clients/${client.id}/api-tokens`, {
            onSuccess: () => {
                // Token will be in flash, handled by useEffect
                form.reset();
            },
        });
    };

    const copyToClipboard = async () => {
        if (generatedToken) {
            await navigator.clipboard.writeText(generatedToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setGeneratedToken(null);
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                {generatedToken ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>API Token Generated</DialogTitle>
                            <DialogDescription>
                                Copy your API token now. You won't be able to see it again!
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Your API Token</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={generatedToken}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-md bg-muted p-3 text-sm">
                                <p className="font-semibold mb-1">Usage Example:</p>
                                <code className="text-xs">
                                    Authorization: Bearer {generatedToken.substring(0, 20)}...
                                </code>
                            </div>

                            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm">
                                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                    ⚠️ Important
                                </p>
                                <p className="text-yellow-700 dark:text-yellow-300">
                                    Store this token securely. It will not be shown again.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose}>Done</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Generate API Token</DialogTitle>
                            <DialogDescription>
                                Create a new API token for {client.name}. This token will allow
                                access to their data via the API.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="token-name">Token Name</Label>
                                <Input
                                    id="token-name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="e.g., Production API, Development API"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="expires-at">Expires At (Optional)</Label>
                                <Input
                                    id="expires-at"
                                    type="datetime-local"
                                    value={form.data.expires_at}
                                    onChange={(event) =>
                                        form.setData('expires_at', event.target.value)
                                    }
                                />
                                {form.errors.expires_at && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.expires_at}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Leave empty for no expiration
                                </p>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={form.processing}>
                                    Generate Token
                                </Button>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">
                                        Cancel
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

