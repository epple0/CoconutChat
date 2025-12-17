import type { Express } from "express";
import { type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { randomUUID } from "crypto";
import { log } from "./index";

interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  password?: string;
  userCount: number;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface User {
  id: string;
  name: string;
  isOnline: boolean;
}

interface ConnectedUser {
  id: string;
  socketId: string;
  username: string;
  currentRoom?: string;
}

const rooms = new Map<string, Room>();
const roomMessages = new Map<string, Message[]>();
const connectedUsers = new Map<string, ConnectedUser>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const username = socket.handshake.auth.username as string;
    
    if (!username) {
      socket.disconnect();
      return;
    }

    const userId = randomUUID();
    const user: ConnectedUser = {
      id: userId,
      socketId: socket.id,
      username,
    };
    connectedUsers.set(socket.id, user);

    log(`User connected: ${username} (${socket.id})`, "socket.io");

    const publicRooms = Array.from(rooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      isPrivate: room.isPrivate,
      userCount: room.userCount,
    }));
    socket.emit("rooms", publicRooms);

    socket.on("create_room", (data: { name: string; isPrivate: boolean; password?: string }) => {
      const roomId = randomUUID();
      const room: Room = {
        id: roomId,
        name: data.name,
        isPrivate: data.isPrivate,
        password: data.password,
        userCount: 0,
      };
      rooms.set(roomId, room);
      roomMessages.set(roomId, []);

      log(`Room created: ${data.name} (private: ${data.isPrivate})`, "socket.io");

      const publicRoom = {
        id: room.id,
        name: room.name,
        isPrivate: room.isPrivate,
        userCount: room.userCount,
      };
      io.emit("rooms", Array.from(rooms.values()).map((r) => ({
        id: r.id,
        name: r.name,
        isPrivate: r.isPrivate,
        userCount: r.userCount,
      })));

      socket.emit("join_room", { roomId });
    });

    socket.on("join_room", (data: { roomId: string; password?: string }) => {
      const room = rooms.get(data.roomId);
      if (!room) {
        socket.emit("room_error", "Room not found");
        return;
      }

      if (room.isPrivate && room.password && room.password !== data.password) {
        socket.emit("room_error", "Incorrect password");
        return;
      }

      const currentUser = connectedUsers.get(socket.id);
      if (currentUser?.currentRoom) {
        socket.leave(currentUser.currentRoom);
        const oldRoom = rooms.get(currentUser.currentRoom);
        if (oldRoom) {
          oldRoom.userCount = Math.max(0, oldRoom.userCount - 1);
          io.to(currentUser.currentRoom).emit("user_left", currentUser.id);
        }
      }

      socket.join(data.roomId);
      room.userCount++;
      
      if (currentUser) {
        currentUser.currentRoom = data.roomId;
      }

      const messages = roomMessages.get(data.roomId) || [];
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.currentRoom === data.roomId)
        .map((u) => ({
          id: u.id,
          name: u.username,
          isOnline: true,
        }));

      socket.emit("room_joined", {
        room: {
          id: room.id,
          name: room.name,
          isPrivate: room.isPrivate,
          userCount: room.userCount,
        },
        messages,
        users: usersInRoom,
      });

      socket.to(data.roomId).emit("user_joined", {
        id: currentUser?.id || userId,
        name: username,
        isOnline: true,
      });

      io.emit("rooms", Array.from(rooms.values()).map((r) => ({
        id: r.id,
        name: r.name,
        isPrivate: r.isPrivate,
        userCount: r.userCount,
      })));

      log(`User ${username} joined room: ${room.name}`, "socket.io");
    });

    socket.on("message", (data: { roomId: string; content: string }) => {
      const currentUser = connectedUsers.get(socket.id);
      if (!currentUser || currentUser.currentRoom !== data.roomId) {
        return;
      }

      const message: Message = {
        id: randomUUID(),
        sender: currentUser.username,
        content: data.content,
        timestamp: new Date(),
      };

      const messages = roomMessages.get(data.roomId) || [];
      messages.push(message);
      if (messages.length > 100) {
        messages.shift();
      }
      roomMessages.set(data.roomId, messages);

      io.to(data.roomId).emit("message", message);
    });

    socket.on("disconnect", () => {
      const currentUser = connectedUsers.get(socket.id);
      if (currentUser?.currentRoom) {
        const room = rooms.get(currentUser.currentRoom);
        if (room) {
          room.userCount = Math.max(0, room.userCount - 1);
          socket.to(currentUser.currentRoom).emit("user_left", currentUser.id);
          
          io.emit("rooms", Array.from(rooms.values()).map((r) => ({
            id: r.id,
            name: r.name,
            isPrivate: r.isPrivate,
            userCount: r.userCount,
          })));
        }
      }
      connectedUsers.delete(socket.id);
      log(`User disconnected: ${username}`, "socket.io");
    });
  });

  return httpServer;
}
