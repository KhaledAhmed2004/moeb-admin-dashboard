"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  label: string;
  value: string;
  icon?: React.ElementType;
  badge?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  options: CustomSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  size?: "sm" | "default";
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  size = "default",
}: CustomSelectProps) {
  return (
    <div className={cn("relative inline-block text-left", className)}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          size={size}
          className={cn(
            "h-10 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50/80 transition-all shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 cursor-pointer",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className={cn(
            "p-1 bg-white/95 backdrop-blur-md border border-zinc-200/90 rounded-xl shadow-lg dark:bg-zinc-900/95 dark:border-zinc-800 z-50 min-w-[9rem]",
            contentClassName
          )}
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="rounded-lg text-xs font-semibold py-2 px-3 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon size={14} className="text-zinc-400" />}
                  <span>{opt.label}</span>
                  {opt.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-zinc-100 text-zinc-600">
                      {opt.badge}
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
