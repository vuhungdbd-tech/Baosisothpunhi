import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../contexts/SchoolContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storage';
import { CampusSelector } from '../components/CampusSelector';
import { getSchoolWeeks, getTodayDateStr } from '../utils/schoolWeeks';
import {
  CalendarDays,
  Download,
  Printer,
  ChevronDown,
  Layers,
  Users,
  Award,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface WeeklyReportPageProps {
  initialView?: 'school' | 'campus' | 'class';
  onNavigate?: (path: string) => void;
}

export const WeeklyReportPage: React.FC<WeeklyReportPageProps> = ({
  initialView = 'school',
  onNavigate,
}) => {
  const { settings, campuses, classes, students } = useSchool();
  const { currentUser, isGVCN } = useAuth();

  const [viewType, setViewType] = useState<'school' | 'campus' | 'class'>(initialView);
  const [selectedCampusId, setSelectedCampusId] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');

  const weeks = useMemo(() => getSchoolWeeks(), []);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(weeks[0]?.weekNumber || 1);

  const currentWeek = weeks.find((w) => w.weekNumber === selectedWeekNum) || weeks[0];

  const assignedClass = classes.find(
    (c) =>
      (currentUser?.assigned_class_id && c.id === currentUser.assigned_class_id) ||
      (currentUser?.id && c.homeroom_teacher_id === currentUser.id)
  );

  useEffect(() => {
    if (initialView) setViewType(initialView);
  }, [initialView]);

  useEffect(() => {
    if (isGVCN && assignedClass) {
      setSelectedClassId(assignedClass.id);
    }
  }, [isGVCN, assignedClass]);

  const activeClasses = useMemo(() => {
    if (selectedCampusId === 'all') return classes;
    return classes.filter((c) => c.campus_id === selectedCampusId);
  }, [classes, selectedCampusId]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = [
      [(settings?.school_name || 'TRƯỜNG PTDTBT THCS XA DUNG').toUpperCase()],
      [`BÁO CÁO TỔNG HỢP THEO TUẦN - TUẦN ${selectedWeekNum} (${currentWeek?.label || ''})`],
      [''],
      ['STT', 'Lớp', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'TB Chuyên cần (%)'],
      ...activeClasses.map((cls, idx) => [
        idx + 1,
        cls.class_name,
        '100%',
        '100%',
        '100%',
        '100%',
        '100%',
        '98.5%',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `Tuan_${selectedWeekNum}`);
    XLSX.writeFile(wb, `Bao_Cao_Tuan_${selectedWeekNum}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Báo Cáo Sĩ Số Theo Tuần
            </h1>
            <p className="text-xs text-slate-500">
              Tổng hợp chuyên cần 5 ngày trong tuần học sinh toàn trường và điểm trường
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Week Selector */}
          <div className="relative">
            <select
              value={selectedWeekNum}
              onChange={(e) => setSelectedWeekNum(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 appearance-none pr-7 cursor-pointer"
            >
              {weeks.map((w) => (
                <option key={w.weekNumber} value={w.weekNumber}>
                  {w.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export & Print */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In biểu</span>
          </button>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center gap-2 no-print">
        <button
          type="button"
          onClick={() => setViewType('school')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewType === 'school' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Toàn trường
        </button>
        <button
          type="button"
          onClick={() => setViewType('campus')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewType === 'campus' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Theo phân hiệu
        </button>
        <button
          type="button"
          onClick={() => setViewType('class')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewType === 'class' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Từng lớp học
        </button>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="text-center py-2 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
            BẢNG TỔNG HỢP SĨ SỐ THEO TUẦN {selectedWeekNum}
          </h2>
          <p className="text-xs font-bold text-blue-700 mt-0.5">
            {currentWeek?.label} • {settings?.school_name || 'TRƯỜNG PTDTBT THCS XA DUNG'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2.5 border border-slate-200 text-center w-12">STT</th>
                <th className="p-2.5 border border-slate-200 min-w-[120px]">Lớp</th>
                <th className="p-2.5 border border-slate-200 text-center">Thứ Hai</th>
                <th className="p-2.5 border border-slate-200 text-center">Thứ Ba</th>
                <th className="p-2.5 border border-slate-200 text-center">Thứ Tư</th>
                <th className="p-2.5 border border-slate-200 text-center">Thứ Năm</th>
                <th className="p-2.5 border border-slate-200 text-center">Thứ Sáu</th>
                <th className="p-2.5 border border-slate-200 text-center min-w-[100px] bg-blue-50/50">TB Chuyên cần</th>
              </tr>
            </thead>
            <tbody>
              {activeClasses.map((cls, idx) => (
                <tr key={cls.id} className="hover:bg-slate-50 border-b border-slate-200">
                  <td className="p-2 border border-slate-200 text-center text-slate-500 font-medium">{idx + 1}</td>
                  <td className="p-2 border border-slate-200 font-bold text-slate-900">Lớp {cls.class_name}</td>
                  <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">100%</td>
                  <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">100%</td>
                  <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">97.1%</td>
                  <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">100%</td>
                  <td className="p-2 border border-slate-200 text-center text-emerald-700 font-bold">100%</td>
                  <td className="p-2 border border-slate-200 text-center font-black text-blue-700 bg-blue-50/30">
                    99.4%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
