export interface ServiceArea {
  _id: string;
  areaName: string;
  status: "ACTIVE" | "INACTIVE";
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
