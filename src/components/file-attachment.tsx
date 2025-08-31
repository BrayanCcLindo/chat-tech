"use client";

import { Button } from "@/components/ui/button";
import { FileText, ImageIcon, Video, Download, X } from "lucide-react";
import type { Attachment } from "@/types/messaging";

interface FileAttachmentProps {
  attachment: Attachment;
  showRemove?: boolean;
  onRemove?: () => void;
}

export function FileAttachment({
  attachment,
  showRemove = false,
  onRemove
}: FileAttachmentProps) {
  const getFileIcon = () => {
    if (attachment?.type.startsWith("image/"))
      return <ImageIcon className="h-4 w-4" />;
    if (attachment?.type.startsWith("video/"))
      return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg max-w-xs">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(attachment.size)}
          </p>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => window.open(attachment.url, "_blank")}
          >
            <Download className="h-3 w-3" />
          </Button>

          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
