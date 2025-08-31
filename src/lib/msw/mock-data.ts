import type { User, Message, Conversation } from "@/types/messaging";

export const convId1 = crypto.randomUUID();
export const userId1 = crypto.randomUUID();

export const mockUsers: User[] = [
  {
    id: userId1,
    name: "Pedro Gonzalez",
    email: "pedro@example.com",
    avatar: "/avatar-pedro.png",
    isOnline: true,
    lastSeen: new Date().toISOString()
  }
];

export const mockMessages: Message[] = [
  {
    id: convId1,
    conversationId: convId1,
    senderId: userId1,
    content: "¡Hola! ¿Cómo estás?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "text",
    status: "read"
  }
];

export const mockConversations: Conversation[] = [
  {
    id: convId1,
    type: "direct",
    name: "Pedro González",
    lastMessage: mockMessages.find(m => m.conversationId === convId1),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3000000).toISOString()
  }
];
