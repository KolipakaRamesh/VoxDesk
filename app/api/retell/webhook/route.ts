import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyRetellSignature } from '@/lib/retell/verify';
import type { RetellCallEvent, CallOutcome } from '@/lib/types';

/**
 * POST /api/retell/webhook
 *
 * Receives lifecycle events from Retell AI for every call.
 * Persists call data to Supabase call_logs.
 *
 * Events handled:
 * - call_started  → create initial call log record
 * - call_ended    → upsert with duration, transcript, outcome
 * - call_analyzed → update with AI summary/sentiment (future)
 */
export async function POST(req: NextRequest) {
  // ── 1. Verify Retell signature ──────────────────────────────────────────
  const signature = req.headers.get('x-retell-signature') ?? '';
  const rawBody = await req.text();

  if (!verifyRetellSignature(rawBody, signature)) {
    console.warn('[Retell Webhook] Invalid signature — rejecting request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: RetellCallEvent;
  try {
    payload = JSON.parse(rawBody) as RetellCallEvent;
  } catch {
    console.error('[Retell Webhook] Failed to parse JSON body');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, call } = payload;
  console.log(`[Retell Webhook] Event: ${event} | Call: ${call.call_id}`);

  const supabase = createServiceClient();

  try {
    // ── 2. Handle call_started ────────────────────────────────────────────
    if (event === 'call_started') {
      const { error } = await supabase.from('call_logs').insert({
        call_id: call.call_id,
        from_number: call.from_number ?? null,
        to_number: call.to_number ?? null,
        started_at: call.start_timestamp
          ? new Date(call.start_timestamp).toISOString()
          : new Date().toISOString(),
        outcome: 'no_intent' as CallOutcome,
        raw_payload: payload as unknown as Record<string, unknown>,
      });

      if (error) {
        // Upsert fallback — record may already exist (retry scenario)
        if (error.code !== '23505') {
          console.error('[Retell Webhook] call_started insert error:', error);
        }
      }
    }

    // ── 3. Handle call_ended ──────────────────────────────────────────────
    if (event === 'call_ended') {
      const duration =
        call.end_timestamp && call.start_timestamp
          ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
          : null;

      const { error } = await supabase
        .from('call_logs')
        .upsert(
          {
            call_id: call.call_id,
            from_number: call.from_number ?? null,
            to_number: call.to_number ?? null,
            started_at: call.start_timestamp
              ? new Date(call.start_timestamp).toISOString()
              : null,
            ended_at: call.end_timestamp
              ? new Date(call.end_timestamp).toISOString()
              : null,
            duration_secs: duration,
            transcript: call.transcript ?? null,
            outcome: 'no_intent' as CallOutcome, // n8n updates this after booking
            raw_payload: payload as unknown as Record<string, unknown>,
          },
          { onConflict: 'call_id' }
        );

      if (error) {
        console.error('[Retell Webhook] call_ended upsert error:', error);
      }
    }

    // ── 4. Handle call_analyzed ───────────────────────────────────────────
    if (event === 'call_analyzed') {
      const analysis = call.call_analysis;
      if (analysis) {
        const { error } = await supabase
          .from('call_logs')
          .update({ raw_payload: payload as unknown as Record<string, unknown> })
          .eq('call_id', call.call_id);

        if (error) {
          console.error('[Retell Webhook] call_analyzed update error:', error);
        }
      }
    }
  } catch (err) {
    // ── 5. Catch-all: never crash the webhook ─────────────────────────────
    console.error('[Retell Webhook] Unhandled error:', err);
    // Return 204 anyway — we don't want Retell to keep retrying for our DB issues
  }

  // Retell expects a 2xx within 10 seconds
  return new NextResponse(null, { status: 204 });
}
