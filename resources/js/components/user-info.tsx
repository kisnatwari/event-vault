import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({
    user,
    showName = true,
    showEmail = false,
}: {
    user: User;
    showName?: boolean;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-7 w-7 overflow-hidden rounded-full border border-border/50">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-semibold">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            {showName && (
                <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    {showEmail && (
                        <span className="truncate text-[10px] text-muted-foreground">
                            {user.email}
                        </span>
                    )}
                </div>
            )}
        </>
    );
}
