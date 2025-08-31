import { http, HttpResponse } from "msw";
import type {
  CreateMessageRequest,
  UpdateMessageRequest,
  CreateConversationRequest,
  Conversation,
  Attachment,
  CreateUserRequest
} from "@/types/messaging";
import { mockUsers, mockMessages, mockConversations } from "./mock-data";

const users = [...mockUsers];
let messages = [...mockMessages];
const conversations = [...mockConversations];
const messageId = crypto.randomUUID();

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: 1, name: "Pedro gonzalez", email: "pedro@example.com" }
    ]);
  }),

  http.post("/api/users", async ({ request }) => {
    const newUser = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: Date.now(),
        ...newUser,
        createdAt: new Date().toISOString()
      },
      { status: 201 }
    );
  }),

  http.get("/api/messaging/users", () => {
    return HttpResponse.json(users);
  }),

  http.get("/api/messaging/users/:id", ({ params }) => {
    const user = users.find(u => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.get("/api/messaging/conversations", () => {
    return HttpResponse.json(conversations);
  }),

  http.get("/api/messaging/conversations/:id", ({ params }) => {
    const conversation = conversations.find(c => c.id === params.id);
    if (!conversation) {
      return HttpResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    return HttpResponse.json(conversation);
  }),

  http.post("/api/messaging/conversations", async ({ request }) => {
    const data = (await request.json()) as CreateConversationRequest;

    const now = new Date().toISOString();

    const newConversation = {
      id: messageId,
      name: data.name,
      type: data.type,
      lastMessage: undefined,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now
    };

    conversations.push(newConversation);
    return HttpResponse.json(newConversation, { status: 201 });
  }),

  http.delete("/api/messaging/conversations/:id", ({ params }) => {
    const index = conversations.findIndex(c => c.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    messages = messages.filter(m => m.conversationId !== params.id);
    conversations.splice(index, 1);

    return HttpResponse.json({ success: true });
  }),

  http.patch(
    "/api/messaging/conversations/:id",
    async ({ params, request }) => {
      const updates = (await request.json()) as Partial<Conversation>;
      const conversationIndex = conversations.findIndex(
        c => c.id === params.id
      );

      if (conversationIndex === -1) {
        return HttpResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      conversations[conversationIndex] = {
        ...conversations[conversationIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return HttpResponse.json(conversations[conversationIndex]);
    }
  ),

  http.post("/api/messaging/conversations/:id/leave", async ({ params }) => {
    const conversationIndex = conversations.findIndex(c => c.id === params.id);

    if (conversationIndex === -1) {
      return HttpResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    const conversation = conversations[conversationIndex];
    conversation.updatedAt = new Date().toISOString();

    return HttpResponse.json({ success: true });
  }),

  http.post("/api/messaging/users", async ({ request }) => {
    const data = (await request.json()) as CreateUserRequest;

    const newUser = {
      id: messageId,
      name: data.name,
      email: `${data.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      avatar: `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(
        data.name
      )}`,
      isOnline: true,
      lastSeen: new Date().toISOString()
    };

    users.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.get(
    "/api/messaging/conversations/:conversationId/messages",
    ({ params, request }) => {
      const url = new URL(request.url);
      const limit = Number.parseInt(url.searchParams.get("limit") || "50");
      const offset = Number.parseInt(url.searchParams.get("offset") || "0");

      const conversationMessages = messages
        .filter(m => m.conversationId === params.conversationId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(offset, offset + limit);

      return HttpResponse.json(conversationMessages);
    }
  ),

  http.post(
    "/api/messaging/conversations/:conversationId/messages",
    async ({ params, request }) => {
      const contentType = request.headers.get("content-type");
      let data: CreateMessageRequest;
      let attachments: Attachment[] = [];

      if (contentType?.includes("multipart/form-data")) {
        const formData = await request.formData();

        data = {
          conversationId: params.conversationId as string,
          senderId: (formData.get("senderId") as string) || "1",
          content: (formData.get("content") as string) || "",
          type: (formData.get("type") as "text" | "image" | "file") || "text"
        };

        const files = formData.getAll("files") as File[];
        attachments = files.map((file, index) => ({
          id: `att-${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          thumbnailUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined
        }));
      } else {
        data = (await request.json()) as CreateMessageRequest;
      }

      let messageType: "text" | "image" | "file" = "text";
      if (attachments.length > 0) {
        const hasImages = attachments.some(att =>
          att.type.startsWith("image/")
        );
        const hasVideos = attachments.some(att =>
          att.type.startsWith("video/")
        );

        if (hasImages && !hasVideos) {
          messageType = "image";
        } else {
          messageType = "file";
        }
      }

      const newMessage = {
        id: `msg-${Date.now()}`,
        conversationId: params.conversationId as string,
        senderId: data.senderId || "1",
        content: data.content || "",
        attachments: attachments.length > 0 ? attachments : undefined,
        timestamp: new Date().toISOString(),
        type: messageType,
        status: "sent" as const
      };

      messages.push(newMessage);

      const conversation = conversations.find(
        c => c.id === params.conversationId
      );
      if (conversation) {
        conversation.lastMessage = newMessage;
        conversation.updatedAt = newMessage.timestamp;
      }

      setTimeout(() => {
        const messageIndex = messages.findIndex(m => m.id === newMessage.id);
        if (messageIndex !== -1) {
          messages[messageIndex].status = "delivered";
        }
      }, 1000);

      return HttpResponse.json(newMessage, { status: 201 });
    }
  ),

  http.put("/api/messaging/messages/:id", async ({ params, request }) => {
    const data = (await request.json()) as UpdateMessageRequest;
    const messageIndex = messages.findIndex(m => m.id === params.id);

    if (messageIndex === -1) {
      return HttpResponse.json({ error: "Message not found" }, { status: 404 });
    }

    messages[messageIndex] = {
      ...messages[messageIndex],
      content: data.content,
      edited: true,
      editedAt: new Date().toISOString()
    };

    return HttpResponse.json(messages[messageIndex]);
  }),

  http.delete("/api/messaging/messages/:id", ({ params }) => {
    const messageIndex = messages.findIndex(m => m.id === params.id);
    if (messageIndex === -1) {
      return HttpResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const deletedMessage = messages[messageIndex];
    messages.splice(messageIndex, 1);

    const conversation = conversations.find(
      c => c.id === deletedMessage.conversationId
    );
    if (conversation && conversation.lastMessage?.id === params.id) {
      const remainingMessages = messages
        .filter(m => m.conversationId === deletedMessage.conversationId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

      conversation.lastMessage = remainingMessages[0] || undefined;
      conversation.updatedAt =
        remainingMessages[0]?.timestamp || conversation.updatedAt;
    }

    return HttpResponse.json({ success: true });
  }),

  http.get("/api/messaging/messages/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const conversationId = url.searchParams.get("conversationId");

    if (!query || query.length < 2) {
      return HttpResponse.json([]);
    }

    let filtered = messages.filter(m =>
      m.content.toLowerCase().includes(query.toLowerCase())
    );

    if (conversationId) {
      filtered = filtered.filter(m => m.conversationId === conversationId);
    }

    return HttpResponse.json(filtered);
  })
];
