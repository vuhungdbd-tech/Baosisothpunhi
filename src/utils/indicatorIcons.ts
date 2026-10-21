import React from 'react';
import {
  Users,
  Utensils,
  Home,
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  Bed,
  Backpack,
  Heart,
  LucideIcon,
} from 'lucide-react';
import { IndicatorGroup } from '../types';

export interface IndicatorIconOption {
  id: string;
  label: string;
  shortLabel: string;
  colorClass: string;
  Icon: LucideIcon;
}

export const INDICATOR_ICON_OPTIONS: IndicatorIconOption[] = [
  { id: 'users', label: 'Toàn trường / Học sinh', shortLabel: 'Học sinh', colorClass: 'bg-blue-100 text-blue-700', Icon: Users },
  { id: 'utensils', label: 'Bán trú / Suất ăn', shortLabel: 'Bán trú', colorClass: 'bg-amber-100 text-amber-700', Icon: Utensils },
  { id: 'home', label: 'Ngoại trú / Ở nhà', shortLabel: 'Ngoại trú', colorClass: 'bg-indigo-100 text-indigo-700', Icon: Home },
  { id: 'backpack', label: 'Đi về / Ba lô', shortLabel: 'Đi về', colorClass: 'bg-teal-100 text-teal-700', Icon: Backpack },
  { id: 'bed', label: 'Ở lại cuối tuần', shortLabel: 'Cuối tuần', colorClass: 'bg-purple-100 text-purple-700', Icon: Bed },
  { id: 'graduation-cap', label: 'Học tập / Chuyên cần', shortLabel: 'Chuyên cần', colorClass: 'bg-emerald-100 text-emerald-700', Icon: GraduationCap },
  { id: 'heart', label: 'Khuyết tật / Sức khỏe', shortLabel: 'Sức khỏe', colorClass: 'bg-rose-100 text-rose-700', Icon: Heart },
  { id: 'sparkles', label: 'Khác / Nổi bật', shortLabel: 'Khác', colorClass: 'bg-sky-100 text-sky-700', Icon: Sparkles },
];

export interface IndicatorMeta {
  typeKey: string;
  Icon: LucideIcon;
  color: string;
  bgColor: string;
  badgeClass: string;
  label: string;
  description: string;
  isBoarding: boolean;
  isNgoaiTru: boolean;
}

export function getIndicatorMeta(ig?: IndicatorGroup | null, isPrimary: boolean = false): IndicatorMeta {
  const code = (ig?.code || '').toUpperCase();
  const name = (ig?.name || '').toLowerCase();
  const iconKey = (ig?.icon || '').toLowerCase();

  const isB = iconKey === 'utensils' || code.includes('BOARDING') || code.includes('MEAL') || code.includes('AN') || name.includes('bán trú');
  const isNg = iconKey === 'home' || iconKey === 'backpack' || code.includes('NGOAI_TRU') || name.includes('ngoại trú') || name.includes('không ăn');

  if (isB) {
    return {
      typeKey: 'utensils',
      Icon: Utensils,
      color: 'text-amber-700',
      bgColor: 'bg-amber-100 border-amber-300',
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
      label: 'Học sinh Bán trú',
      description: 'Chỉ tiêu theo dõi số lượng học sinh ăn bán trú tại trường',
      isBoarding: true,
      isNgoaiTru: false,
    };
  }

  if (isNg) {
    return {
      typeKey: 'home',
      Icon: Home,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-100 border-indigo-300',
      badgeClass: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      label: 'Học sinh Ngoại trú',
      description: 'Chỉ tiêu theo dõi học sinh đi về / không ăn bán trú',
      isBoarding: false,
      isNgoaiTru: true,
    };
  }

  if (isPrimary || code === 'ALL' || code.includes('TOAN_TRUONG') || name.includes('toàn trường')) {
    return {
      typeKey: 'users',
      Icon: Users,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100 border-blue-300',
      badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
      label: 'Học sinh toàn trường',
      description: 'Tổng số học sinh biên chế chính thức của lớp',
      isBoarding: false,
      isNgoaiTru: false,
    };
  }

  const matched = INDICATOR_ICON_OPTIONS.find((opt) => opt.id === iconKey);
  const Icon = matched ? matched.Icon : Users;

  return {
    typeKey: iconKey || 'users',
    Icon,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-300',
    badgeClass: 'bg-slate-100 text-slate-800 border border-slate-200',
    label: ig?.name || 'Chỉ tiêu',
    description: ig?.column_header_override || 'Chỉ tiêu thống kê',
    isBoarding: false,
    isNgoaiTru: false,
  };
}

export function getIndicatorIcon(key: string): LucideIcon {
  const opt = INDICATOR_ICON_OPTIONS.find((o) => o.id === key);
  return opt ? opt.Icon : Users;
}
