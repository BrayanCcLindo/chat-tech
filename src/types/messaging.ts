export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  type?: string | "image" | "file";
  status: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

export interface Conversation {
  id: string;
  name: string;
  type: string;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  type?: string | "image" | "file";
  senderId?: string;
  files?: File[];
}

export interface UpdateMessageRequest {
  content: string;
}

export interface CreateConversationRequest {
  name: string;
  type: "direct" | "group";
  id: string;
}
export interface CreateUserRequest {
  name: string;
  phone: string;
}
