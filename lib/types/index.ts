// ─── Retell AI ──────────────────────────────────────────────────────────────

export interface RetellCallEvent {
  event:
    | 'call_started'
    | 'call_ended'
    | 'call_analyzed'
    | 'transcript_updated'
    | string;
  call: {
    call_id: string;
    call_type: 'phone_call' | 'web_call';
    agent_id: string;
    call_status: string;
    from_number?: string;
    to_number?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    disconnection_reason?: string;
    transcript?: string;
    call_analysis?: {
      call_summary?: string;
      user_sentiment?: string;
      call_successful?: boolean;
      custom_analysis_data?: Record<string, unknown>;
    };
    retell_llm_dynamic_variables?: Record<string, string>;
    metadata?: Record<string, unknown>;
  };
}

// ─── Booking Payload (Retell function call → n8n) ───────────────────────────

export interface BookingPayload {
  call_id: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  requested_date: string; // ISO 8601: "2025-08-15"
  requested_time: string; // 24h: "14:00"
  timezone?: string; // e.g. "Asia/Kolkata"
  notes?: string;
}

// ─── Availability Check Payload ──────────────────────────────────────────────

export interface AvailabilityPayload {
  requested_date: string; // "2025-08-15"
  requested_time: string; // "14:00"
  service_type: string;
}

// ─── n8n Booking Response ────────────────────────────────────────────────────

export interface BookingResponse {
  success: boolean;
  appointment_id?: string;
  google_event_id?: string;
  confirmed_start?: string; // ISO 8601
  confirmed_end?: string; // ISO 8601
  error?: string;
  error_code?:
    | 'SLOT_UNAVAILABLE'
    | 'VALIDATION_ERROR'
    | 'CALENDAR_ERROR'
    | 'DB_ERROR';
  alternative_slots?: string[]; // ISO 8601 strings
}

// ─── n8n Availability Response ───────────────────────────────────────────────

export interface AvailabilityResponse {
  available: boolean;
  next_available?: string; // ISO 8601
  checked_slot?: string; // ISO 8601
}

// ─── Supabase Enum Types ─────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'failed';

export type CallOutcome =
  | 'booking_confirmed'
  | 'booking_failed'
  | 'no_intent'
  | 'transferred'
  | 'dropped'
  | 'error';

// ─── Supabase Row Types ──────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  google_event_id?: string;
  call_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  call_id: string;
  from_number?: string;
  to_number?: string;
  started_at?: string;
  ended_at?: string;
  duration_secs?: number;
  transcript?: string;
  outcome: CallOutcome;
  appointment_id?: string;
  error_message?: string;
  raw_payload?: Record<string, unknown>;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  total_appointments: number;
  confirmed_today: number;
  failed_bookings: number;
  total_calls: number;
}
