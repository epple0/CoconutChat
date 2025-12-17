import { useState } from "react";
import { JoinRoomModal } from "../chat/JoinRoomModal";
import { Button } from "@/components/ui/button";

export default function JoinRoomModalExample() {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Join Room</Button>
      <JoinRoomModal
        open={open}
        onOpenChange={setOpen}
        roomName="Secret Room"
        onJoin={(password) => console.log("Joining with password:", password)}
        error=""
      />
    </div>
  );
}
