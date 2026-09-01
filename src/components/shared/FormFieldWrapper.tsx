"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldWrapperProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldWrapper({
  label,
  htmlFor,
  required = false,
  error,
  description,
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label
            htmlFor={htmlFor}
            className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </Label>
        </div>
      )}
      {children}
      {description && !error && (
        <p className="text-[11px] text-zinc-400 font-medium">{description}</p>
      )}
      {error && (
        <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 animate-in fade-in-0">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
}
