"use client";

import React from "react";

export interface TabOption<T extends string = string> {
  label: string;
  value: T;
  icon?: React.ElementType;
  badgeCount?: number;
  badgeColor?: "indigo" | "amber" | "emerald" | "rose" | "gray" | string;
}

export interface CustomTabsProps<T extends string = string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const getBadgeStyles = (color?: string, isActive?: boolean) => {
  if (isActive) {
    return "bg-white/25 text-white shadow-2xs";
  }

  switch (color) {
    case "amber":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
    case "emerald":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
    case "rose":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300";
    case "indigo":
    default:
      return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300";
  }
};

export function CustomTabs<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
}: CustomTabsProps<T>) {
  return (
    <div
      className={`inline-flex items-center bg-zinc-100/90 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 shadow-inner flex-wrap gap-1.5 ${className}`}
    >
      {options.map((tab) => {
        const isActive = value === tab.value;
        const Icon = tab.icon;
        const badgeStyle = getBadgeStyles(tab.badgeColor, isActive);

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`rounded-xl text-xs font-bold px-4 py-2.5 flex items-center gap-2 transition-all duration-200 cursor-pointer select-none ${
              isActive
                ? "bg-primary text-primary-foreground shadow-md ring-1 ring-black/10 scale-[1.02]"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
            }`}
          >
            {Icon && <Icon size={14} className="stroke-[2.5]" />}
            <span>{tab.label}</span>
            {tab.badgeCount !== undefined && (
              <span
                className={`ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full transition-colors ${badgeStyle}`}
              >
                {tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
