"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  maxLength?: number;
}

export const CustomTextarea = forwardRef<
  HTMLTextAreaElement,
  CustomTextareaProps
>(({ className, error, maxLength, value, onChange, ...props }, ref) => {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={cn(
          "w-full min-h-[90px] p-3 text-xs font-medium rounded-xl border border-zinc-200 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 transition-all placeholder:text-zinc-400 resize-y",
          error && "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500",
          className
        )}
        {...props}
      />
      {maxLength && (
        <span className="absolute right-3 bottom-2 text-[10px] font-semibold text-zinc-400 pointer-events-none">
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  );
});

CustomTextarea.displayName = "CustomTextarea";
