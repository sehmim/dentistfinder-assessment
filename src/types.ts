// User and Authentication Types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface UserContext {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserContext;
}



// Appointment Types - Raw Data
export interface RawAppointment {
  id: string;
  date: string;
  doctorId: string;
  doctorName: string;
  slots: string[];
  appointmentType: string;
}

// Mock API Response Types (Inconsistent Formats)
export interface MockAPIFormatA {
  date: string;
  times: string[];
  doctor: {
    name: string;
    id: string;
  };
  type: string;
}

export interface MockAPIFormatB {
  available_on: string;
  slots: Array<{
    start: string;
    end: string;
  }>;
  provider: string;
  category: string;
}

export type MockAPIResponse = MockAPIFormatA | MockAPIFormatB;

export type MessyAPIResponse = MessyFormatA | MessyFormatB | MessyFormatC;

// Unified Internal API Response
export interface UnifiedSlot {
  date: string;
  start_time: string;
  provider: string;
}

export interface MessyFormatA {
  date: string;
  times: string[];
  doctor: {
    name: string;
    id: string;
  };
  type: string;
}

export interface MessyFormatB {
  available_on: string;
  slots: Array<{
    start: string;
    end: string;
  }>;
  provider: string;
  category: string;
}

export interface MessyFormatC {
  appointment_day: string;
  free_slots: string[];
  physician_name: string;
  physician_code: string;
  service_type: string;
  duration_minutes: number;
}

// API Response Wrappers
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query Parameters
export interface SlotQueryParams {
  provider?: string;
  date?: string;
  page?: number;
  limit?: number;
}

// Express Request Extensions
declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}