import { useState } from "react";
import { CreateRoomModal } from "../chat/CreateRoomModal";
import { Button } from "@/components/ui/button";

export default function CreateRoomModalExample() {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Create Room</Button>
      <CreateRoomModal
        open={open}
        onOpenChange={setOpen}
        onCreate={(name, isPrivate, password) => {
          console.log("Creating room:", { name, isPrivate, password });
        }}
      />
    </div>
  );
}
