"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/use-messaging";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings, Users } from "lucide-react";

import type { Conversation } from "@/types/messaging";

interface ConversationSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
  onDeleteConversation?: () => void;
  onUpdateConversation?: (updates: Partial<Conversation>) => void;
}

export function ConversationSettingsDialog({
  isOpen,
  onOpenChange,
  conversation,
  onUpdateConversation
}: ConversationSettingsDialogProps) {
  const [conversationName, setConversationName] = useState(
    conversation.name || ""
  );
  const { data: users = [] } = useUsers();

  const userByConversationId = users.find(user => user.id === conversation.id);
  const isGroupConversation = conversation.type === "group";

  const handleSaveName = () => {
    if (conversationName.trim() !== conversation.name) {
      onUpdateConversation?.({ name: conversationName.trim() });
    }
  };

  const getConversationTitle = () => {
    if (isGroupConversation) {
      return conversation.name || "Grupo sin nombre";
    } else {
      return userByConversationId?.name || "Usuario desconocido";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de conversación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-3">
              <AvatarImage
                src={
                  isGroupConversation
                    ? "/group-chat-icon.png"
                    : userByConversationId?.avatar || "/placeholder.svg"
                }
              />
              <AvatarFallback className="text-lg">
                {isGroupConversation
                  ? "G"
                  : getConversationTitle().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{getConversationTitle()}</h3>
            <p className="text-sm text-muted-foreground">
              {isGroupConversation ? "Grupo" : "Conversación directa"}
            </p>
          </div>

          {/* Group Name Editor (only for groups) */}
          {isGroupConversation && (
            <div className="space-y-2">
              <Label htmlFor="conversationName">Nombre del grupo</Label>
              <div className="flex gap-2">
                <Input
                  id="conversationName"
                  value={conversationName}
                  onChange={e => setConversationName(e.target.value)}
                  placeholder="Nombre del grupo"
                />
                <Button
                  size="sm"
                  onClick={handleSaveName}
                  disabled={conversationName.trim() === conversation.name}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Participants */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              <Label>Participante</Label>
            </div>

            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {!isGroupConversation && userByConversationId && (
                  <div
                    key={userByConversationId.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            userByConversationId.avatar || "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {userByConversationId.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {userByConversationId.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userByConversationId.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {userByConversationId.isOnline && (
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                )}
                {isGroupConversation && (
                  <div className="text-muted-foreground text-sm">
                    Participantes no disponibles sin <code>participants</code>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />
        </div>
      </DialogContent>
    </Dialog>
  );
}
