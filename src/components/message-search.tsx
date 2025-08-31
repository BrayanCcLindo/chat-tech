"use client";

import { useState } from "react";
import { useSearchMessages } from "@/hooks/use-messaging";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Search, X } from "lucide-react";

interface MessageSearchProps {
  conversationId?: string;
  onMessageSelect?: (messageId: string) => void;
}

export function MessageSearch({
  conversationId,
  onMessageSelect
}: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: searchResults = [], isLoading } = useSearchMessages(
    searchQuery,
    conversationId
  );

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Buscar mensajes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en los mensajes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Buscando...</div>
              </div>
            ) : searchResults.length === 0 && searchQuery.length > 2 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  No se encontraron mensajes
                </div>
              </div>
            ) : searchQuery.length <= 2 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  Escribe al menos 3 caracteres para buscar
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-2">
                {searchResults.map(message => (
                  <div
                    key={message.id}
                    className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      onMessageSelect?.(message.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
