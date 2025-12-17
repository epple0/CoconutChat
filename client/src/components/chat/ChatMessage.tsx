import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
}

export function ChatMessage({ message, isOwn, showSender }: ChatMessageProps) {
  const initials = message.sender
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (message.isSystem) {
    return (
      <div
        className="flex justify-center py-2"
        data-testid={`message-system-${message.id}`}
      >
        <span className="text-xs text-muted-foreground italic">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
      data-testid={`message-${message.id}`}
    >
      {showSender && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      {!showSender && <div className="w-8 flex-shrink-0" />}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        {showSender && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{message.sender}</span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
        <div
          className={`rounded-md px-3 py-2 ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
