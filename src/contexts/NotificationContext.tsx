import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppNotification } from '../types';
import { StorageService } from '../services/storage';

interface ReminderResult {
  sentCount: number;
  remindedClasses: string[];
  skippedClasses: string[];
}

interface NotificationContextType {
  urgentAttendanceReminder: AppNotification | null;
  notifications: AppNotification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isSoundEnabled: boolean;
  toggleSound: (enabled?: boolean) => void;
  testSound: () => Promise<void>;
  isAudioBlocked: boolean;
  browserPermission: string;
  sendBGHManualReminder: (dateStr: string) => Promise<ReminderResult>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [urgentAttendanceReminder, setUrgentAttendanceReminder] = useState<AppNotification | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sso_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [isAudioBlocked, setIsAudioBlocked] = useState<boolean>(false);
  const [browserPermission, setBrowserPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const playNotificationChime = useCallback(async () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      setIsAudioBlocked(false);
    } catch (err) {
      console.warn('Audio play chime warning:', err);
      setIsAudioBlocked(true);
    }
  }, []);

  const toggleSound = useCallback((enabled?: boolean) => {
    setIsSoundEnabled((prev) => {
      const next = typeof enabled === 'boolean' ? enabled : !prev;
      try {
        localStorage.setItem('sso_sound_enabled', String(next));
      } catch {}
      return next;
    });
  }, []);

  const testSound = useCallback(async () => {
    await playNotificationChime();
  }, [playNotificationChime]);

  const loadNotifications = useCallback(async () => {
    try {
      const list = await StorageService.getNotifications();
      setNotifications(list);
      const urgent = list.find((n) => n.urgent && !n.read) || null;
      setUrgentAttendanceReminder(urgent);
    } catch (err) {
      console.warn('Error loading notifications:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (urgentAttendanceReminder?.id === id) {
      setUrgentAttendanceReminder(null);
    }
    try {
      await StorageService.markNotificationAsRead(id);
    } catch {}
  }, [urgentAttendanceReminder]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUrgentAttendanceReminder(null);
  }, []);

  const sendBGHManualReminder = useCallback(
    async (dateStr: string): Promise<ReminderResult> => {
      try {
        const classes = await StorageService.getClasses();
        const reports = await StorageService.getDailyReports();
        const reportedClassIds = new Set(
          reports.filter((r) => r.report_date === dateStr && r.status !== 'DRAFT').map((r) => r.class_id)
        );

        const unrepClasses = classes.filter((c) => !reportedClassIds.has(c.id));
        const remindedClasses: string[] = [];
        const skippedClasses: string[] = [];

        for (const cls of unrepClasses) {
          remindedClasses.push(cls.class_name);
          const newNotif: AppNotification = {
            id: `notif_${cls.id}_${Date.now()}`,
            user_id: cls.homeroom_teacher_id || `teacher_${cls.id}`,
            class_id: cls.id,
            class_name: cls.class_name,
            type: 'ATTENDANCE_REMINDER',
            title: `Nhắc nhở báo cáo sĩ số Lớp ${cls.class_name}`,
            message: `Ban Giám Hiệu đề nghị GVCN báo cáo sĩ số ngày ${dateStr}.`,
            date: dateStr,
            read: false,
            urgent: true,
            created_at: new Date().toISOString(),
          };
          await StorageService.saveNotification(newNotif);
        }

        await loadNotifications();
        return {
          sentCount: remindedClasses.length,
          remindedClasses,
          skippedClasses,
        };
      } catch (err) {
        console.error('sendBGHManualReminder error:', err);
        return { sentCount: 0, remindedClasses: [], skippedClasses: [] };
      }
    },
    [loadNotifications]
  );

  return (
    <NotificationContext.Provider
      value={{
        urgentAttendanceReminder,
        notifications,
        markAsRead,
        markAllAsRead,
        isSoundEnabled,
        toggleSound,
        testSound,
        isAudioBlocked,
        browserPermission,
        sendBGHManualReminder,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
