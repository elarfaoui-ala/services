export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id:        string;
  type:      NotificationType;
  title:     string;
  message?:  string;
  duration?: number;
  createdAt: number;
}

export interface EmitNotificationDto {
  type:      NotificationType;
  title:     string;
  message?:  string;
  duration?: number;
  roomId?:   string;
}

export const WS_EVENTS = {
  NOTIFY:       'notify',
  EMIT:         'emit_notification',
  JOIN_ROOM:    'join_room',
  LEAVE_ROOM:   'leave_room',
  CONNECTED:    'connected',
} as const;
