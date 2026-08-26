"use client";

import React from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  contentClassName?: string;
}

export function MyModal({
  open,
  onOpenChange,
  children,
  showCloseButton = true,
  contentClassName,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="text-lg font-medium sr-only">Modal</DialogTitle>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(contentClassName, " overflow-hidden")}
      >
        <div className="py-4 max-h-[90vh] overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
