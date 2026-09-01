"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { cn, getMediaUrl } from "@/lib/utils";

export interface ImageUploaderProps {
  value?: string;
  onChange?: (imageUrl: string) => void;
  maxSizeMB?: number;
  className?: string;
  error?: string;
}

export function ImageUploader({
  value,
  onChange,
  maxSizeMB = 5,
  className,
  error,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setFileError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setFileError(undefined);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    if (onChange) {
      onChange(objectUrl);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(undefined);
    setFileError(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative group rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 h-36 flex items-center justify-center">
          <img
            src={getMediaUrl(preview)}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-white/90 text-zinc-800 hover:bg-white text-xs font-bold transition-colors cursor-pointer"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 text-xs font-bold transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-xl p-5 text-center bg-zinc-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group",
            (error || fileError) && "border-rose-300 bg-rose-50/20"
          )}
        >
          <div className="p-3 rounded-full bg-white shadow-2xs group-hover:scale-110 transition-transform">
            <UploadCloud size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-700 group-hover:text-indigo-600 transition-colors">
              Click to upload cover image
            </p>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
              PNG, JPG, WEBP up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {(error || fileError) && (
        <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
          <AlertCircle size={12} /> {error || fileError}
        </p>
      )}
    </div>
  );
}
