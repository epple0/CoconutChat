import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatMessage, type Message } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { RoomItem, type Room } from "./RoomItem";
import { UserItem, type User } from "./UserItem";
import { CreateRoomModal } from "./CreateRoomModal";
import { JoinRoomModal } from "./JoinRoomModal";
import { WelcomeScreen } from "./WelcomeScreen";
import { ConnectionStatus } from "./ConnectionStatus";
import { TypingIndicator } from "./TypingIndicator";
import { Plus, Users, MessageCircle, Menu, X } from "lucide-react";

interface ChatState {
  username: string | null;
  currentRoom: Room | null;
  rooms: Room[];
  messages: Message[];
  users: User[];
  connected: boolean;
  typingUsers: Map<string, string>;
}

export function ChatApp() {
  const [state, setState] = useState<ChatState>({
    username: null,
    currentRoom: null,
    rooms: [],
    messages: [],
    users: [],
    connected: false,
    typingUsers: new Map(),
  });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinRoomData, setJoinRoomData] = useState<{ room: Room; error?: string } | null>(null);
  const [mobileView, setMobileView] = useState<"rooms" | "chat" | "users">("chat");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  useEffect(() => {
    if (!state.username) return;

    const socket = io({
      auth: { username: state.username },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setState((prev) => ({ ...prev, connected: true }));
    });

    socket.on("disconnect", () => {
      setState((prev) => ({ ...prev, connected: false }));
    });

    socket.on("rooms", (rooms: Room[]) => {
      setState((prev) => ({ ...prev, rooms }));
    });

    socket.on("room_joined", (data: { room: Room; messages: Message[]; users: User[] }) => {
      setState((prev) => ({
        ...prev,
        currentRoom: data.room,
        messages: data.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
        users: data.users,
        typingUsers: new Map(),
      }));
      setJoinRoomData(null);
      setMobileView("chat");
    });

    socket.on("room_error", (error: string) => {
      if (joinRoomData) {
        setJoinRoomData({ ...joinRoomData, error });
      }
    });

    socket.on("message", (message: Message) => {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, { ...message, timestamp: new Date(message.timestamp) }],
      }));
    });

    socket.on("user_joined", (user: User) => {
      setState((prev) => ({
        ...prev,
        users: [...prev.users.filter((u) => u.id !== user.id), user],
        messages: [
          ...prev.messages,
          {
            id: `system-${Date.now()}`,
            sender: "System",
            content: `${user.name} joined the room`,
            timestamp: new Date(),
            isSystem: true,
          },
        ],
      }));
    });

    socket.on("user_left", (userId: string) => {
      setState((prev) => {
        const user = prev.users.find((u) => u.id === userId);
        const newTypingUsers = new Map(prev.typingUsers);
        newTypingUsers.delete(userId);
        return {
          ...prev,
          users: prev.users.filter((u) => u.id !== userId),
          typingUsers: newTypingUsers,
          messages: user
            ? [
                ...prev.messages,
                {
                  id: `system-${Date.now()}`,
                  sender: "System",
                  content: `${user.name} left the room`,
                  timestamp: new Date(),
                  isSystem: true,
                },
              ]
            : prev.messages,
        };
      });
    });

    socket.on("user_typing", (data: { userId: string; username: string; isTyping: boolean }) => {
      setState((prev) => {
        const newTypingUsers = new Map(prev.typingUsers);
        if (data.isTyping) {
          newTypingUsers.set(data.userId, data.username);
        } else {
          newTypingUsers.delete(data.userId);
        }
        return { ...prev, typingUsers: newTypingUsers };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [state.username]);

  const handleJoinChat = (username: string) => {
    setState((prev) => ({ ...prev, username }));
  };

  const handleCreateRoom = (name: string, isPrivate: boolean, password?: string) => {
    socketRef.current?.emit("create_room", { name, isPrivate, password });
  };

  const handleJoinRoom = (room: Room) => {
    if (room.isPrivate) {
      setJoinRoomData({ room });
    } else {
      socketRef.current?.emit("join_room", { roomId: room.id });
    }
  };

  const handleJoinPrivateRoom = (password: string) => {
    if (joinRoomData) {
      socketRef.current?.emit("join_room", { roomId: joinRoomData.room.id, password });
    }
  };

  const handleSendMessage = (content: string) => {
    if (state.currentRoom) {
      socketRef.current?.emit("message", { roomId: state.currentRoom.id, content });
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (state.currentRoom) {
      socketRef.current?.emit("typing", { roomId: state.currentRoom.id, isTyping });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    isAtBottomRef.current = isBottom;
  };

  if (!state.username) {
    return <WelcomeScreen onJoin={handleJoinChat} />;
  }

  const shouldShowSender = (message: Message, index: number): boolean => {
    if (message.isSystem) return false;
    if (index === 0) return true;
    const prevMessage = state.messages[index - 1];
    if (prevMessage.isSystem) return true;
    if (prevMessage.sender !== message.sender) return true;
    const timeDiff = message.timestamp.getTime() - prevMessage.timestamp.getTime();
    return timeDiff > 5 * 60 * 1000;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b flex items-center justify-between px-4 z-50">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          data-testid="button-mobile-menu"
        >
          {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="font-semibold">
          {state.currentRoom?.name || "ChatRoom"}
        </span>
        <div className="flex items-center gap-1">
          <ConnectionStatus connected={state.connected} />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 pt-14">
          <div className="flex flex-col h-full bg-sidebar">
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 text-sm font-medium ${mobileView === "rooms" ? "border-b-2 border-primary" : ""}`}
                onClick={() => { setMobileView("rooms"); setShowMobileMenu(false); }}
              >
                Rooms
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${mobileView === "users" ? "border-b-2 border-primary" : ""}`}
                onClick={() => { setMobileView("users"); setShowMobileMenu(false); }}
              >
                Users
              </button>
            </div>
            <ScrollArea className="flex-1">
              {mobileView === "rooms" || mobileView === "chat" ? (
                <div className="p-2">
                  <Button
                    onClick={() => { setShowCreateModal(true); setShowMobileMenu(false); }}
                    className="w-full mb-2"
                    data-testid="button-create-room-mobile"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </Button>
                  {state.rooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      isActive={state.currentRoom?.id === room.id}
                      onClick={() => { handleJoinRoom(room); setShowMobileMenu(false); }}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-2">
                  {state.users.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      isCurrentUser={user.name === state.username}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Rooms */}
      <div className="hidden md:flex flex-col w-64 bg-sidebar border-r">
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Rooms</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowCreateModal(true)}
            data-testid="button-create-room"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 flex flex-col gap-1">
            {state.rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 text-center">
                No rooms yet. Create one!
              </p>
            ) : (
              state.rooms.map((room) => (
                <RoomItem
                  key={room.id}
                  room={room}
                  isActive={state.currentRoom?.id === room.id}
                  onClick={() => handleJoinRoom(room)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col md:pt-0 pt-14">
        {/* Desktop Header */}
        <div className="hidden md:flex h-14 border-b items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-2">
            {state.currentRoom ? (
              <>
                <span className="font-semibold">{state.currentRoom.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({state.users.length} online)
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Select a room to start chatting</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ConnectionStatus connected={state.connected} />
            <ThemeToggle />
          </div>
        </div>

        {/* Messages */}
        {state.currentRoom ? (
          <>
            <ScrollArea className="flex-1" onScrollCapture={handleScroll}>
              <div className="max-w-4xl mx-auto p-4 flex flex-col gap-2">
                {state.messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  state.messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={message.sender === state.username}
                      showSender={shouldShowSender(message, index)}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <TypingIndicator typingUsers={Array.from(state.typingUsers.values())} />
            <MessageInput onSend={handleSendMessage} onTyping={handleTyping} disabled={!state.connected} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Welcome, {state.username}!</h2>
              <p className="text-muted-foreground mb-4">
                Select a room from the sidebar or create a new one
              </p>
              <Button onClick={() => setShowCreateModal(true)} data-testid="button-create-first-room">
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar - Users */}
      <div className="hidden md:flex flex-col w-56 bg-sidebar border-l">
        <div className="p-4 border-b flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-semibold">Users</span>
          {state.currentRoom && (
            <span className="text-sm text-muted-foreground">({state.users.length})</span>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 flex flex-col gap-1">
            {state.currentRoom ? (
              state.users.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3 text-center">
                  No users online
                </p>
              ) : (
                state.users.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    isCurrentUser={user.name === state.username}
                  />
                ))
              )
            ) : (
              <p className="text-sm text-muted-foreground p-3 text-center">
                Join a room to see users
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Modals */}
      <CreateRoomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreate={handleCreateRoom}
      />

      {joinRoomData && (
        <JoinRoomModal
          open={true}
          onOpenChange={() => setJoinRoomData(null)}
          roomName={joinRoomData.room.name}
          onJoin={handleJoinPrivateRoom}
          error={joinRoomData.error}
        />
      )}
    </div>
  );
}
