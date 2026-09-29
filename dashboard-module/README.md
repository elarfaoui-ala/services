# Dashboard Module

A reusable analytics dashboard module built with **NestJS** (backend) and **Next.js + Recharts** (frontend).
Plug it into any project — swap the data source and the charts work instantly.

## Features

- 4 KPI cards with sparklines and trend indicators
- Area chart (Revenue vs Expenses), Bar chart (Orders), Line chart, Pie chart (by category)
- Date range filter: Today, 7d, 30d, 90d, Custom
- Auto-refresh every 30s (configurable) with manual refresh
- Skeleton loading, error states, responsive layout
- Input validation (`class-validator`) on all query params
- Rate limiting (30 req/min via `@nestjs/throttler`)
- Security headers (Helmet)
- Abstract data provider → swap mock for real DB without changing service code
- Shared types package (`@dashboard-module/shared`) – single source of truth
- Docker / docker-compose for production deployment
- Unit tests for backend (Jest) and frontend (@testing-library)

## Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Backend    | NestJS, TypeScript, Helmet, class-validator, Throttler  |
| Frontend   | Next.js 14, Recharts, Tailwind CSS                      |
| Shared     | `@dashboard-module/shared` (npm workspace)              |
| Infra      | Docker, docker-compose                                  |

## Quick Start

```bash
# Install all packages (root workspace)
npm install

# Run both backend & frontend concurrently
npm run dev

# Or run them separately:
npm run dev -w backend   # http://localhost:4002/api
npm run dev -w frontend  # http://localhost:3000/dashboard
```

## API Endpoints

| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/dashboard?range=30d    | Full dashboard data      |
| GET    | /api/dashboard/kpis?range=7d| KPI cards only           |
| GET    | /api/dashboard/charts       | Charts only              |

**Query params:** `range` (today\|7d\|30d\|90d\|custom), `from` (ISO date), `to` (ISO date)

## Architecture

```
                    ┌──────────────┐
                    │   Shared     │
                    │   Types      │
                    └─────┬────────┘
                          │
              ┌───────────┴──────────────┐
              │                          │
     ┌────────▼────────┐      ┌─────────▼─────────┐
     │    Backend       │      │    Frontend        │
     │  ┌────────────┐ │      │  ┌──────────────┐  │
     │  │ Controller │ │      │  │ useDashboard │  │
     │  └──────┬─────┘ │      │  │    Hook      │  │
     │         │       │      │  └──────┬───────┘  │
     │  ┌──────▼─────┐ │      │         │          │
     │  │  Service   │ │      │  ┌──────▼───────┐  │
     │  └──────┬─────┘ │      │  │ ChartCard    │  │
     │         │       │      │  │ KpiCard      │  │
     │  ┌──────▼─────┐ │      │  │ DateFilter   │  │
     │  │  Data      │ │      │  └──────────────┘  │
     │  │  Provider  │ │      │                    │
     │  │ (mock)     │ │      └────────────────────┘
     │  └────────────┘ │
     └─────────────────┘
```

The `DataProvider` interface abstracts data access. Replace `MockDataProvider` with your own implementation (querying a real database, calling an external API, etc.) without touching the controller or service.

## Connecting to a real backend

1. Create a new class implementing `DataProvider` (see `src/data/data-provider.interface.ts`)
2. Register it in `DashboardModule` using the `DATA_PROVIDER` token
3. The frontend doesn't change — it just consumes `DashboardData`

## Adding a real database

```typescript
// src/data/prisma-data-provider.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataProvider } from './data-provider.interface';

@Injectable()
export class PrismaDataProvider implements DataProvider {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(query: DashboardQuery): Promise<DashboardData> {
    // Query your database and return DashboardData
  }
  // ...
}
```

Then in `DashboardModule`:

```typescript
{ provide: DATA_PROVIDER, useClass: PrismaDataProvider }
```

## Testing

```bash
# All tests
npm test

# Backend only
npm test -w backend

# Frontend only
npm test -w frontend
```

## Docker

```bash
docker compose up --build
# Backend: http://localhost:4002/api
# Frontend: http://localhost:3000/dashboard
```

## Environment Variables

### Backend
| Variable       | Default                  | Description        |
|----------------|--------------------------|--------------------|
| `PORT`         | `4002`                   | API port           |
| `FRONTEND_URL` | `http://localhost:3000`   | CORS origin        |

### Frontend
| Variable               | Default                       | Description       |
|------------------------|-------------------------------|-------------------|
| `NEXT_PUBLIC_API_URL`  | `http://localhost:4002/api`   | Backend API URL   |

## Project Structure

```
dashboard-module/
├── shared/                    # Shared types package
│   └── src/types.ts
├── backend/                   # NestJS API
│   ├── src/
│   │   ├── dashboard/         # Module: controller, service, DTO
│   │   ├── data/              # DataProvider interface + mock impl
│   │   └── main.ts
│   └── package.json
├── frontend/                  # Next.js app
│   ├── app/dashboard/         # Dashboard page
│   ├── components/            # KpiCard, ChartCard, DateFilter, Header
│   ├── lib/                   # useDashboard hook, types
│   └── package.json
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
└── package.json               # Root workspace config
```
