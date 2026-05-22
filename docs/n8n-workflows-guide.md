# VoxDesk — n8n Workflows Guide

## Workflow Files

| File | Purpose | Webhook Path |
|---|---|---|
| `booking-workflow.json` | Receives booking requests, checks calendar, creates event, logs to Supabase | `POST /webhook/book-appointment` |
| `availability-workflow.json` | Checks if a time slot is free on Google Calendar | `POST /webhook/check-availability` |
| `error-handler-workflow.json` | Catches unhandled errors from both workflows, returns proper JSON responses | n/a (Error Trigger) |

---

## Import Order

**Import in this exact order** (error handler must exist before linking it):

1. `error-handler-workflow.json` → Activate it first
2. `availability-workflow.json` → Set error handler → Activate
3. `booking-workflow.json` → Set error handler → Activate

---

## Step-by-Step Setup in n8n Cloud

### 1. Create Google Calendar Credentials

1. Go to **Credentials → New Credential → Google Calendar (Service Account)**
2. Paste your service account email and private key from the JSON key file
3. Name it: `VoxDesk Google Calendar`
4. Share your Google Calendar with the service account email (give it **Editor** access)

### 2. Set Environment Variables in n8n

In your n8n Cloud instance go to **Settings → Environment Variables** and add:

```
GOOGLE_CALENDAR_ID = your-calendar@gmail.com  (or "primary")
SUPABASE_URL       = https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY = eyJ...your-service-role-key
```

> **Note**: In n8n Cloud, environment variables are set under Settings → Variables.
> In self-hosted n8n, add them to your `.env` file as `N8N_CUSTOM_VAR_...`.

### 3. Import Workflows

For each JSON file:
1. Go to **Workflows → Import from file**
2. Select the JSON file
3. The workflow will open in editor

### 4. Configure Google Calendar Nodes

In both `booking-workflow.json` and `availability-workflow.json`:
- Click each **Google Calendar** node
- Under **Credential** → select `VoxDesk Google Calendar`

### 5. Link Error Handler

In each workflow (booking + availability):
1. Click the **...** menu → **Settings**
2. Under **Error Workflow** → select `VoxDesk — Error Handler Workflow`
3. Save

### 6. Activate All Workflows

Activate in this order:
1. Error Handler → Toggle **Active** ON
2. Availability Workflow → Toggle **Active** ON
3. Booking Workflow → Toggle **Active** ON

### 7. Copy Webhook URLs

After activation, click each **Webhook** trigger node to see the production URL:

- **Booking URL** → copy to `.env.local` as `N8N_BOOKING_WEBHOOK_URL`
- **Availability URL** → copy to `.env.local` as `N8N_AVAILABILITY_WEBHOOK_URL`

Also update these in your Retell AI agent's function definitions (see below).

---

## Retell AI Function Definitions

### `check_availability`

Configure in Retell Agent → Custom Functions:

```json
{
  "name": "check_availability",
  "description": "Check if a specific date and time slot is available for booking. Always call this before book_appointment.",
  "url": "YOUR_N8N_AVAILABILITY_WEBHOOK_URL",
  "speak_during_execution": true,
  "speak_after_execution": false,
  "parameters": {
    "type": "object",
    "properties": {
      "requested_date": {
        "type": "string",
        "description": "The requested date in YYYY-MM-DD format, e.g. '2025-08-15'"
      },
      "requested_time": {
        "type": "string",
        "description": "The requested time in 24-hour HH:MM format, e.g. '14:00' for 2 PM"
      },
      "service_type": {
        "type": "string",
        "description": "The type of service requested, e.g. 'haircut', 'massage', 'facial'"
      }
    },
    "required": ["requested_date", "requested_time", "service_type"]
  }
}
```

### `book_appointment`

```json
{
  "name": "book_appointment",
  "description": "Book an appointment after confirming all details with the caller. Only call this after check_availability returns available=true and the caller has confirmed all details.",
  "url": "YOUR_N8N_BOOKING_WEBHOOK_URL",
  "speak_during_execution": true,
  "speak_after_execution": false,
  "parameters": {
    "type": "object",
    "properties": {
      "call_id": {
        "type": "string",
        "description": "The current call ID (use {{call_id}} dynamic variable)"
      },
      "customer_name": {
        "type": "string",
        "description": "Full name of the customer"
      },
      "customer_phone": {
        "type": "string",
        "description": "Customer's phone number"
      },
      "service_type": {
        "type": "string",
        "description": "The type of service to book"
      },
      "requested_date": {
        "type": "string",
        "description": "The appointment date in YYYY-MM-DD format"
      },
      "requested_time": {
        "type": "string",
        "description": "The appointment time in 24-hour HH:MM format"
      },
      "notes": {
        "type": "string",
        "description": "Any additional notes from the caller (optional)"
      }
    },
    "required": ["call_id", "customer_name", "customer_phone", "service_type", "requested_date", "requested_time"]
  }
}
```

---

## Workflow Data Flow

### Booking (Happy Path)
```
Retell → POST /book-appointment
  → Code: Validate & Normalize
  → Google Calendar: Check Slot (freeBusy query)
  → IF: Slot Available? → TRUE
  → Google Calendar: Create Event
  → HTTP: Insert appointment (status=confirmed) → Supabase
  → HTTP: Update call_log (outcome=booking_confirmed) → Supabase
  → Respond: { success: true, appointment_id, google_event_id }
```

### Booking (Slot Taken)
```
Retell → POST /book-appointment
  → ... → IF: Slot Available? → FALSE
  → HTTP: Insert appointment (status=failed) → Supabase
  → HTTP: Update call_log (outcome=booking_failed) → Supabase
  → Respond: { success: false, error_code: "SLOT_UNAVAILABLE" }
```

### Booking (Validation Error)
```
Retell → POST /book-appointment
  → Code: Validate & Normalize → throws VALIDATION_ERROR
  → Error Handler Workflow picks up
  → Respond: { success: false, error_code: "VALIDATION_ERROR", error: "..." }
```

### Availability Check
```
Retell → POST /check-availability
  → Code: Validate & Normalize
  → IF: Skip Check? (outside hours / past) → TRUE → Respond: { available: false }
  → Google Calendar: Check Slot
  → Code: Evaluate Availability (filters cancelled, declined events)
  → Respond: { available: true/false, checked_slot, next_available? }
```

---

## Environment Variables Required

```env
# n8n Cloud → Settings → Variables
GOOGLE_CALENDAR_ID=primary
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...service-role-key-here
```

---

## Testing

### Test availability check locally with curl:
```bash
curl -X POST YOUR_N8N_AVAILABILITY_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "requested_date": "2025-09-01",
    "requested_time": "10:00",
    "service_type": "haircut"
  }'
```

Expected response (slot free):
```json
{ "available": true, "checked_slot": "2025-09-01T10:00:00.000Z" }
```

### Test booking with curl:
```bash
curl -X POST YOUR_N8N_BOOKING_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test-call-001",
    "customer_name": "Jane Smith",
    "customer_phone": "+919876543210",
    "service_type": "massage",
    "requested_date": "2025-09-01",
    "requested_time": "11:00",
    "notes": "Prefers quiet room"
  }'
```

Expected response (success):
```json
{
  "success": true,
  "appointment_id": "uuid-here",
  "google_event_id": "google-event-id",
  "confirmed_start": "2025-09-01T11:00:00.000Z",
  "confirmed_end": "2025-09-01T12:00:00.000Z"
}
```
