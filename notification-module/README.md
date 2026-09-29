# Notification Module

Real-time WebSocket notification system built with **NestJS** (backend) and **Next.js** (frontend).
Plug into any project with two lines of code.

## Features

- Real-time WebSocket notifications via Socket.IO
- 4 notification types: success, error, warning, info
- Auto-dismiss with configurable duration (set 0 for persistent)
- Targeted notifications via rooms (e.g. send only to a specific user)
- Broadcast to all connected clients
- Local notifications (current tab only, no WebSocket needed)
- Configurable toast position (top-right, top-left, bottom-right, bottom-left)
- Offline queue — emits queued and replayed on reconnect
- Max 5 visible toasts, accessible (ARIA)
- REST API to trigger notifications from any service
- Optional API key authentication for REST endpoints
- Input validation with class-validator
- Global error handling & exception filters

## Stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Backend  | NestJS, Socket.IO, WebSocket Gateway |
| Frontend | Next.js 14, React, socket.io-client  |
| Styling  | Tailwind CSS                         |
| Testing  | Jest                                 |

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run start:dev

# Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000/demo to test all notification types.

## Usage in any component

```tsx
const { add, emit, dismiss, dismissAll } = useNotifications();

// Local notification (current tab only)
add({ type: 'success', title: 'Saved!', message: 'Your changes were saved.' });

// Broadcast via WebSocket (all connected clients)
emit({ type: 'warning', title: 'Maintenance', message: 'System restart in 5 min.' });

// Persistent (no auto-dismiss)
add({ type: 'error', title: 'Connection lost', duration: 0 });

// Dismiss programmatically
dismiss(notificationId);
dismissAll();
```

## API Endpoints

| Method | Path                            | Description               |
| ------ | ------------------------------- | ------------------------- |
| POST   | /api/notifications/broadcast    | Send to all clients       |
| POST   | /api/notifications/user/:userId | Send to specific user     |
| POST   | /api/notifications/health       | Health check              |
| POST   | /api/notifications/test/success | Test success notification |
| POST   | /api/notifications/test/error   | Test error notification   |
| POST   | /api/notifications/test/warning | Test warning notification |
| POST   | /api/notifications/test/info    | Test info notification    |

> **Auth:** Set `API_KEY` in `.env` to require `x-api-key` header on `broadcast` and `user/:userId` endpoints.

## Integrating into an existing NestJS project

```typescript
@Module({ imports: [NotificationsModule] })
export class AppModule {}

@Injectable()
export class OrdersService {
  constructor(private notifications: NotificationsService) {}

  async createOrder(userId: string) {
    this.notifications.toUser(userId, {
      type: 'success',
      title: 'Order confirmed',
      message: 'Your order #123 is being processed.',
    });
  }
}
```

## Reusing in another project

1. Copy `backend/src/notifications/` into your NestJS project
2. Import `NotificationsModule` in your `AppModule`
3. Copy `frontend/lib/use-notifications.tsx` and `frontend/components/notifications/` into your Next.js project
4. Wrap your layout with `<NotificationsProvider>` and add `<NotificationToasts />`
5. Use `useNotifications()` anywhere

## Docker

```bash
docker compose up --build
```

## Scripts

### Backend

| Script              | Description        |
| ------------------- | ------------------ |
| `npm run start:dev` | Dev server (watch) |
| `npm run build`     | Compile            |
| `npm run test`      | Run unit tests     |
| `npm run lint`      | Lint & fix         |

### Frontend

| Script          | Description      |
| --------------- | ---------------- |
| `npm run dev`   | Dev server       |
| `npm run build` | Production build |
| `npm run lint`  | Lint             |

## Environment Variables

```env
# Backend
PORT=4001
FRONTEND_URL=http://localhost:3000
API_KEY=                 # Optional: set to require x-api-key

# Frontend
NEXT_PUBLIC_WS_URL=http://localhost:4001
```
