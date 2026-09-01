"use client";

import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType;
  error?: boolean;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            "h-10 text-xs font-medium rounded-xl border border-zinc-200 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 transition-all placeholder:text-zinc-400",
            Icon && "pl-10",
            error && "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
