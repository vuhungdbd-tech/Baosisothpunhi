import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationCenterProps {
  onNavigate: (path: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const { notifications } = useNotifications();
  
  return (
    <div className="relative">
      <button className="p-2 rounded-xl hover:bg-slate-100 relative">
        <Bell className="w-5 h-5 text-slate-600" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
    </div>
  );
};
