import { Badge } from "@/components/ui/badge";
import { Lock, Users } from "lucide-react";

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  userCount: number;
}

interface RoomItemProps {
  room: Room;
  isActive: boolean;
  onClick: () => void;
}

export function RoomItem({ room, isActive, onClick }: RoomItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover-elevate active-elevate-2 ${
        isActive ? "bg-sidebar-accent" : ""
      }`}
      data-testid={`room-item-${room.id}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {room.isPrivate && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          <span className="text-sm font-medium truncate">{room.name}</span>
        </div>
      </div>
      <Badge variant="secondary" className="flex-shrink-0">
        <Users className="h-3 w-3 mr-1" />
        {room.userCount}
      </Badge>
    </button>
  );
}
