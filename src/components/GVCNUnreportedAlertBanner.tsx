import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSchool } from '../contexts/SchoolContext';
import { StorageService } from '../services/storage';
import { getTodayDateStr } from '../utils/schoolWeeks';
import { BellRing, ArrowRight, X, AlertTriangle } from 'lucide-react';

interface GVCNUnreportedAlertBannerProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const GVCNUnreportedAlertBanner: React.FC<GVCNUnreportedAlertBannerProps> = ({
  onNavigate,
  currentPath,
}) => {
  const { currentUser, isGVCN } = useAuth();
  const { classes } = useSchool();
  const [isUnreported, setIsUnreported] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const assignedClass = classes.find(
    (c) =>
      (currentUser?.assigned_class_id && c.id === currentUser.assigned_class_id) ||
      (currentUser?.id && c.homeroom_teacher_id === currentUser.id)
  );

  useEffect(() => {
    if (!isGVCN || !assignedClass) {
      setIsUnreported(false);
      return;
    }

    const today = getTodayDateStr();
    StorageService.getDailyReports().then((reports) => {
      const rep = reports.find((r) => r.class_id === assignedClass.id && r.report_date === today);
      if (!rep || rep.status === 'DRAFT') {
        setIsUnreported(true);
      } else {
        setIsUnreported(false);
      }
    }).catch(() => {});
  }, [isGVCN, assignedClass, currentPath]);

  if (!isUnreported || dismissed || currentPath === '/attendance') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 no-print animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1 rounded-lg bg-white/20 shrink-0">
          <BellRing className="w-4 h-4 animate-bounce text-amber-200" />
        </div>
        <div className="text-xs sm:text-sm font-bold truncate">
          <span>Hôm nay Lớp <strong>{assignedClass?.class_name}</strong> chưa hoàn thành báo cáo sĩ số!</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onNavigate('/attendance')}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
        >
          <span>Điểm danh ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
          title="Tạm ẩn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
