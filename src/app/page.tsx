"use client";

import { useState } from "react";
import { ConversationList } from "@/components/conversation-list";
import { ChatArea } from "@/components/chat-area";
import { useConversation } from "@/hooks/use-messaging";
import { MessageCircle } from "lucide-react";

export default function MessagingApp() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>("");
  const { data: selectedConversation } = useConversation(
    selectedConversationId
  );
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="h-screen flex bg-background">
      <ConversationList
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
      />

      {selectedConversation ? (
        <ChatArea conversation={selectedConversation} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Bienvenido a tu aplicación de mensajería
            </h2>
            <p className="text-muted-foreground">
              Selecciona una conversación para comenzar a chatear
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
