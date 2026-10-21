import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../contexts/SchoolContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storage';
import { AIPredictiveService, DropoutRiskAnalysis } from '../services/aiPredictiveService';
import { DailyReport } from '../types';
import {
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Users,
  MapPin,
  Calendar,
  ChevronDown,
  Phone,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface AIPredictiveDropoutPageProps {
  onNavigate?: (path: string) => void;
}

export const AIPredictiveDropoutPage: React.FC<AIPredictiveDropoutPageProps> = ({ onNavigate }) => {
  const { students, classes, activeYear, settings } = useSchool();
  const { currentUser, isGVCN } = useAuth();

  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    StorageService.getDailyReports().then(setReports).catch(console.error);
  }, []);

  const allRisks = useMemo(() => {
    return AIPredictiveService.calculateDropoutRisk(students, classes, reports, activeYear?.id);
  }, [students, classes, reports, activeYear?.id]);

  const filteredRisks = useMemo(() => {
    return allRisks.filter((item) => {
      if (selectedClassFilter !== 'all' && item.student.class_id !== selectedClassFilter) {
        return false;
      }
      if (selectedRiskFilter !== 'ALL' && item.riskLevel !== selectedRiskFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.student.full_name.toLowerCase().includes(q);
        const addrMatch = (item.student.address || item.student.village || '').toLowerCase().includes(q);
        if (!nameMatch && !addrMatch) return false;
      }
      return true;
    });
  }, [allRisks, selectedClassFilter, selectedRiskFilter, searchQuery]);

  const criticalCount = allRisks.filter((r) => r.riskLevel === 'CRITICAL').length;
  const highCount = allRisks.filter((r) => r.riskLevel === 'HIGH').length;
  const mediumCount = allRisks.filter((r) => r.riskLevel === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      {/* Hero AI Warning Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 rounded-3xl p-6 text-white border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  AI Model
                </span>
                <span className="text-xs text-indigo-200">Dự báo sớm nguy cơ nghỉ học & bỏ học vùng cao</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight mt-1">
                Hệ Thống Phân Tích &amp; Cảnh Báo Sớm Học Sinh Có Nguy Cơ Bỏ Học
              </h1>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold text-rose-300">Nguy cơ rất cao (Báo động đỏ)</div>
            <div className="text-3xl font-black text-rose-400 mt-1">{criticalCount} em</div>
            <p className="text-[11px] text-slate-300 mt-0.5">Vắng nhiều ngày liên tiếp hoặc ngắt quãng bất thường</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold text-amber-300">Nguy cơ cao</div>
            <div className="text-3xl font-black text-amber-400 mt-1">{highCount} em</div>
            <p className="text-[11px] text-slate-300 mt-0.5">Khoảng cách nhà xa hoặc có dấu hiệu làm nương rẫy</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-bold text-blue-300">Cần theo dõi sát</div>
            <div className="text-3xl font-black text-blue-400 mt-1">{mediumCount} em</div>
            <p className="text-[11px] text-slate-300 mt-0.5">Chuyên cần chưa đều đặn đầu tuần hoặc cuối tuần</p>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 appearance-none pr-7 cursor-pointer"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp {cls.class_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedRiskFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRiskFilter === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'ALL' ? 'Tất cả' : lvl === 'CRITICAL' ? 'Rất cao' : lvl === 'HIGH' ? 'Cao' : 'Trung bình'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên học sinh, bản..."
            className="w-full md:w-60 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRisks.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">Không có học sinh nào trong diện cảnh báo đã chọn!</h3>
            <p className="text-xs text-slate-500 mt-1">Sĩ số lớp duy trì tốt hoặc bộ lọc không khớp dữ liệu.</p>
          </div>
        ) : (
          filteredRisks.map((item) => (
            <div
              key={item.student.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                item.riskLevel === 'CRITICAL'
                  ? 'border-rose-300 bg-rose-50/10 ring-1 ring-rose-200'
                  : item.riskLevel === 'HIGH'
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Lớp {item.classItem?.class_name || 'Chưa xếp lớp'}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      item.riskLevel === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : item.riskLevel === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {item.riskScore}% Nguy cơ
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 mt-1.5">
                  {item.student.full_name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.student.address || item.student.village || 'Bản chưa rõ'}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Dấu hiệu cảnh báo:
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {item.reasons.map((r, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-black">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    Khuyến nghị vận động:
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    "{item.recommendations[0]}"
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => alert(`Đã ghi nhận yêu cầu vận động học sinh ${item.student.full_name}. GVCN vui lòng liên hệ phụ huynh.`)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Kế hoạch liên hệ phụ huynh</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
