"use client";

import type React from "react";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip, X, Upload } from "lucide-react";
import { FileAttachment } from "./file-attachment";
import type { Attachment } from "@/types/messaging";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
  maxSizePerFile?: number;
  acceptedTypes?: string[];
}

export function FileUpload({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  maxFiles = 5,
  maxSizePerFile = 10,
  acceptedTypes = [
    "image/*",
    "video/*",
    "application/pdf",
    ".doc",
    ".docx",
    ".txt"
  ]
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      if (file.size > maxSizePerFile * 1024 * 1024) {
        errors.push(`${file.name} es muy grande (máximo ${maxSizePerFile}MB)`);
        return;
      }

      if (selectedFiles.length + validFiles.length >= maxFiles) {
        errors.push(`Máximo ${maxFiles} archivos permitidos`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      onFilesSelected([...selectedFiles, ...validFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const createAttachmentFromFile = (file: File, index: number): Attachment => ({
    id: `temp-${index}`,
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file)
  });

  return (
    <div className="space-y-2 px-4">
      {selectedFiles.length > 0 && (
        <div className="space-y-2 p-2 bg-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {selectedFiles.length} archivo
              {selectedFiles.length !== 1 ? "s" : ""} seleccionado
              {selectedFiles.length !== 1 ? "s" : ""}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFilesSelected([])}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {selectedFiles
              .slice()
              .reverse()
              .map((file, index) => (
                <FileAttachment
                  key={`${file.name}-${index}`}
                  attachment={createAttachmentFromFile(file, index)}
                  showRemove
                  onRemove={() =>
                    onRemoveFile(selectedFiles.length - 1 - index)
                  }
                />
              ))}
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={e => handleFileSelect(e.target.files)}
        className="hidden"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="h-8 px-2 absolute bottom-2 left-2 translate-y-1/2"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {dragActive && (
        <div
          className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center z-50"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-lg font-medium">Suelta los archivos aquí</p>
            <p className="text-sm text-muted-foreground">
              Máximo {maxFiles} archivos, {maxSizePerFile}MB cada uno
            </p>
          </div>
        </div>
      )}

      <div
        className="fixed inset-0 pointer-events-none"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      />
    </div>
  );
}
