import { RoomItem, type Room } from "../chat/RoomItem";
import { useState } from "react";

const rooms: Room[] = [
  { id: "1", name: "General", isPrivate: false, userCount: 12 },
  { id: "2", name: "Private Room", isPrivate: true, userCount: 3 },
];

export default function RoomItemExample() {
  const [activeId, setActiveId] = useState("1");
  
  return (
    <div className="flex flex-col gap-1 p-2 bg-sidebar w-64">
      {rooms.map((room) => (
        <RoomItem
          key={room.id}
          room={room}
          isActive={room.id === activeId}
          onClick={() => setActiveId(room.id)}
        />
      ))}
    </div>
  );
}
