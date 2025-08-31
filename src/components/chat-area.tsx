"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
  useMessages,
  useUsers,
  useSendMessage,
  useDeleteMessage
} from "@/hooks/use-messaging";
import { MessageBubble } from "./message-bubble";
import { MessageSearch } from "./message-search";
import { FileUpload } from "./file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Phone, Video, MoreVertical, X } from "lucide-react";
import type { Conversation, Message } from "@/types/messaging";

interface ChatAreaProps {
  conversation: Conversation;
}

export function ChatArea({ conversation }: ChatAreaProps) {
  const [messageText, setMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useMessages(conversation.id);
  const { data: users = [] } = useUsers();
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && selectedFiles.length === 0) return;

    try {
      const hasTextContent = messageText.trim().length > 0;
      const messageContent = hasTextContent
        ? replyingTo
          ? `@${
              users.find(u => u.id === replyingTo.senderId)?.name
            }: ${messageText.trim()}`
          : messageText.trim()
        : undefined;

      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: messageContent ?? "",
        files: selectedFiles.length > 0 ? selectedFiles : undefined
      });

      setMessageText("");
      setReplyingTo(null);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getConversationName = () => {
    return conversation.name;
  };

  const getConversationAvatar = () => {
    if (conversation.name) {
      const userByName = users.find(user => user.name === conversation.name);
      if (userByName?.avatar) {
        return userByName.avatar;
      }
    }

    return "/diverse-user-avatars.png";
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage.mutate(messageId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col bg-background relative ${
        isDragOver ? "bg-muted/50" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">📎</div>
            <p className="text-primary font-medium">Suelta los archivos aquí</p>
            <p className="text-sm text-muted-foreground">
              Se agregarán a tu mensaje
            </p>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-border bg-card h-[70px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={getConversationAvatar() || "/placeholder.svg"}
              />
              <AvatarFallback>
                {getConversationName()?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-card-foreground">
                {getConversationName()}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MessageSearch conversationId={conversation.id} />
            <Button disabled variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button disabled variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button disabled variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Cargando mensajes...</div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No hay mensajes aún</p>
              <p className="text-sm text-muted-foreground">
                Envía un mensaje para comenzar la conversación
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMessages.map(message => {
              const user = users.find(u => u.id === message.senderId);
              const isCurrentUser = message.senderId === "1";

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  user={user}
                  isCurrentUser={isCurrentUser}
                  onDelete={handleDeleteMessage}
                  onReply={handleReply}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border">
        {replyingTo && (
          <div className="mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                Respondiendo a{" "}
                {users.find(u => u.id === replyingTo.senderId)?.name}
              </div>
              <div className="text-sm truncate">{replyingTo.content}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelReply}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
          <div className="flex-1 flex flex-col relative gap-2">
            <FileUpload
              onFilesSelected={setSelectedFiles}
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
            />
            <Input
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder={
                selectedFiles.length > 0
                  ? "Agregar mensaje (opcional)..."
                  : replyingTo
                  ? "Escribe tu respuesta..."
                  : "Escribe un mensaje..."
              }
              className="pr-3 pl-10"
              disabled={sendMessage.isPending}
            />
          </div>
          <Button
            type="submit"
            disabled={
              (!messageText.trim() && selectedFiles.length === 0) ||
              sendMessage.isPending
            }
            className="px-3 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
