# VoxDesk — AI Voice Receptionist

> An AI-powered voice receptionist platform for service-based businesses. Answers calls, books appointments, checks Google Calendar, and logs everything to Supabase.

---

## Architecture

```
[Caller] → [Vobiz (Telephony)] → [Retell AI Agent]
                              ↓ (function call)
                       [n8n Workflow]
                         ↙        ↘
              [Google Calendar]  [Supabase]
              Check / Create      Log call + booking
                         ↘
                    [Retell AI] speaks confirmation
                              ↓
                       [Next.js Dashboard]
                       /appointments
                       /call-logs
                       /failed-bookings
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend / Dashboard | Next.js 16, Tailwind CSS, shadcn/ui |
| Voice | Retell AI + Vobiz |
| Workflow | n8n |
| Database | Supabase (PostgreSQL) |
| Calendar | Google Calendar API |
| Deployment | Vercel + n8n Cloud + Supabase Cloud |

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
# Fill in all values — see .env.local.example for instructions
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open SQL Editor and run:

```sql
-- paste contents of supabase/migrations/001_init.sql
```

### 4. Set Up n8n

1. Sign up at [n8n.io/cloud](https://n8n.io/cloud) or run Docker:
   ```bash
   docker run -it -p 5678:5678 -v ~/.n8n:/home/node/.n8n docker.n8n.io/n8nio/n8n
   ```
2. Import all three workflows **in this order**:
   - `n8n/workflows/error-handler-workflow.json` (activate first)
   - `n8n/workflows/availability-workflow.json`
   - `n8n/workflows/booking-workflow.json`
3. Configure Google Calendar credentials (Service Account) on both workflows
4. Link the error handler workflow in each workflow's Settings → Error Workflow
5. Activate all workflows and copy the webhook URLs to `.env.local`:
   * By default, n8n generates two URLs:
     * `N8N_BOOKING_WEBHOOK_URL` -> `https://<instance>/webhook/book-appointment`
     * `N8N_AVAILABILITY_WEBHOOK_URL` -> `https://<instance>/webhook/check-availability`
   * If you configure a unified router, you can point both to a single endpoint (e.g., `https://<instance>/webhook/retell-agent`).
6. **Authentication & Security (`N8N_WEBHOOK_SECRET`)**:
   * To secure your n8n endpoints, you can pass a custom authorization header from Retell to n8n (e.g. `Authorization: Bearer <your-secret-token>`).
   * Define this token in `.env.local` as `N8N_WEBHOOK_SECRET`.
   * Enable "Header Auth" inside your n8n webhook nodes to validate this token.

> See `docs/n8n-workflows-guide.md` for full setup instructions and Retell function definitions.

### 5. Set Up Retell AI

1. Create an account at [retellai.com](https://retellai.com)
2. Create a new AI agent
3. Paste the system prompt from `docs/retell-prompt.md`
4. Add two functions:
   - `check_availability` → Point to your `N8N_AVAILABILITY_WEBHOOK_URL`
   - `book_appointment` → Point to your `N8N_BOOKING_WEBHOOK_URL`
5. Copy Agent ID to `.env.local`

### 6. Connect Vobiz (Telephony)

1. Provision your phone number or SIP trunk in Vobiz.
2. In the Retell Dashboard under the Inbound/SIP section, link your Vobiz SIP trunk / number to your Retell Agent ID.

### 7. Run Locally

```bash
npm run dev
```

Visit: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/retell/webhook` | Receives call lifecycle events from Retell AI |
| `GET` | `/api/health` | Liveness probe |

---

## Dashboard Pages

| Page | Path | Description |
|---|---|---|
| Overview | `/dashboard` | Stats + recent activity |
| Appointments | `/dashboard/appointments` | All bookings with status |
| Call Logs | `/dashboard/call-logs` | Full call history with transcripts |
| Failed Bookings | `/dashboard/failed-bookings` | Bookings requiring attention |

---

## Project Structure

```
voxdesk/
├── app/                  # Next.js App Router
│   ├── api/
│   │   ├── retell/webhook/route.ts
│   │   └── health/route.ts
│   └── dashboard/        # All dashboard pages
├── components/
│   ├── dashboard/        # Table + badge components
│   └── shared/           # PageHeader
├── lib/
│   ├── supabase/         # Client + server Supabase clients
│   ├── retell/           # Webhook signature verification
│   ├── types/            # All TypeScript interfaces
│   └── utils.ts          # Shared utilities
├── n8n/workflows/        # Importable n8n workflow JSON
├── supabase/migrations/  # SQL schema migration
└── docs/                 # Retell system prompt
```

---

## Deployment

### Vercel

```bash
npx vercel --prod
```

Set all environment variables in Vercel project settings.

### Environment Variables Required in Production

See `.env.local.example` for the full list.

---

## MVP Status

- [x] Next.js 15 project scaffold
- [x] TypeScript interfaces
- [x] Supabase schema (customers, appointments, call_logs)
- [x] Retell AI webhook receiver
- [x] n8n booking workflow (importable JSON) — v2: full call_log update on fail path
- [x] n8n availability workflow (importable JSON)
- [x] n8n error handler workflow (catches validation errors)
- [x] Google Calendar integration (via n8n)
- [x] Admin dashboard (Overview, Appointments, Call Logs, Failed Bookings)
- [x] Retell AI system prompt
- [x] Retell function definitions documented (`docs/n8n-workflows-guide.md`)
- [ ] Retell agent live configuration (add functions in Retell dashboard)
- [ ] Twilio number connected
- [ ] n8n workflows deployed + activated
- [ ] Production deployment to Vercel

---

## License

Private — VoxDesk MVP. All rights reserved.
