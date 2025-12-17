import { z } from "zod";

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  isPrivate: z.boolean(),
  userCount: z.number(),
});

export const messageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  content: z.string(),
  timestamp: z.date(),
  isSystem: z.boolean().optional(),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  isOnline: z.boolean(),
});

export type Room = z.infer<typeof roomSchema>;
export type Message = z.infer<typeof messageSchema>;
export type User = z.infer<typeof userSchema>;

export const insertRoomSchema = z.object({
  name: z.string().min(1).max(50),
  isPrivate: z.boolean(),
  password: z.string().optional(),
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;

export const insertMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1).max(2000),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
