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
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  attachments?: Attachment[];
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
  name?: string;
  type: "direct" | "group";
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  type?: "text" | "image" | "file";
  senderId?: string;
  files?: File[];
}

export interface UpdateMessageRequest {
  content: string;
}

export interface CreateConversationRequest {
  name: string;
  type: "direct" | "group";
}
export interface CreateUserRequest {
  name: string;
  phone: string;
}
