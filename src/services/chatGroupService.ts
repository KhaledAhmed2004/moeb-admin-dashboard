import api from "@/lib/axios";
import { ApiResponse } from "../types/supportAdmin";
import {
  IGroupChat,
  IGroupMessage,
  ICreateGroupChatPayload,
  IUpdateGroupChatPayload,
  IGroupChatQueryParams,
  IGroupParticipant,
} from "../types/chatGroup";

export const ChatGroupService = {
  // Fetch all chat groups
  getAllGroups: async (params?: IGroupChatQueryParams): Promise<IGroupChat[]> => {
    const res = await api.get<ApiResponse<IGroupChat[]>>("/chats/groups", {
      params: {
        isGroup: "true",
        ...params,
      },
    });
    const list = res.data?.data || [];
    return Array.isArray(list) ? list.filter((c) => c.isGroup) : [];
  },

  // Fetch single chat group details
  getGroupById: async (groupId: string): Promise<IGroupChat> => {
    const res = await api.get<ApiResponse<IGroupChat>>(`/chats/${groupId}`);
    return res.data?.data;
  },

  // Create a new group chat
  createGroup: async (payload: ICreateGroupChatPayload): Promise<IGroupChat> => {
    const res = await api.post<ApiResponse<IGroupChat>>("/chats/groups", payload);
    return res.data?.data;
  },

  // Update existing group chat details (name, description, avatar)
  updateGroup: async (
    groupId: string,
    payload: IUpdateGroupChatPayload
  ): Promise<IGroupChat> => {
    const res = await api.patch<ApiResponse<IGroupChat>>(
      `/chats/groups/${groupId}`,
      payload
    );
    return res.data?.data;
  },

  // Add participants to group chat
  addParticipants: async (
    groupId: string,
    participants: string[]
  ): Promise<IGroupChat> => {
    const res = await api.post<ApiResponse<IGroupChat>>(
      `/chats/groups/${groupId}/participants`,
      { participants }
    );
    return res.data?.data;
  },

  // Remove participant from group chat
  removeParticipant: async (
    groupId: string,
    userId: string
  ): Promise<IGroupChat> => {
    const res = await api.delete<ApiResponse<IGroupChat>>(
      `/chats/groups/${groupId}/participants/${userId}`
    );
    return res.data?.data;
  },

  // Delete/soft-delete group chat
  deleteGroup: async (groupId: string): Promise<boolean> => {
    const res = await api.delete<ApiResponse<{ deleted: boolean }>>(
      `/chats/groups/${groupId}`
    );
    return res.data?.data?.deleted ?? true;
  },

  // Fetch messages of a group
  getGroupMessages: async (
    chatId: string,
    limit: number = 50
  ): Promise<IGroupMessage[]> => {
    const res = await api.get<ApiResponse<IGroupMessage[]>>(`/messages/${chatId}`, {
      params: { limit },
    });
    const raw = res.data?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray((raw as any).result)) return (raw as any).result;
    if (raw && Array.isArray((raw as any).messages)) return (raw as any).messages;
    return [];
  },

  // Send a message in a group
  sendMessage: async (
    chatId: string,
    text: string,
    attachments?: string[]
  ): Promise<IGroupMessage> => {
    const res = await api.post<ApiResponse<IGroupMessage>>(`/messages/${chatId}`, {
      text,
      attachments,
    });
    return res.data?.data;
  },

  // Search/fetch users to add into groups
  getAvailableUsers: async (searchTerm?: string): Promise<IGroupParticipant[]> => {
    try {
      const res = await api.get("/user", {
        params: {
          limit: 100,
          searchTerm: searchTerm || undefined,
        },
      });
      const resData = res.data;
      let rawList: any[] = [];
      if (Array.isArray(resData?.data)) {
        rawList = resData.data;
      } else if (Array.isArray(resData?.data?.result)) {
        rawList = resData.data.result;
      } else if (Array.isArray(resData?.data?.users)) {
        rawList = resData.data.users;
      } else if (Array.isArray(resData?.result)) {
        rawList = resData.result;
      } else if (Array.isArray(resData?.users)) {
        rawList = resData.users;
      } else if (Array.isArray(resData)) {
        rawList = resData;
      }

      return rawList.map((u) => ({
        _id: u._id || u.id,
        id: u.id || u._id,
        name: u.name || u.nickname || u.email || "Unknown User",
        email: u.email,
        profilePicture: u.profilePicture || null,
        role: u.role,
        phone: u.phone,
      }));
    } catch (err) {
      console.error("Error fetching available users:", err);
      return [];
    }
  },
};
