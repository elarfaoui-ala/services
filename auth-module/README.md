# Auth Module

A production-ready authentication module built with **NestJS** (backend) and **Next.js 14** (frontend).
Drop it into any project as a starting point for authentication.

## Features

- **Auth**: Register, Login, Logout, JWT access (15m) + refresh token (7d) with rotation
- **RBAC**: Role-based access control (`user`, `admin`)
- **Email verification**: Verify email on registration
- **Password reset**: Forgot password / reset password flow
- **Rate limiting**: 20 req/min global, stricter limits on auth endpoints
- **Auto-refresh**: Frontend auto-refreshes expired tokens before showing login
- **Security**: bcrypt (12 rounds), `class-validator` input validation, CORS
- **Swagger ready**: API docs at `/api/docs` (install `@nestjs/swagger` to enable)
- **Health check**: `GET /api/health`
- **Structured logging**: Request logger middleware + exception filter
- **Docker**: Docker Compose with PostgreSQL healthcheck
- **TypeScript**: Strict mode throughout

## Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Backend    | NestJS, Passport, JWT, bcryptjs               |
| Frontend   | Next.js 14 (App Router), Tailwind             |
| Database   | PostgreSQL 16, Drizzle ORM                    |
| DevOps     | Docker, Docker Compose                        |

## API Endpoints

| Method | Path                   | Auth          | Rate        | Description                    |
|--------|------------------------|---------------|-------------|--------------------------------|
| POST   | /api/auth/register     | Public        | 5/min       | Create account                 |
| POST   | /api/auth/login        | Public        | 10/min      | Login, get tokens              |
| POST   | /api/auth/refresh      | Public        | 5/min       | Rotate refresh token           |
| POST   | /api/auth/logout       | Bearer        | 20/min      | Revoke refresh token           |
| GET    | /api/auth/me           | Bearer        | 20/min      | Get current user               |
| GET    | /api/auth/admin        | Bearer+Admin  | 20/min      | Admin-only route               |
| POST   | /api/auth/verify-email | Public        | 5/min       | Verify email with token        |
| POST   | /api/auth/forgot-password | Public     | 3/min       | Request password reset         |
| POST   | /api/auth/reset-password  | Public     | 5/min       | Reset password with token      |
| GET    | /api/health            | Public        | unlimited   | Health check                   |
| GET    | /api/docs              | Public        | unlimited   | Swagger UI (if installed)      |

## Quick Start

### 1. Setup

```bash
git clone https://github.com/elarfaoui-ala/auth-module
cd auth-module

# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Or run the setup script
.\setup.ps1
```

### 2. Start database

```bash
docker compose up -d postgres
```

### 3. Run migrations

```bash
cd backend
npm run db:setup    # generates + runs migrations
```

### 4. Start the app

```bash
# Terminal 1 — backend
cd backend
npm run start:dev

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Backend: http://localhost:4000/api
Frontend: http://localhost:3000

### With Docker (everything)

```bash
docker compose up -d --build
```

## Project Structure

```
auth-module/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts    # Routes (rate-limited)
│   │   │   ├── auth.service.ts       # Business logic
│   │   │   ├── auth.module.ts        # Module config
│   │   │   ├── auth.dto.ts           # Validation schemas
│   │   │   ├── jwt.strategy.ts       # Passport JWT strategy
│   │   │   └── roles.guard.ts        # RBAC guard
│   │   ├── common/
│   │   │   ├── http-exception.filter.ts  # Global error handler
│   │   │   └── logger.middleware.ts       # Request logging
│   │   ├── db/
│   │   │   ├── schema.ts             # Drizzle schema (users, tokens)
│   │   │   └── index.ts              # DB connection
│   │   ├── email/
│   │   │   ├── email.module.ts       # Email module
│   │   │   ├── email.service.ts      # Nodemailer wrapper
│   │   │   └── nodemailer.d.ts       # Type declarations
│   │   ├── health/
│   │   │   └── health.controller.ts  # Health endpoint
│   │   ├── app.module.ts             # Root module
│   │   ├── main.ts                   # Entry point
│   │   └── dev-runner.js             # ts-node runner (tsc fallback)
│   ├── test/
│   │   ├── auth.service.spec.ts      # Unit tests
│   │   └── jest-e2e.json             # E2E test config
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   ├── jest.config.ts
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Register page
│   │   ├── dashboard/               # Protected dashboard
│   │   ├── verify-email/            # Email verification page
│   │   ├── forgot-password/         # Forgot password page
│   │   ├── reset-password/          # Password reset page
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Redirects to /login
│   │   └── globals.css              # Tailwind imports
│   ├── lib/
│   │   ├── auth-api.ts              # API client
│   │   ├── auth-context.tsx         # Auth state (auto-refresh)
│   │   ├── protected-route.tsx      # Auth guard wrapper
│   │   └── use-auth-form.ts         # Form helper hook
│   ├── Dockerfile
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── docker-compose.yml
├── setup.ps1                         # First-time setup script
├── start.ps1                         # Dev startup script
├── .gitignore
└── README.md
```

## Scripts

### Backend

| Script            | Description                        |
|-------------------|------------------------------------|
| `npm run build`   | Compile TypeScript (tsc)           |
| `npm run start:dev` | Run with ts-node (no build step) |
| `npm run start:prod` | Production start                |
| `npm run db:generate` | Generate Drizzle migrations    |
| `npm run db:migrate`  | Run Drizzle migrations          |
| `npm run db:setup`    | Generate + migrate              |
| `npm run db:push`     | Push schema (dev only)          |
| `npm test`        | Run unit tests (install Jest first) |

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
PORT=4000
FRONTEND_URL=http://localhost:3000

# SMTP (optional — for email verification & password reset)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@auth-module.local
```

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Reusing in another project

1. Copy `backend/src/auth/` into your NestJS project
2. Copy `backend/src/email/` into your NestJS project
3. Copy `backend/src/common/` (optional — for error handling + logging)
4. Copy `frontend/lib/` into your Next.js project
5. Install required packages:
   ```
   @nestjs/config @nestjs/throttler @nestjs/jwt @nestjs/passport
   passport passport-jwt bcryptjs drizzle-orm pg
   ```
6. Import `AuthModule` and `EmailModule` in your `AppModule`
7. Add `ConfigModule.forRoot({ isGlobal: true })` to your `AppModule`
8. Wrap your layout with `<AuthProvider>`
9. Use `useAuth()` anywhere in your app

## To install optional packages

```bash
cd backend
npm install @nestjs/swagger          # API docs at /api/docs
npm install --save-dev jest @types/jest ts-jest @nestjs/testing  # Tests
npm install nodemailer               # Email sending (falls back to console log)
```

## License

MIT
