import { ChatMessage, type Message } from "../chat/ChatMessage";

const messages: Message[] = [
  {
    id: "1",
    sender: "Alice",
    content: "Hey everyone!",
    timestamp: new Date(),
    isSystem: false,
  },
  {
    id: "2",
    sender: "Bob",
    content: "Welcome to the chat room!",
    timestamp: new Date(),
    isSystem: false,
  },
  {
    id: "3",
    sender: "System",
    content: "Charlie joined the room",
    timestamp: new Date(),
    isSystem: true,
  },
];

export default function ChatMessageExample() {
  return (
    <div className="flex flex-col gap-2 p-4 bg-background">
      <ChatMessage message={messages[0]} isOwn={false} showSender={true} />
      <ChatMessage message={messages[1]} isOwn={true} showSender={true} />
      <ChatMessage message={messages[2]} isOwn={false} showSender={false} />
    </div>
  );
}
