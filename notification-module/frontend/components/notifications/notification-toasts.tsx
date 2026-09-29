'use client';

import { useNotifications } from '../../lib/use-notifications';
import { Notification }     from '../../lib/notification.types';

type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface Props {
  position?: ToastPosition;
}

const POSITION_STYLES: Record<ToastPosition, string> = {
  'top-right':    'top-4 right-4',
  'top-left':     'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left':  'bottom-4 left-4',
};

const ANIMATION_CLASSES: Record<ToastPosition, string> = {
  'top-right':    'slide-in-from-right-full',
  'top-left':     'slide-in-from-left-full',
  'bottom-right': 'slide-in-from-right-full',
  'bottom-left':  'slide-in-from-left-full',
};

const ICONS: Record<Notification['type'], string> = {
  success: '\u2713',
  error:   '\u2715',
  warning: '\u26A0',
  info:    '\u2139',
};

const STYLES: Record<Notification['type'], string> = {
  success: 'border-green-500 bg-green-50 text-green-900',
  error:   'border-red-500 bg-red-50 text-red-900',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  info:    'border-blue-500 bg-blue-50 text-blue-900',
};

const ICON_STYLES: Record<Notification['type'], string> = {
  success: 'bg-green-500 text-white',
  error:   'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info:    'bg-blue-500 text-white',
};

function Toast({ notification, onDismiss }: {
  notification: Notification;
  onDismiss:    (id: string) => void;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-lg
                  max-w-sm w-full animate-in duration-300
                  ${STYLES[notification.type]}`}
    >
      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center
                        justify-center text-xs font-bold
                        ${ICON_STYLES[notification.type]}`}>
        {ICONS[notification.type]}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">{notification.title}</p>
        {notification.message && (
          <p className="text-xs mt-0.5 opacity-80 leading-snug">{notification.message}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(notification.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity
                   text-current text-lg leading-none mt-0.5"
      >
        ×
      </button>
    </div>
  );
}

export function NotificationToasts({ position = 'top-right' }: Props) {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className={`fixed z-50 flex flex-col gap-2 pointer-events-none
                  ${POSITION_STYLES[position]}
                  ${position.startsWith('bottom') ? 'flex-col-reverse' : ''}`}
    >
      {notifications.map(n => (
        <div key={n.id} className={`pointer-events-auto animate-in ${ANIMATION_CLASSES[position]}`}>
          <Toast notification={n} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
