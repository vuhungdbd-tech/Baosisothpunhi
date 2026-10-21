import React from 'react';
import { X, Smartphone, Bell, CheckCircle2, ShieldCheck } from 'lucide-react';

interface MobileNotificationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNotificationSetupModal: React.FC<MobileNotificationSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Cài đặt thông báo điện thoại
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs text-slate-600">
          <p className="leading-relaxed">
            Nhận thông báo tức thì khi Ban Giám Hiệu gửi nhắc nhở nộp báo cáo sĩ số và suất ăn bán trú ngay trên màn hình khóa điện thoại.
          </p>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Cài đặt ứng dụng vào màn hình chính thông qua nút <strong>Cài đặt PWA</strong> trên thanh công cụ.</span>
            </div>
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Cho phép quyền <strong>Nhận thông báo</strong> của trình duyệt khi được hỏi.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Âm thanh nhắc nhở chuông báo sẽ phát vào đầu giờ mỗi sáng nếu chưa hoàn thành báo cáo.</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={handleRequestPermission}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            Bật quyền thông báo
          </button>
        </div>
      </div>
    </div>
  );
};
