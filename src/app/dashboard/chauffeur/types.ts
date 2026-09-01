import { Chauffeur } from "./columns";

export interface VehicleRegistration {
  image?: string;
  expiryDate?: string;
  _id?: string;
}

export interface CommercialInsurance {
  image?: string;
  expiryDate?: string;
  _id?: string;
}

export interface VehiclePhotos {
  frontView?: string;
  rearView?: string;
  interiorView?: string;
  _id?: string;
}

export interface ApplicationVehicle {
  _id: string;
  owner?: string;
  type?: string;
  makeAndModel?: string;
  colorInside?: string;
  colorOutside?: string;
  year?: number;
  licensePlate?: string;
  licensePlateRaw?: string;
  vehicleRegistration?: VehicleRegistration;
  commercialInsurance?: CommercialInsurance;
  photos?: VehiclePhotos;
  status?: string;
  rejectionReason?: string | null;
  version?: number;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationDocument {
  _id: string;
  userId?: string;
  entityId?: string | null;
  documentType: string;
  storageKey?: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  expiryDate?: string;
  status: string;
  version?: number;
  scanResult?: unknown;
  scanAttempts?: number;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationServiceArea {
  _id: string;
  areaName: string;
  cities?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationUserDetails {
  _id?: string;
  id?: string;
  name: string;
  role?: string;
  email: string;
  phone: string;
  serviceAreaId?: string;
  languages?: string[];
  experience?: number;
  companyName?: string;
  companyRole?: string;
  profilePicture?: string;
  accountState?: string;
  appState?: string;
  status?: string;
  suspensionOrigin?: string | null;
  deviceTokens?: string[];
  selectedVehicle?: string;
  averageRating?: number;
  totalReviews?: number;
  paymentMethods?: {
    cardPayment?: {
      status?: string;
    };
  };
  loginAttempts?: number;
  lockUntil?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationDetailsData {
  user?: ApplicationUserDetails;
  vehicles?: ApplicationVehicle[];
  documents?: ApplicationDocument[];
  serviceArea?: ApplicationServiceArea;
  subscription?: unknown;
  reviewSummary?: {
    averageRating?: number;
    totalReviews?: number;
  };
}

export interface ChauffeurDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fallbackData?: Chauffeur;
}

export interface PreviewFileState {
  isOpen: boolean;
  title: string;
  url: string;
  isPdf: boolean;
}
