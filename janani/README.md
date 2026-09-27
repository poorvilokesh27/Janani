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

1. Install and start MySQL 8+, then create the database: `mysql -u root -p < database/schema.sql`
2. Seed demo content: `mysql -u root -p janani < database/seed.sql`
3. Copy `backend/.env.example` to `backend/.env` and set MySQL values plus a long JWT secret.
4. Install dependencies: `npm install` then `npm run install:all`
5. Start both apps: `npm run dev`
6. Open `http://localhost:5173`

The frontend also works in demo mode without the backend: its navigation and demo login flow are available for UI review.

To verify the backend after MySQL is running, open `http://localhost:5000/api/health`. A healthy response includes `"database":"connected"`; without MySQL it intentionally returns HTTP 503 with `"database":"unavailable"`.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/PUT /api/users/profile`
- `GET /api/pregnancy/weeks/:week`
- `GET/POST /api/reminders`
- `GET/POST /api/appointments`
- `GET /api/schemes?search=`
- `GET /api/notifications`, `PUT /api/notifications/:id/read`
- `POST /api/chat`
- `GET /api/admin/users` (JWT admin role)

## Database relationships

`users` is the central account table. `pregnancy_details`, `appointments`, `vaccination_reminders`, `notifications`, `menstrual_cycles`, and `chat_messages` reference users with cascading foreign keys. `pregnancy_week_content`, `health_content`, `government_schemes`, and `faq` hold administrator-managed educational content. `admin_users` maps elevated admin accounts.

## Safety and data notes

Health content is general educational information and should not replace a qualified healthcare professional. Demo scheme records are clearly marked and must be replaced or verified before production use. Secrets and database credentials belong in environment variables and are never exposed to the frontend.
