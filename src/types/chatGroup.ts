export interface IGroupParticipant {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  profilePicture?: string | null;
  role?: string;
  phone?: string;
}

export interface IGroupMessage {
  _id: string;
  id?: string;
  chatId: string;
  sender: IGroupParticipant | string;
  text?: string;
  attachments?: string[];
  replyTo?: {
    _id: string;
    text?: string;
    attachments?: string[];
    sender?: IGroupParticipant | string;
    createdAt?: string;
  } | null;
  readBy?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface IGroupChat {
  _id: string;
  id?: string;
  isGroup: boolean;
  name: string;
  description?: string | null;
  avatar?: string | null;
  groupAdmin?: IGroupParticipant | string;
  createdBy?: IGroupParticipant | string;
  participants: IGroupParticipant[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DISABLED';
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateGroupChatPayload {
  name: string;
  description?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DISABLED';
  participants?: string[];
}

export interface IUpdateGroupChatPayload {
  name?: string;
  description?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DISABLED';
}

export interface IAddGroupParticipantsPayload {
  participants: string[];
}

export interface IGroupChatQueryParams {
  searchTerm?: string;
  isGroup?: 'true' | 'false';
  page?: number;
  limit?: number;
}
