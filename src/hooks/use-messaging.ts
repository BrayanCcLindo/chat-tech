"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  User,
  Message,
  Conversation,
  CreateMessageRequest,
  CreateConversationRequest,
  CreateUserRequest
} from "@/types/messaging";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch("/api/messaging/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    }
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async (): Promise<User> => {
      const response = await fetch(`/api/messaging/users/${id}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    enabled: !!id
  });
}

export function useConversations(userId?: string) {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async (): Promise<Conversation[]> => {
      const url = userId
        ? `/api/messaging/conversations?userId=${userId}`
        : "/api/messaging/conversations";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    }
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: async (): Promise<Conversation> => {
      const response = await fetch(`/api/messaging/conversations/${id}`);
      if (!response.ok) throw new Error("Failed to fetch conversation");
      return response.json();
    },
    enabled: !!id
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateConversationRequest
    ): Promise<Conversation> => {
      const response = await fetch("/api/messaging/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create conversation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string): Promise<void> => {
      const response = await fetch(
        `/api/messaging/conversations/${conversationId}`,
        {
          method: "DELETE"
        }
      );
      if (!response.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async (): Promise<Message[]> => {
      const response = await fetch(
        `/api/messaging/conversations/${conversationId}/messages`
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!conversationId
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest): Promise<User> => {
      const response = await fetch("/api/messaging/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      files,
      ...data
    }: CreateMessageRequest & {
      conversationId: string;
      files?: File[];
    }): Promise<Message> => {
      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append("senderId", "1");
        formData.append("content", data.content || "");

        const allImages = files.every(f => f.type.startsWith("image/"));
        formData.append("type", allImages ? "image" : "file");

        files.forEach(file => {
          formData.append("files", file);
        });

        const response = await fetch(
          `/api/messaging/conversations/${conversationId}/messages`,
          {
            method: "POST",
            body: formData
          }
        );
        if (!response.ok) throw new Error("Failed to send message with files");

        const result = await response.json();

        return result;
      } else {
        const response = await fetch(
          `/api/messaging/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, senderId: "1" })
          }
        );
        if (!response.ok) throw new Error("Failed to send message");
        return response.json();
      }
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId]
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<void> => {
      const response = await fetch(`/api/messaging/messages/${messageId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      content
    }: {
      messageId: string;
      content: string;
    }): Promise<Message> => {
      const response = await fetch(`/api/messaging/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error("Failed to edit message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

export function useSearchMessages(query: string, conversationId?: string) {
  return useQuery({
    queryKey: ["messages", "search", query, conversationId],
    queryFn: async (): Promise<Message[]> => {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (conversationId) params.append("conversationId", conversationId);

      const response = await fetch(`/api/messaging/messages/search?${params}`);
      if (!response.ok) throw new Error("Failed to search messages");
      return response.json();
    },
    enabled: query.length > 2
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      emoji
    }: {
      messageId: string;
      emoji: string;
    }): Promise<void> => {
      const response = await fetch(
        `/api/messaging/messages/${messageId}/reactions`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji, userId: "1" })
        }
      );
      if (!response.ok) throw new Error("Failed to remove reaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });
}
