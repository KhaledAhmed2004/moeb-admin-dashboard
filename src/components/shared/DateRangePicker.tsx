"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  from?: string;
  to?: string;
  label?: string;
}

export interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
  className?: string;
}

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
];

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(value?.label);
  const [fromDate, setFromDate] = useState<string>(value?.from || "");
  const [toDate, setToDate] = useState<string>(value?.to || "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPreset = (presetLabel: string, presetValue: string) => {
    setSelectedPreset(presetLabel);
    const today = new Date();
    let from = "";
    let to = today.toISOString().split("T")[0];

    if (presetValue === "today") {
      from = to;
    } else if (presetValue === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      from = y.toISOString().split("T")[0];
      to = from;
    } else if (presetValue === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      from = d.toISOString().split("T")[0];
    } else if (presetValue === "30days") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      from = d.toISOString().split("T")[0];
    } else if (presetValue === "this_month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      from = d.toISOString().split("T")[0];
    } else if (presetValue === "last_month") {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      from = first.toISOString().split("T")[0];
      to = last.toISOString().split("T")[0];
    }

    setFromDate(from);
    setToDate(to);
    if (onChange) {
      onChange({ from, to, label: presetLabel });
    }
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (!fromDate && !toDate) return;
    const customLabel = `${fromDate || "..."} to ${toDate || "..."}`;
    setSelectedPreset(customLabel);
    if (onChange) {
      onChange({ from: fromDate, to: toDate, label: customLabel });
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPreset(undefined);
    setFromDate("");
    setToDate("");
    if (onChange) {
      onChange({ from: undefined, to: undefined, label: undefined });
    }
  };

  const displayLabel = selectedPreset || (fromDate && toDate ? `${fromDate} - ${toDate}` : "Date Range");

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 h-10 px-4 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50/80 transition-all shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 cursor-pointer select-none",
          selectedPreset && "border-indigo-300 bg-indigo-50/40 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
        )}
      >
        <Calendar size={15} className="text-zinc-400" />
        <span className="truncate max-w-[140px]">{displayLabel}</span>
        {selectedPreset ? (
          <X
            size={14}
            className="text-zinc-400 hover:text-zinc-700 transition-colors ml-1 cursor-pointer"
            onClick={handleClear}
          />
        ) : (
          <ChevronDown size={14} className="text-zinc-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-3 bg-white/95 backdrop-blur-md border border-zinc-200/90 rounded-2xl shadow-xl dark:bg-zinc-900/95 dark:border-zinc-800 z-50 animate-in fade-in-0 zoom-in-95">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1">
            Quick Presets
          </p>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleSelectPreset(preset.label, preset.value)}
                className={cn(
                  "text-left text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                  selectedPreset === preset.label
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-bold"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
              Custom Range
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
