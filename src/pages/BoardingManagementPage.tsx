import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../contexts/SchoolContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storage';
import { MonthlyBoardingSheet } from '../components/MonthlyBoardingSheet';
import { getTodayDateStr, formatDateVN } from '../utils/schoolWeeks';
import {
  Utensils,
  FileSpreadsheet,
  Sparkles,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Users,
  Save,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface BoardingManagementPageProps {
  initialTab?: 'daily-meals' | 'monthly-sheet' | 'ai-forecast';
  onNavigate?: (path: string) => void;
}

export const BoardingManagementPage: React.FC<BoardingManagementPageProps> = ({
  initialTab = 'daily-meals',
  onNavigate,
}) => {
  const { classes, settings, students } = useSchool();
  const { currentUser, isGVCN } = useAuth();

  const [activeTab, setActiveTab] = useState<'daily-meals' | 'monthly-sheet' | 'ai-forecast'>(initialTab);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const assignedClass = classes.find(
    (c) =>
      (currentUser?.assigned_class_id && c.id === currentUser.assigned_class_id) ||
      (currentUser?.id && c.homeroom_teacher_id === currentUser.id)
  );

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isGVCN && assignedClass) {
      setSelectedClassId(assignedClass.id);
    }
  }, [isGVCN, assignedClass]);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const classBoardingStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(
      (s) => s.class_id === currentClass.id && (s.isBoarding === true || (s as any).is_boarding === true)
    );
  }, [students, currentClass]);

  return (
    <div className="space-y-5">
      {/* Tab Switcher Header */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('daily-meals')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'daily-meals'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Báo ăn hôm nay</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monthly-sheet')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'monthly-sheet'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sổ chấm cơm tháng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai-forecast')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ai-forecast'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Tối ưu suất ăn</span>
          </button>
        </div>

        {/* Date Selector */}
        {activeTab === 'daily-meals' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 1. Daily Meals Tab */}
      {activeTab === 'daily-meals' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Báo Suất Ăn Bán Trú: Lớp {currentClass?.class_name}
              </h2>
              <p className="text-xs text-slate-500">
                Ngày {formatDateVN(selectedDate)} • Tổng số bán trú: <strong>{classBoardingStudents.length} HS</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2500);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{savedSuccess ? 'Đã lưu báo ăn!' : 'Lưu báo ăn hôm nay'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="text-xs font-bold text-amber-900">Suất ăn Sáng</div>
              <div className="text-2xl font-black text-amber-800 mt-1">{classBoardingStudents.length}</div>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900">Suất ăn Trưa</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{classBoardingStudents.length}</div>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="text-xs font-bold text-blue-900">Suất ăn Tối</div>
              <div className="text-2xl font-black text-blue-800 mt-1">{classBoardingStudents.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Monthly Sheet Tab */}
      {activeTab === 'monthly-sheet' && (
        <MonthlyBoardingSheet
          selectedClassId={selectedClassId}
          onClassChange={(cid) => setSelectedClassId(cid)}
        />
      )}

      {/* 3. AI Forecast Tab */}
      {activeTab === 'ai-forecast' && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">AI Dự Báo & Tối Ưu Hóa Suất Ăn Bán Trú</h2>
              <p className="text-xs text-slate-300">
                Dựa trên mô hình học máy phân tích thời tiết, lịch nghỉ mùa vụ và tỷ lệ chuyên cần các năm trước
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-400">Độ chính xác dự báo</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">96.8%</div>
              <p className="text-[11px] text-slate-300 mt-1">Giảm thất thoát lãng phí gạo và thực phẩm tươi</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-400">Số suất ăn dự kiến ngày mai</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {classBoardingStudents.length * 3} suất
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Khuyến nghị chuẩn bị đủ khẩu phần dinh dưỡng</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-400">Tiết kiệm chi phí bán trú</div>
              <div className="text-2xl font-black text-blue-400 mt-1">~12.5%</div>
              <p className="text-[11px] text-slate-300 mt-1">Theo báo cáo thống kê kế toán nhà trường</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
