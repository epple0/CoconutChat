import { ConnectionStatus } from "../chat/ConnectionStatus";

export default function ConnectionStatusExample() {
  return (
    <div className="flex gap-4 p-4 bg-background">
      <ConnectionStatus connected={true} />
      <ConnectionStatus connected={false} />
    </div>
  );
}
