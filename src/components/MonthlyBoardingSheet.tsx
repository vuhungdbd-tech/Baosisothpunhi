import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../contexts/SchoolContext';
import { StorageService } from '../services/storage';
import { exportMonthlyBoardingExcel } from '../utils/exportBoardingExcel';
import { Student } from '../types';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  ChevronDown,
  Printer,
  Utensils,
  Check,
  X,
  Users,
} from 'lucide-react';

interface MonthlyBoardingSheetProps {
  selectedClassId: string;
  onClassChange?: (classId: string) => void;
}

export const MonthlyBoardingSheet: React.FC<MonthlyBoardingSheetProps> = ({
  selectedClassId,
  onClassChange,
}) => {
  const { classes, settings, students, campuses } = useSchool();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isExporting, setIsExporting] = useState(false);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentCampus = campuses.find((cmp) => cmp.id === currentClass?.campus_id);

  const boardingStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(
      (s) => s.class_id === currentClass.id && (s.isBoarding === true || (s as any).is_boarding === true)
    );
  }, [students, currentClass]);

  const [yearStr, monthNumStr] = selectedMonth.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthNumStr, 10);
  const daysInMonth = new Date(y, m, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleExport = async () => {
    if (!currentClass) return;
    setIsExporting(true);
    try {
      await exportMonthlyBoardingExcel({
        classId: currentClass.id,
        className: currentClass.class_name,
        campusName: currentCampus?.name || 'Khu chính',
        schoolName: settings?.school_name || 'TRƯỜNG PTDTBT THCS XA DUNG',
        monthStr: selectedMonth,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Control row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2">
          {onClassChange && (
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => onClassChange(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 appearance-none pr-7 cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Lớp {cls.class_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel Sổ Cơm'}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In sổ</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="text-center py-2 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
          SỔ CHẤM ĂN HỌC SINH BÁN TRÚ - THÁNG {m}/{y}
        </h2>
        <p className="text-xs font-bold text-blue-700 mt-0.5">
          LỚP {currentClass?.class_name} • {currentCampus?.name || 'Khu chính'} • SĨ SỐ BÁN TRÚ: {boardingStudents.length} HS
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <th className="p-2 border border-slate-200 w-10 text-center">STT</th>
              <th className="p-2 border border-slate-200 min-w-[140px]">Họ và tên</th>
              <th className="p-2 border border-slate-200 min-w-[100px]">Địa chỉ / Bản</th>
              {days.map((d) => (
                <th key={d} className="p-1 border border-slate-200 text-center w-7">
                  {d}
                </th>
              ))}
              <th className="p-2 border border-slate-200 text-center min-w-[60px]">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {boardingStudents.length === 0 ? (
              <tr>
                <td colSpan={days.length + 4} className="p-6 text-center text-slate-400 italic">
                  Chưa có danh sách học sinh bán trú cho lớp này. Vui lòng cập nhật danh sách lớp.
                </td>
              </tr>
            ) : (
              boardingStudents.map((std, idx) => (
                <tr key={std.id} className="hover:bg-slate-50 border-b border-slate-200">
                  <td className="p-1.5 border border-slate-200 text-center font-medium text-slate-500">{idx + 1}</td>
                  <td className="p-1.5 border border-slate-200 font-bold text-slate-800">{std.full_name}</td>
                  <td className="p-1.5 border border-slate-200 text-slate-500">{std.address || std.village || '-'}</td>
                  {days.map((d) => (
                    <td key={d} className="p-1 border border-slate-200 text-center text-emerald-700 font-black">
                      x
                    </td>
                  ))}
                  <td className="p-1.5 border border-slate-200 text-center font-black text-blue-700 bg-blue-50/50">
                    {daysInMonth}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
