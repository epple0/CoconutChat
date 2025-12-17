import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface User {
  id: string;
  name: string;
  isOnline: boolean;
}

interface UserItemProps {
  user: User;
  isCurrentUser?: boolean;
}

export function UserItem({ user, isCurrentUser }: UserItemProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-md ${
        isCurrentUser ? "bg-sidebar-accent" : ""
      }`}
      data-testid={`user-item-${user.id}`}
    >
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar ${
            user.isOnline ? "bg-status-online" : "bg-status-offline"
          }`}
        />
      </div>
      <span className="text-sm truncate flex-1">{user.name}</span>
      {isCurrentUser && (
        <span className="text-xs text-muted-foreground">(you)</span>
      )}
    </div>
  );
}
