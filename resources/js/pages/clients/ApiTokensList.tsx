import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Key, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { ApiToken } from './types';

interface ApiTokensListProps {
    tokens: ApiToken[];
}

export default function ApiTokensList({ tokens }: ApiTokensListProps) {
    const [revokingId, setRevokingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    if (tokens.length === 0) {
        return (
            <div className="text-sm text-muted-foreground py-2">
                No API tokens generated yet.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {tokens.map((token) => {
                const expired = isExpired(token.expires_at);
                const inactive = !token.is_active || expired;

                return (
                    <div
                        key={token.id}
                        className="flex items-center justify-between p-3 border rounded-md bg-card"
                    >
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{token.name}</span>
                                {inactive ? (
                                    <Badge variant="secondary" className="text-xs">
                                        {expired ? 'Expired' : 'Revoked'}
                                    </Badge>
                                ) : (
                                    <Badge variant="default" className="text-xs">
                                        Active
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                                <p>Created: {formatDate(token.created_at)}</p>
                                <p>Last used: {formatDate(token.last_used_at)}</p>
                                {token.expires_at && (
                                    <p>
                                        Expires:{' '}
                                        {expired ? (
                                            <span className="text-destructive">
                                                {formatDateTime(token.expires_at)} (Expired)
                                            </span>
                                        ) : (
                                            formatDateTime(token.expires_at)
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            {token.is_active && !expired ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setRevokingId(token.id);
                                                router.patch(`/api-tokens/${token.id}/revoke`, {}, {
                                                    onFinish: () => {
                                                        setRevokingId(null);
                                                    },
                                                });
                                            }}
                                            disabled={revokingId === token.id}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Revoke token</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : null}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this API token? This action cannot be undone.')) {
                                                setDeletingId(token.id);
                                                router.delete(`/api-tokens/${token.id}`, {
                                                    onFinish: () => {
                                                        setDeletingId(null);
                                                    },
                                                });
                                            }
                                        }}
                                        disabled={deletingId === token.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete token</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

