/**
 * Shared event type definitions for cross-service communication.
 *
 * Add new events here to keep the contract in one place.
 * Each service imports only the events it publishes or subscribes to.
 */

// ── Auth Events ──────────────────────────────────────────────────────────────

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export interface UserLoggedInEvent {
  userId: string;
  email: string;
}

export interface UserPasswordResetEvent {
  userId: string;
  email: string;
}

// ── Notification Events ──────────────────────────────────────────────────────

export interface NotificationSentEvent {
  notificationId: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  targetUserId?: string;
}

// ── Dashboard Events ──────────────────────────────────────────────────────

export interface DashboardDataUpdatedEvent {
  dashboardId: string;
  updatedBy?: string;
  timestamp: string;
}

// ── Event Names (constants) ──────────────────────────────────────────────────

export const EVENTS = {
  // Auth
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  USER_PASSWORD_RESET: 'user.password_reset',

  // Notifications
  NOTIFICATION_SENT: 'notification.sent',

  // Dashboard
  DASHBOARD_DATA_UPDATED: 'dashboard.data_updated',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
