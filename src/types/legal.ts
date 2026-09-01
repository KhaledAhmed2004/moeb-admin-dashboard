export interface ILegalPage {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateLegalPayload {
  title: string;
  content: string;
}

export interface UpdateLegalPayload {
  title?: string;
  content?: string;
}

export interface LegalApiResponse<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  data: T;
}
