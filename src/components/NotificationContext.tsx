'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export type AppNotification = {
  id: string;
  postId: string;
  status: string;
  title: string;
  message: string;
  at: string;
  read?: boolean;
};

type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { userId, role, isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const storageKey = useMemo(() => (userId ? `app_notifications_${userId}` : ''), [userId]);

  useEffect(() => {
    if (!storageKey) {
      setNotifications([]);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch {
      // ignore bad cache
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, storageKey]);

  useEffect(() => {
    if (!isLoggedIn || role !== 'user' || !userId) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const source = new EventSource(`/api/notifications/stream?userId=${encodeURIComponent(String(userId))}`);
    eventSourceRef.current = source;

    const onStatusUpdate = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data || '{}');
        const next: AppNotification = {
          id: `${payload.postId || 'post'}-${Date.now()}`,
          postId: String(payload.postId || ''),
          status: String(payload.status || 'Updated'),
          title: String(payload.title || 'Issue Update'),
          message: String(payload.message || 'Issue status updated'),
          at: payload.at || new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [next, ...prev].slice(0, 30));
        toast.success(next.message);
      } catch {
        // ignore malformed payload
      }
    };

    source.addEventListener('status-update', onStatusUpdate as EventListener);

    source.onerror = () => {
      // browser auto-reconnect handles transient disconnects
    };

    return () => {
      source.removeEventListener('status-update', onStatusUpdate as EventListener);
      source.close();
      if (eventSourceRef.current === source) {
        eventSourceRef.current = null;
      }
    };
  }, [isLoggedIn, role, userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
