export type JobStatus = 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';

export type RideStatus =
  | 'PENDING'
  | 'ON THE WAY'
  | 'AT THE LOCATION'
  | 'POB'
  | 'FINISHED';

export type JobType = 'ONE WAY' | 'BY THE HOUR';

export type PaymentType = 'CREDIT CARD ON FILE' | 'COLLECT PAYMENT';

export type PaymentStatus = 'PAID' | 'UNPAID';

export type DispatchType =
  | 'ALL CHAUFFEURS'
  | 'TARGETED CHAUFFEURS'
  | 'PERSONAL NOTE';

export interface IUserSummary {
  _id: string;
  name?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  company?: string;
  companyName?: string;
  companyRole?: string;
  averageRating?: number;
  totalReviews?: number;
  selectedVehicle?: string;
  badge?: string;
  badges?: string[];
}

export interface IReview {
  rating: number;
  comment?: string;
  reviewedAt: string | Date;
}

export interface IAdminJob {
  _id: string;
  jobType: JobType;
  pickup: string;
  dropoff: string;
  flightNumber?: string | null;
  asap?: boolean;
  date?: string | Date | null;
  time?: string | null;
  vehicleType: string;
  paymentAmount: number;
  paymentType: PaymentType;
  paymentStatus?: PaymentStatus;
  instruction?: string | null;
  dispatchType: DispatchType;
  isPersonalNote?: boolean;
  passengerName?: string | null;
  passengerPhone?: string | null;
  status: JobStatus;
  rideStatus?: RideStatus | null;
  serviceAreaId?: string;
  serviceArea?: string;
  serviceAreas?: string[];
  companyName?: string | null;
  createdBy: IUserSummary | string;
  assignedTo?: IUserSummary | string | null;
  targetedChauffeurs?: (IUserSummary | string)[];
  applicant?: {
    driver: IUserSummary | string;
    vehicleId?: string;
    appliedAt: string | Date;
  } | null;
  applicantCount?: number;
  reviewByDriver?: IReview | null;
  reviewByCreator?: IReview | null;
  hasReview?: boolean;
  isReviewedByDriver?: boolean;
  isReviewedByCreator?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobStats {
  total: number;
  pending: number;
  assigned: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface JobPagination {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

export interface AdminJobsResponse {
  pagination: JobPagination;
  data: IAdminJob[];
}

export interface JobQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  jobType?: string;
  paymentStatus?: string;
  sort?: string;
}
