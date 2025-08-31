"use client";
import { useState } from "react";
import type React from "react";

import {
  useConversations,
  useUsers,
  useDeleteConversation
} from "@/hooks/use-messaging";
import { NewConversationDialog } from "./new-conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/messaging";

interface ConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation
}: ConversationListProps) {
  const [showNewConversationDialog, setShowNewConversationDialog] =
    useState(false);
  const { data: users = [] } = useUsers();

  const { data: conversations = [], isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();

  const getConversationName = (conversation: Conversation) => {
    return conversation.name;
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.name) {
      const userByName = users.find(user => user.name === conversation.name);
      if (userByName?.avatar) {
        return userByName.avatar;
      }
    }

    return "/diverse-user-avatars.png";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const handleNewConversation = () => {
    setShowNewConversationDialog(true);
  };

  const handleConversationCreated = (conversationId: string) => {
    onSelectConversation(conversationId);
  };

  const handleDeleteConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await deleteConversation.mutateAsync(conversationId);
      if (selectedConversationId === conversationId) {
        onSelectConversation("");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Mensajes
            </h2>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center text-muted-foreground">
            Cargando conversaciones...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border h-[70px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Mensajes
            </h2>
            <Button size="sm" variant="ghost" onClick={handleNewConversation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay conversaciones</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={handleNewConversation}
                >
                  Iniciar conversación
                </Button>
              </div>
            ) : (
              conversations.map(conversation => {
                return (
                  <div key={conversation.id} className="relative group">
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors hover:bg-gray-200",
                        selectedConversationId === conversation.id &&
                          "bg-gray-300"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              getConversationAvatar(conversation) ||
                              "/placeholder.svg"
                            }
                          />
                          <AvatarFallback>
                            {getConversationName(conversation)
                              ?.charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sidebar-foreground truncate">
                              {getConversationName(conversation)}
                            </h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>

                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1 w-[90%]">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    <div className="absolute bottom-2 right-2  transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={e =>
                              handleDeleteConversation(conversation.id, e)
                            }
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <NewConversationDialog
        isOpen={showNewConversationDialog}
        onOpenChange={setShowNewConversationDialog}
        onConversationCreated={handleConversationCreated}
      />
    </>
  );
}
