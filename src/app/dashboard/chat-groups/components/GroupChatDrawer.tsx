"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Users, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { ChatGroupService } from "@/services/chatGroupService";
import { IGroupChat, IGroupMessage } from "@/types/chatGroup";

interface GroupChatDrawerProps {
  group: IGroupChat | null;
  isOpen: boolean;
  onClose: () => void;
  onGroupUpdated?: () => void;
}

export function GroupChatDrawer({
  group,
  isOpen,
  onClose,
  onGroupUpdated,
}: GroupChatDrawerProps) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const groupId = group?._id;

  // Fetch current admin profile to identify "My Messages"
  const { data: myProfile } = useQuery({
    queryKey: ["admin-profile-me"],
    queryFn: async () => {
      try {
        const res = await api.get("/user/profile").catch(async () => {
          return await api.get("/users/profile").catch(async () => {
            return await api.get("/user/me").catch(async () => {
              return await api.get("/auth/me");
            });
          });
        });
        return res?.data?.data || res?.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Decode JWT payload from cookie
  const jwtUser = useMemo(() => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) return null;
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }, []);

  // LocalStorage cached profile
  const localAdmin = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("admin_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const myId =
    myProfile?._id ||
    myProfile?.id ||
    jwtUser?.id ||
    jwtUser?._id ||
    jwtUser?.userId ||
    jwtUser?.sub ||
    localAdmin?._id ||
    localAdmin?.id ||
    "";

  const myEmail = (
    myProfile?.email ||
    jwtUser?.email ||
    localAdmin?.email ||
    ""
  ).toLowerCase();

  const myName = (
    myProfile?.name ||
    localAdmin?.name ||
    ""
  ).toLowerCase();

  // Polling query: fetches latest 50 messages every 3s when drawer is open
  const {
    data: messages = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["group-messages", groupId],
    queryFn: () => (groupId ? ChatGroupService.getGroupMessages(groupId) : []),
    enabled: Boolean(groupId && isOpen),
    refetchInterval: isOpen ? 3000 : false,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (msgText: string) => {
      if (!groupId) throw new Error("Missing group ID");
      return ChatGroupService.sendMessage(groupId, msgText);
    },
    onSuccess: (newMsg) => {
      setText("");
      queryClient.setQueryData(
        ["group-messages", groupId],
        (prev: IGroupMessage[] = []) => [...prev, newMsg]
      );
      queryClient.invalidateQueries({ queryKey: ["chat-groups"] });
      if (onGroupUpdated) onGroupUpdated();
    },
    onError: (err: unknown) => {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.message ||
        "Failed to send message";
      toast.error(msg);
    },
  });

  const handleSend = () => {
    if (!text.trim() || sendMutation.isPending) return;
    sendMutation.mutate(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isArchived = group?.status === "ARCHIVED";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        showCloseButton={false}
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between gap-3 space-y-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800 shrink-0">
              <AvatarImage src={group?.avatar || undefined} />
              <AvatarFallback className="font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                {group?.name?.charAt(0).toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {group?.name || "Chat Group"}
              </SheetTitle>
              <SheetDescription className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5 truncate">
                <Users className="h-3 w-3 text-zinc-400" />
                <span>
                  {group?.participants?.length || 0} participants
                </span>
                {isArchived && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-zinc-100 text-zinc-600">
                    Archived
                  </Badge>
                )}
              </SheetDescription>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
              onClick={() => refetch()}
              title="Refresh messages"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin text-indigo-600" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
              onClick={onClose}
              title="Close drawer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading group conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <Users className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/50" />
              <p className="font-medium text-sm">No messages yet</p>
              <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
                Start the conversation! Messages sent here will broadcast to all group members.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderObj =
                typeof msg.sender === "object" && msg.sender !== null
                  ? msg.sender
                  : null;
              const senderId =
                senderObj?._id ||
                senderObj?.id ||
                (typeof msg.sender === "string" ? msg.sender : "");
              const senderName =
                senderObj?.name ||
                (typeof msg.sender === "string" ? "User" : "Member");
              const senderAvatar = senderObj?.profilePicture || undefined;
              const senderEmail = (senderObj?.email || "").toLowerCase();
              const senderRole = (senderObj?.role || "").toUpperCase();

              const isMyMessage = Boolean(
                (myId && senderId && myId.toString() === senderId.toString()) ||
                (myEmail && senderEmail && myEmail === senderEmail) ||
                (myName && senderName.toLowerCase() === myName) ||
                senderRole === "ADMIN" ||
                senderRole === "SUPER_ADMIN" ||
                senderName.toLowerCase().includes("admin")
              );

              const formattedTime = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              if (isMyMessage) {
                return (
                  <div
                    key={msg._id || idx}
                    className="flex flex-col items-end ml-auto max-w-[82%] space-y-1"
                  >
                    <div className="flex items-baseline gap-1.5 px-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formattedTime}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        You
                      </span>
                    </div>

                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-xs px-3.5 py-2 text-sm shadow-xs break-words">
                      {msg.text}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, aIdx) => (
                            <a
                              key={aIdx}
                              href={att}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-100 hover:text-white underline block truncate"
                            >
                              View Attachment {aIdx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg._id || idx}
                  className="flex gap-2.5 items-start max-w-[85%]"
                >
                  <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                    <AvatarImage src={senderAvatar} />
                    <AvatarFallback className="text-[10px] font-bold">
                      {senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground/90 truncate">
                        {senderName}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formattedTime}
                      </span>
                    </div>

                    <div className="bg-card border border-zinc-200/80 dark:border-zinc-800 rounded-2xl rounded-tl-xs px-3.5 py-2 text-sm text-foreground shadow-xs break-words">
                      {msg.text}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, aIdx) => (
                            <a
                              key={aIdx}
                              href={att}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary underline block truncate"
                            >
                              View Attachment {aIdx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t bg-white dark:bg-zinc-900">
          {isArchived ? (
            <div className="p-2.5 text-center text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              This group is archived and read-only.
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a message to group members..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sendMutation.isPending}
                className="flex-1 text-xs h-10 rounded-xl border-zinc-200 dark:border-zinc-800"
              />
              <Button
                onClick={handleSend}
                disabled={!text.trim() || sendMutation.isPending}
                size="icon"
                className="shrink-0 h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
