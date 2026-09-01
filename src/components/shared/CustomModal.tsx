"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  children: React.ReactNode;
  footer?: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  full: "sm:max-w-4xl",
};

export function CustomModal({
  isOpen,
  onOpenChange,
  title,
  description,
  size = "lg",
  children,
  footer,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  onSubmit,
  isSubmitting = false,
  showCloseButton = true,
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          "rounded-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl",
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-zinc-500 font-medium mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {children}
        </div>

        {/* Footer Actions */}
        {footer !== undefined ? (
          footer
        ) : (
          <DialogFooter className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl px-5 text-xs font-semibold text-zinc-700 bg-white border-zinc-200 hover:bg-zinc-100 cursor-pointer shadow-2xs"
            >
              {cancelLabel}
            </Button>
            {onSubmit && (
              <Button
                type="button"
                onClick={(e) => onSubmit(e)}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold px-6 cursor-pointer shadow-xs"
              >
                {isSubmitting && (
                  <Loader2 size={14} className="animate-spin mr-2" />
                )}
                {submitLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
