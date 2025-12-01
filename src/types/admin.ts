export interface Order {
  _id: string;
  customerName: string;
  items: string[];
  total: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
}

export interface Appointment {
  _id: string;
  customerName: string;
  mechanicName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface PendingChange {
  _id: string;
  mechanicId: string;
  mechanicName: string;
  changeType: 'profile_update' | 'service_addition';
  changes: {
    specialty?: string;
    experience?: string;
    phone?: string;
    newService?: string;
    description?: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SystemStats {
  users: {
    total: number;
    clients: number;
    mechanics: number;
    workshops: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
  };
  bookings: {
    total: number;
    pending: number;
    completed: number;
  };
  revenue: {
    total: number;
    fromOrders: number;
    fromBookings: number;
  };
}