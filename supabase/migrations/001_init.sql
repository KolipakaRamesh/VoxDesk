-- ============================================================
-- VoxDesk MVP — Initial Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TYPE IF NOT EXISTS appointment_status AS ENUM (
  'pending', 'confirmed', 'cancelled', 'failed'
);

CREATE TABLE IF NOT EXISTS appointments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  service_type    TEXT NOT NULL,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  status          appointment_status DEFAULT 'pending',
  google_event_id TEXT,
  call_id         TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_status   ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start    ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_call_id  ON appointments(call_id);

-- ============================================================
-- CALL LOGS
-- ============================================================
CREATE TYPE IF NOT EXISTS call_outcome AS ENUM (
  'booking_confirmed',
  'booking_failed',
  'no_intent',
  'transferred',
  'dropped',
  'error'
);

CREATE TABLE IF NOT EXISTS call_logs (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id        TEXT NOT NULL UNIQUE,
  from_number    TEXT,
  to_number      TEXT,
  started_at     TIMESTAMPTZ,
  ended_at       TIMESTAMPTZ,
  duration_secs  INT,
  transcript     TEXT,
  outcome        call_outcome DEFAULT 'no_intent',
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  error_message  TEXT,
  raw_payload    JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_call_id    ON call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_outcome    ON call_logs(outcome);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at DESC);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER for appointments
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- NOTES
-- ============================================================
-- RLS is NOT enabled in V1 (MVP).
-- All DB access goes through service_role key on the server.
-- RLS will be introduced in V2 when user auth is added.
--
-- To verify tables:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public';
