"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageReactionsProps {
  reactions?: Array<{ emoji: string; count: number; userReacted: boolean }>;
  onReact?: (emoji: string) => void;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🎉"];

export function MessageReactions({
  reactions = [],
  onReact
}: MessageReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReactionClick = async (emoji: string) => {
    if (onReact) {
      onReact(emoji);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (onReact) {
      onReact(emoji);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {reactions.map(reaction => (
        <Button
          key={reaction.emoji}
          variant="ghost"
          size="sm"
          onClick={() => handleReactionClick(reaction.emoji)}
          className={cn(
            "h-6 px-2 text-xs rounded-full",
            reaction.userReacted && "bg-primary/20 text-primary"
          )}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiSelect(emoji)}
                className="h-8 w-8 p-0 text-lg hover:bg-muted"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
