"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Loader2, Star, Trophy, CheckCircle2, Circle } from "lucide-react";
import api from "@/lib/axios";

export interface ManageBadgesModalProps {
  userId: string | null;
  userName?: string;
  currentBadge?: string | null;
  currentBadges?: string[] | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BADGES = [
  {
    id: "elite",
    label: "Ekkali Elite Chauffeur",
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    value: "Ekkali Elite Chauffeur",
    description: "Awarded to top-performing drivers with excellent ratings",
  },
  {
    id: "partner",
    label: "Ekkali Partner",
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    value: "Ekkali Partner",
    description: "Official partner chauffeur verified by platform management",
  },
];

export function ManageBadgesModal({
  userId,
  userName,
  currentBadge,
  currentBadges,
  isOpen,
  onOpenChange,
}: ManageBadgesModalProps) {
  // Array of selected badges for multi-select support
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (Array.isArray(currentBadges) && currentBadges.length > 0) {
        setSelectedBadges(currentBadges);
      } else if (currentBadge) {
        setSelectedBadges([currentBadge]);
      } else {
        setSelectedBadges([]);
      }
    }
  }, [isOpen, currentBadge, currentBadges]);

  const toggleBadge = (badgeValue: string) => {
    setSelectedBadges((prev) => {
      if (prev.includes(badgeValue)) {
        return prev.filter((b) => b !== badgeValue);
      } else {
        return [...prev, badgeValue];
      }
    });
  };

  const clearAllBadges = () => {
    setSelectedBadges([]);
  };

  const updateBadgeMutation = useMutation({
    mutationFn: async (badges: string[]) => {
      const res = await api.patch(`/admin/users/${userId}/badge`, {
        badges,
        badge: badges[0] || null,
      });
      return res.data;
    },
    onSuccess: () => {
      const count = selectedBadges.length;
      if (count === 0) {
        toast.success("All badges removed successfully");
      } else if (count === 1) {
        toast.success(`Badge assigned: ${selectedBadges[0]}`);
      } else {
        toast.success(`${count} badges assigned successfully!`);
      }
      queryClient.invalidateQueries({
        queryKey: ["admin-chauffeur-applications"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-chauffeur-stats"] });
      onOpenChange(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update badges");
    },
  });

  const handleSave = () => {
    if (!userId) return;
    updateBadgeMutation.mutate(selectedBadges);
  };

  const isNoBadge = selectedBadges.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Award className="h-6 w-6 text-indigo-500" />
            Manage Badges
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Select one or multiple recognition badges for{" "}
            <strong className="text-zinc-900 font-semibold">
              {userName || "this chauffeur"}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-2.5">
          {/* Badge Options (Multi-select) */}
          {BADGES.map((badge) => {
            const isSelected = selectedBadges.includes(badge.value);
            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => toggleBadge(badge.value)}
                className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/80 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl ${badge.bg} flex items-center justify-center shrink-0 border ${badge.border}`}
                  >
                    <badge.icon className={`h-5 w-5 ${badge.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">
                      {badge.label}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {badge.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 fill-indigo-100" />
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-300" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Option: No Badges / Remove All */}
          <button
            type="button"
            onClick={clearAllBadges}
            className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              isNoBadge
                ? "border-zinc-800 bg-zinc-100/70 shadow-xs"
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                <Award className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 text-sm">
                  No Badge
                </p>
                <p className="text-[11px] text-zinc-500">
                  Remove all badges from this chauffeur
                </p>
              </div>
            </div>

            <div className="shrink-0 ml-3">
              {isNoBadge ? (
                <CheckCircle2 className="h-5 w-5 text-zinc-800 fill-zinc-200" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-300" />
              )}
            </div>
          </button>
        </div>

        {/* Footer info & Actions */}
        <div className="text-[11px] text-zinc-400 px-1">
          {selectedBadges.length > 0 ? (
            <span>
              Selected: <strong className="text-zinc-700">{selectedBadges.join(" + ")}</strong>
            </span>
          ) : (
            <span>No badges selected</span>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateBadgeMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
          >
            {updateBadgeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
