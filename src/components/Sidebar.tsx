import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSchool } from '../contexts/SchoolContext';
import {
  LayoutDashboard,
  ClipboardList,
  Utensils,
  FileSpreadsheet,
  Calendar,
  CalendarDays,
  CalendarRange,
  Trophy,
  BarChart3,
  Sparkles,
  Layers,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  MapPin,
  Database,
  User,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAIAssistant?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed,
  onToggleCollapse,
  onOpenAIAssistant,
}) => {
  const { currentUser, isAdmin, isBGH, isGVCN } = useAuth();
  const { classes } = useSchool();

  const assignedClass = classes.find(
    (c) =>
      (currentUser?.assigned_class_id && c.id === currentUser.assigned_class_id) ||
      (currentUser?.id && c.homeroom_teacher_id === currentUser.id)
  );

  const navItems = [
    {
      group: 'HOẠT ĐỘNG CHÍNH',
      items: [
        {
          path: '/dashboard',
          label: 'Tổng quan',
          icon: LayoutDashboard,
        },
        {
          path: '/attendance',
          label: isGVCN && assignedClass ? `Lớp ${assignedClass.class_name}` : 'Điểm danh sĩ số',
          icon: ClipboardList,
          badge: isGVCN ? 'GVCN' : undefined,
        },
        {
          path: '/boarding',
          label: isGVCN && assignedClass ? `Báo ăn Lớp ${assignedClass.class_name}` : 'Báo ăn Bán trú',
          icon: Utensils,
          color: 'text-amber-600',
        },
      ],
    },
    {
      group: 'BÁO CÁO & THỐNG KÊ',
      items: [
        {
          path: '/reports/boarding-monthly',
          label: 'Sổ chấm cơm tháng',
          icon: FileSpreadsheet,
          color: 'text-emerald-600',
        },
        {
          path: '/reports/daily',
          label: 'Báo cáo theo ngày',
          icon: Calendar,
        },
        {
          path: '/reports/weekly',
          label: 'Báo cáo theo tuần',
          icon: CalendarDays,
        },
        {
          path: '/reports/monthly',
          label: 'Báo cáo theo tháng',
          icon: CalendarRange,
        },
        {
          path: '/reports/ranking',
          label: 'Thi đua sĩ số',
          icon: Trophy,
          color: 'text-amber-500',
        },
        {
          path: '/charts',
          label: 'Thống kê biểu đồ',
          icon: BarChart3,
        },
        {
          path: '/ai-dropout-prediction',
          label: 'AI Dự báo bỏ học',
          icon: Sparkles,
          color: 'text-indigo-600',
          badge: 'AI',
        },
      ],
    },
  ];

  if (isAdmin || isBGH) {
    navItems.push({
      group: 'QUẢN LÝ NHÀ TRƯỜNG',
      items: [
        {
          path: '/classes',
          label: 'Quản lý lớp học',
          icon: Layers,
        },
        {
          path: '/users',
          label: 'Quản lý giáo viên',
          icon: Users,
        },
      ],
    });
  }

  if (isAdmin) {
    navItems.push({
      group: 'CẤU HÌNH HỆ THỐNG',
      items: [
        {
          path: '/settings/school',
          label: 'Cấu hình trường',
          icon: Settings,
        },
        {
          path: '/settings/campuses',
          label: 'Điểm trường / Phân hiệu',
          icon: MapPin,
        },
        {
          path: '/settings/indicators',
          label: 'Nhóm chỉ tiêu',
          icon: Layers,
        },
        {
          path: '/settings/report-template',
          label: 'Biểu mẫu báo cáo',
          icon: FileSpreadsheet,
        },
        {
          path: '/settings/supabase',
          label: 'Đồng bộ Supabase',
          icon: Database,
        },
      ],
    });
  }

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 no-print z-20 sticky top-15 h-[calc(100vh-3.75rem)] ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Toggle Button */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
            Menu Chức Năng
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors mx-auto"
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.path ||
                (item.path.startsWith('/reports/weekly') && currentPath.startsWith('/reports/weekly')) ||
                (item.path === '/boarding' && (currentPath === '/boarding' || currentPath === '/boarding-meals'));

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color || 'text-slate-500'}`} />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* AI Assistant Button at bottom */}
      {onOpenAIAssistant && (
        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenAIAssistant}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-700 to-blue-700 text-white font-extrabold text-xs shadow-xs hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title="Mở Trợ lý ảo AI"
          >
            <Bot className="w-4 h-4 text-amber-300 shrink-0" />
            {!collapsed && <span>Trợ lý AI Nhà Trường</span>}
          </button>
        </div>
      )}
    </aside>
  );
};
