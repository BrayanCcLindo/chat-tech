"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit3, Reply, Check, X } from "lucide-react";
import { MessageReactions } from "./message-reactions";
import { DeleteMessageDialog } from "./delete-message-dialog";
import { useEditMessage } from "@/hooks/use-messaging";
import { cn } from "@/lib/utils";
import type { Message, User } from "@/types/messaging";

interface MessageBubbleProps {
  message: Message;
  user?: User;
  isCurrentUser: boolean;
  onDelete?: (messageId: string) => void;
  onReply?: (message: Message) => void;
}

export function MessageBubble({
  message,
  user,
  isCurrentUser,
  onDelete,
  onReply
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const editMessage = useEditMessage();
  const [reactions, setReactions] = useState<
    { emoji: string; count: number; userReacted: boolean }[]
  >([]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return "text-muted-foreground";
      case "delivered":
        return "text-muted-foreground";
      case "read":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const handleEditSubmit = async () => {
    if (editText.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      await editMessage.mutateAsync({
        messageId: message.id,
        content: editText.trim()
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleEditCancel = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(message.id);
    setShowDeleteDialog(false);
  };

  const handleReact = (emoji: string) => {
    setReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.userReacted) {
          return prev
            .map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count - 1, userReacted: false }
                : r
            )
            .filter(r => r.count > 0);
        } else {
          return prev.map(r =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, userReacted: true }
              : r
          );
        }
      } else {
        return [...prev, { emoji, count: 1, userReacted: true }];
      }
    });
  };

  return (
    <>
      <div
        className={cn(
          "flex gap-3 group",
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {!isCurrentUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "flex flex-col",
            isCurrentUser ? "items-end" : "items-start"
          )}
        >
          {!isCurrentUser && (
            <span className="text-xs text-muted-foreground mb-1">
              {user?.name || "Unknown User"}
            </span>
          )}

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex flex-col gap-2",
                isCurrentUser ? "items-end" : "items-start"
              )}
            >
              {message.content && message.content.trim() && (
                <div
                  className={cn(
                    "max-w-xs lg:max-md px-4 py-2 rounded-2xl bg-blue-500",
                    isCurrentUser
                      ? "bg-slate-500 text-primary-foreground"
                      : "bg-card text-card-foreground"
                  )}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="text-sm border-none p-0 h-auto focus-visible:ring-0"
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleEditSubmit();
                          } else if (e.key === "Escape") {
                            handleEditCancel();
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditSubmit}
                          disabled={editMessage.isPending}
                          className="h-6 px-2"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditCancel}
                          className="h-6 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{message.content}</p>
                      {message.edited && (
                        <span className="text-xs opacity-70 italic">
                          (editado)
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            {isCurrentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {message.type === "text" && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onReply?.(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Responder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {!isEditing && (
            <MessageReactions reactions={reactions} onReact={handleReact} />
          )}

          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs",
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            <span className="text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            {isCurrentUser && (
              <span className={getStatusColor(message.status)}>
                {message.status === "sent" && "✓"}
                {message.status === "delivered" && "✓✓"}
                {message.status === "read" && "✓✓"}
              </span>
            )}
          </div>
        </div>
      </div>

      <DeleteMessageDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        isDeleting={false}
      />
    </>
  );
}
