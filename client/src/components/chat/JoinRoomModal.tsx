import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";

interface JoinRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  onJoin: (password: string) => void;
  error?: string;
}

export function JoinRoomModal({ open, onOpenChange, roomName, onJoin, error }: JoinRoomModalProps) {
  const [password, setPassword] = useState("");

  const handleJoin = () => {
    onJoin(password);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPassword("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Join Private Room
          </DialogTitle>
          <DialogDescription>
            Enter the password to join "{roomName}"
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="join-password">Password</Label>
            <Input
              id="join-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter room password..."
              data-testid="input-join-password"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} data-testid="button-cancel-join">
            Cancel
          </Button>
          <Button onClick={handleJoin} data-testid="button-confirm-join">
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
