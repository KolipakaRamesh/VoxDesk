-- ============================================================
-- VoxDesk — Supabase Schema (Reference)
-- Reflects the actual tables used in production.
-- Run in Supabase SQL Editor if setting up from scratch.
-- ============================================================

-- ============================================================
-- APPOINTMENTS
-- Stores every booking made by the AI receptionist via n8n.
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id                  BIGSERIAL PRIMARY KEY,
  name                TEXT        NOT NULL,
  phone               TEXT        NOT NULL,
  email               TEXT,
  appointment_date    DATE        NOT NULL,
  appointment_time    TEXT        NOT NULL,  -- "HH:MM" 24-hour format
  status              TEXT        NOT NULL DEFAULT 'pending',
                                            -- 'confirmed' | 'pending' | 'cancelled' | 'failed'
  cancellation_reason TEXT,
  calendar_event_id   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date   ON appointments(appointment_date DESC);

-- ============================================================
-- ERROR LOGS
-- Stores errors that occurred during the n8n booking workflow.
-- ============================================================
CREATE TABLE IF NOT EXISTS error_logs (
  id               BIGSERIAL PRIMARY KEY,
  error_type       TEXT        NOT NULL,
  error_message    TEXT        NOT NULL,
  appointment_data JSONB,                   -- snapshot of booking data at time of error
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);

-- ============================================================
-- NOTES
-- RLS is disabled for MVP — all access uses service_role key.
-- Enable RLS in a future version when auth is added.
-- ============================================================
