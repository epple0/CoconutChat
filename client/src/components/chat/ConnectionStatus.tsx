import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  connected: boolean;
}

export function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
        connected
          ? "text-status-online"
          : "text-status-offline"
      }`}
      data-testid="connection-status"
    >
      {connected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Disconnected</span>
        </>
      )}
    </div>
  );
}
