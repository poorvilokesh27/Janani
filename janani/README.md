# JANANI

JANANI is a full-stack maternal and reproductive health support website for pregnant women, mothers, and women seeking general reproductive-health information.

## Current experience

The frontend includes a polished landing page and responsive care dashboard with working navigation for pregnancy tracking, appointments, nutrition and wellness, menstrual health, government schemes, educational chat, login, reminders, and profile entry points. The Express API includes JWT authentication, bcrypt password hashing, protected routes, appointment/reminder/profile/scheme/notification/chat endpoints, and an admin user listing endpoint.

The product intentionally excludes hospital locators, emergency locators, GPS, live tracking, maps, and individualized diagnosis or treatment recommendations.

## Stack

- React, Vite, React Router, Lucide React
- Node.js, Express, JWT, bcryptjs
- MySQL with prepared statements through mysql2

## Run locally

Prerequisites: Node.js 20+, npm, and MySQL 8+.

1. Install and start MySQL 8+, then create the database: `mysql -u root -p < database/schema.sql`. For an existing starter database, run the one-time additive migration: `mysql -u root -p janani < database/migrations/001_backend_extensions.sql`.
2. Seed demo content: `mysql -u root -p janani < database/seed.sql`
3. Copy `backend/.env.example` to `backend/.env` and set MySQL values plus a long JWT secret. The backend loads this file by its own location, so it works whether you start it from the repository root or from `backend`.
4. Install dependencies: `npm install` then `npm run install:all`
5. Start both apps: `npm run dev` (or start the API alone with `npm run dev --prefix backend`).
6. Open `http://localhost:5173`

The frontend also works in demo mode without the backend: its navigation and demo-account flow are available for UI review. The real login form uses `VITE_API_URL` when the API is available.

For the grounded JANANI chatbot, create a valid Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey), set `GEMINI_API_KEY` in `backend/.env`, and restart the backend. `GEMINI_MODEL` defaults to `gemini-3.8-flash` and can be changed to another model enabled for the key. If chat reports that Google rejected the credentials, replace the key rather than changing frontend code; do not include quotes or whitespace around the value. The key must remain in the backend environment and must never be placed in frontend code. The chatbot is prompt-grounded in JANANI's pregnancy, postpartum, newborn-care, menstrual, fertility, contraception, PCOS/PCOD, and reproductive-health scope. This is not model training or a substitute for clinical review: it provides general education, refuses diagnosis and medication instructions, and routes possible emergencies to 112 or a hospital.

To verify the backend after MySQL is running, open `http://localhost:5000/api/health`. A healthy response includes `"database":"connected"`; without MySQL it intentionally returns HTTP 503 with `"database":"unavailable"`.

If `/api/health` returns `"status":"misconfigured"`, copy `backend/.env.example` to `backend/.env` and replace the database values and `JWT_SECRET`. Login is intentionally blocked until the API can verify the account against MySQL; the frontend no longer grants an unverified demo login from the login form.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/PUT /api/users/profile`
- `GET/PUT /api/pregnancy/details`
- `GET /api/pregnancy/weeks/:week`
- `GET/POST /api/health-logs`, `DELETE /api/health-logs/:id`
- `GET/POST /api/reminders`, `PATCH /api/reminders/:id`
- `GET/POST /api/appointments`, `PATCH /api/appointments/:id`, `POST /api/appointments/:id/cancel`
- `GET /api/facilities/search?q=&type=hospital|anganwadi&lat=&lng=&radius=`
- `GET /api/users/asha-contact`, `GET /api/emergency/access`
- `GET /api/schemes?search=`, `GET /api/content?search=`
- `GET/POST /api/menstrual-cycles`
- `GET /api/notifications`, `PUT /api/notifications/:id/read`
- `POST /api/chat` (facility lookup and general education only)
- `GET /api/admin/users` (JWT admin role)

## Database relationships

`users` is the central account table. `pregnancy_details`, `appointments`, `vaccination_reminders`, `notifications`, `menstrual_cycles`, and `chat_messages` reference users with cascading foreign keys. `pregnancy_week_content`, `health_content`, `government_schemes`, and `faq` hold administrator-managed educational content. `admin_users` maps elevated admin accounts.

## Safety and data notes

Health content is general educational information and should not replace a qualified healthcare professional. The chat can use Gemini when `GEMINI_API_KEY` is configured in `backend/.env`; without it, the API returns a safe generic fallback. The model is instructed not to diagnose or recommend medicines, and emergency and medication questions use fixed safety replies. Demo scheme and facility records are clearly marked as unverified and must be replaced or verified before production use. SMS reminders are stored as `queued` only when no provider is configured; they are never reported as delivered. Photo search and live location sharing are intentionally not claimed because the current UI and provider configuration do not support them. Emergency access is an explicit, authenticated ninth-month workflow and does not contact emergency services or continuously track location. Secrets and database credentials belong in environment variables and are never exposed to the frontend.

## Testing and API examples

Run syntax/build checks with `npm run build` and `node --check backend/server.js`. The API can be smoke-tested without credentials using `curl http://localhost:5000/api/health`. Authenticated requests use the returned token:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Demo User\",\"email\":\"demo@example.com\",\"password\":\"change-me-123\"}"
curl "http://localhost:5000/api/facilities/search?type=hospital&q=Demo"
```

Database-backed API tests require a disposable MySQL database configured through `backend/.env`; tests never call an SMS provider or external maps service.
## Docker setup (recommended)

From the `janani` folder, copy `backend/.env.example` to `backend/.env`. Replace the JWT, OTP, and encryption placeholders with random secrets before using real personal data. Keep SMS, maps, and Gemini provider keys blank while using console/OSM/rules demo mode. Then run:

```powershell
docker compose --env-file backend/.env -f backend/docker-compose.yml up --build
```

The compose file starts MySQL, Redis, and the API. The API waits for MySQL, applies Prisma migrations, and listens on `http://localhost:4000`; the frontend runs on `http://localhost:5173` with `npm run dev --prefix frontend`. Check API status at `http://localhost:4000/health` and database readiness at `http://localhost:4000/ready`.

For local development without Docker, use MySQL with the configured database and `DATABASE_URL`, then run `npm run prisma:deploy --prefix backend` before `npm run dev --prefix backend`. The frontend's default API address is `http://localhost:4000/api`.

Never commit `backend/.env`. Configure provider credentials only when you are ready to connect a real SMS vendor, Google Maps, or Gemini. Use fake accounts and facility contact details for demos.
