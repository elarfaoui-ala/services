'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, EmitNotificationDto, WS_EVENTS } from './notification.types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4001';
const MAX_VISIBLE = 5;

interface NotificationContext {
  notifications: Notification[];
  connected: boolean;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  emit: (dto: EmitNotificationDto) => void;
  add: (dto: Omit<EmitNotificationDto, 'roomId'>) => void;
}

const Ctx = createContext<NotificationContext | null>(null);

interface Props {
  children: ReactNode;
  userId?: string;
}

export function NotificationsProvider({ children, userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const queueRef = useRef<EmitNotificationDto[]>([]);

  const scheduleAutoRemove = useCallback((n: Notification) => {
    if (!n.duration || n.duration === 0) return;
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      timersRef.current.delete(n.id);
    }, n.duration);
    timersRef.current.set(n.id, timer);
  }, []);

  const addNotification = useCallback(
    (n: Notification) => {
      setNotifications((prev) => [n, ...prev].slice(0, MAX_VISIBLE));
      scheduleAutoRemove(n);
    },
    [scheduleAutoRemove],
  );

  const flushQueue = useCallback((socket: Socket) => {
    while (queueRef.current.length) {
      const dto = queueRef.current.shift()!;
      socket.emit(WS_EVENTS.EMIT, dto);
    }
  }, []);

  useEffect(() => {
    const socket = io(`${WS_URL}/notifications`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (userId) socket.emit(WS_EVENTS.JOIN_ROOM, userId);
      flushQueue(socket);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on(WS_EVENTS.NOTIFY, (notification: Notification) => {
      addNotification(notification);
    });

    return () => {
      if (userId && socket.connected) {
        socket.emit(WS_EVENTS.LEAVE_ROOM, userId);
      }
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
      socket.disconnect();
    };
  }, [userId, addNotification, flushQueue]);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    setNotifications([]);
  }, []);

  const emit = useCallback((dto: EmitNotificationDto) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(WS_EVENTS.EMIT, dto);
    } else {
      queueRef.current.push(dto);
    }
  }, []);

  const add = useCallback(
    (dto: Omit<EmitNotificationDto, 'roomId'>) => {
      addNotification({
        id: crypto.randomUUID(),
        type: dto.type,
        title: dto.title,
        message: dto.message,
        duration: dto.duration ?? 4000,
        createdAt: Date.now(),
      });
    },
    [addNotification],
  );

  return (
    <Ctx.Provider value={{ notifications, connected, dismiss, dismissAll, emit, add }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
