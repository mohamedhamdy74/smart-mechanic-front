export interface Booking {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  mechanicId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    specialty?: string;
    rating?: number;
    skills?: string[];
    experienceYears?: number;
  };
  serviceType: string;
  description?: string;
  appointmentDate: string;
  appointmentTime: string;
  carInfo: string;
  licensePlate: string;
  location: string;
  estimatedCost?: number;
  actualCost?: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  mechanicNotes?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  serviceDuration?: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  reviews?: {
    clientId: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }[];
  serviceRecords?: {
    mechanicId: string;
    workDescription: string;
    cost: number;
    parts: {
      name: string;
      cost: number;
    }[];
    laborCost: number;
    createdAt: string;
  }[];
  invoice?: {
    serviceRecordId: string;
    totalAmount: number;
    platformFee: number;
    mechanicAmount: number;
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentMethod?: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  mechanicId: string;
  serviceType: string;
  description?: string;
  appointmentDate: string;
  appointmentTime: string;
  carInfo: string;
  licensePlate: string;
  location: string;
  estimatedCost?: number;
}

export interface UpdateBookingRequest {
  status?: Booking['status'];
  mechanicNotes?: string;
  actualCost?: number;
}

export interface BookingFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  mechanicId?: string;
  customerId?: string;
  serviceType?: string;
}

export interface CompleteBookingRequest {
  workDescription: string;
  cost: number;
  parts: {
    name: string;
    cost: number;
  }[];
  laborCost: number;
}