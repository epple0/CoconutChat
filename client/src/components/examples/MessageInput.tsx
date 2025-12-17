import { MessageInput } from "../chat/MessageInput";

export default function MessageInputExample() {
  return (
    <div className="bg-background">
      <MessageInput onSend={(msg) => console.log("Sending:", msg)} />
    </div>
  );
}
