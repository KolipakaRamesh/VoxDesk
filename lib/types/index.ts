// ─── Retell AI Webhook Payload ───────────────────────────────────────────────

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

/**
 * Used by the Retell webhook route to type call outcomes.
 * Kept for API-layer compatibility.
 */
export type CallOutcome =
  | 'booking_confirmed'
  | 'booking_failed'
  | 'no_intent'
  | 'transferred'
  | 'dropped'
  | 'error';

// ─── Supabase Enum Types ─────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'failed';

// ─── Supabase Row Types ──────────────────────────────────────────────────────

/**
 * Matches the real `appointments` table in Supabase.
 */
export interface Appointment {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  appointment_date: string;       // date column → "YYYY-MM-DD"
  appointment_time: string;       // text column → "HH:MM" (24h)
  created_at: string;             // timestamp
  status: AppointmentStatus;
  cancellation_reason?: string | null;
  calendar_event_id?: string | null;
}

/**
 * Matches the real `error_logs` table in Supabase.
 * Stores errors that occurred during the n8n workflow.
 */
export interface ErrorLog {
  id: number;
  error_type: string;
  error_message: string;
  created_at: string;             // timestamp
  appointment_data?: Record<string, unknown> | null; // jsonb
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  total_appointments: number;
  confirmed_appointments: number;
  failed_appointments: number;
  total_errors: number;
}
