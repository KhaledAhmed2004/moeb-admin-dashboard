/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// import {
//   addMessage,
//   selectSelectedRoomId,
//   selectSelectedRoomMessages,
//   setRoomMessages,
// } from "@/redux/features/messageSlice";
// import {
//   useGetChatMessagesQuery,
//   useSendMessageMutation,
// } from "@/redux/service/chat/chatApi";
// import { RootState } from "@/redux/store";
import { Loader2, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const normalizeApiMessages = (apiData: any[]) =>
  apiData.map((m) => ({
    id: m._id,
    roomId: m.chatId,
    text: m.text,
    senderId: typeof m.sender === "object" ? m.sender._id : m.sender,
    senderName: typeof m.sender === "object" ? m.sender.name : "",
    senderAvatar: typeof m.sender === "object" ? m.sender.profilePicture : "",
    createdAt: m.createdAt,
  }));

const normalizeSendMessage = (data: any) => ({
  id: data._id,
  roomId: data.chatId,
  text: data.text,
  senderId: typeof data.sender === "object" ? data.sender._id : data.sender,
  createdAt: data.createdAt,
});

export default function ChatComponent() {
  return (
    <div className="flex flex-col min-h-[60vh] p-6 text-center text-gray-500">
      Chat functionality requires Redux store which is currently missing.
    </div>
  );
}
