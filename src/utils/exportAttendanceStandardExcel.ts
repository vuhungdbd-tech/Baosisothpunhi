import * as XLSX from 'xlsx';
import { SchoolSettings, Campus, ClassItem } from '../types';

export const DEFAULT_CLASS_TEACHER_MAP: Record<string, string> = {
  '6A1': 'Cô Lò Thị Thu',
  '6A2': 'Thầy Quàng Văn Tuấn',
  '7A1': 'Cô Hoàng Thị Mai',
  '7A2': 'Thầy Nguyễn Văn Nam',
  '8A1': 'Cô Trần Thị Lan',
  '8A2': 'Thầy Vũ Văn Hùng',
  '9A1': 'Cô Phạm Thị Nga',
  '9A2': 'Thầy Lường Văn Sơn',
};

export function resolveTeacherName(className: string, currentName?: string): string {
  if (currentName && currentName.trim() && !currentName.startsWith('GVCN')) {
    return currentName.trim();
  }
  const clean = (className || '').trim().toUpperCase();
  if (DEFAULT_CLASS_TEACHER_MAP[clean]) {
    return DEFAULT_CLASS_TEACHER_MAP[clean];
  }
  return currentName || `GVCN Lớp ${className}`;
}

export interface ClassDailyRowData {
  classId: string;
  className: string;
  teacherName?: string;
  totalAll: number;
  presentAll: number;
  absentAll: number;
  totalBoarding?: number;
  presentBoarding?: number;
  absentBoarding?: number;
  baoAnBoarding?: number;
  totalNgoaiTru?: number;
  absentNgoaiTru?: number;
  studentNames?: string;
  studentAddresses?: string;
  absentRate?: number;
  presentRate?: number;
  isReported?: boolean;
  notes?: string;
}

export interface MonthlyDayRowData {
  date: string;
  dayOfWeek?: number;
  dayLabel?: string;
  isReported: boolean;
  totalAll: number;
  presentAll: number;
  absentAll: number;
  teacherName?: string;
  totalBoarding?: number;
  presentBoarding?: number;
  absentBoarding?: number;
  baoAnBoarding?: number;
  totalNgoaiTru?: number;
  absentNgoaiTru?: number;
  studentNames?: string;
  studentAddresses?: string;
  notes?: string;
  presentRate?: number;
  absentRate?: number;
}

export interface ExportAttendanceDailyExcelOptions {
  settings?: SchoolSettings | null;
  campuses?: Campus[];
  selectedCampusId?: string;
  reportDate: string;
  blankDateInTitle?: boolean;
  exportBlankTemplate?: boolean;
  rows: ClassDailyRowData[];
  selectedClassId?: string;
  selectedClassName?: string;
  signatureSettings?: any;
}

export async function exportAttendanceDailyExcel(options: ExportAttendanceDailyExcelOptions): Promise<void> {
  const wb = XLSX.utils.book_new();
  const schoolName = options.settings?.school_name || 'TRƯỜNG PTDTBT THCS XA DUNG';
  
  const headers = [
    ['UBND HUYỆN ĐIỆN BIÊN ĐÔNG', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    [schoolName.toUpperCase(), '', '', 'Độc lập - Tự do - Hạnh phúc'],
    [''],
    [`BÁO CÁO THEO DÕI SĨ SỐ HỌC SINH NGÀY ${options.blankDateInTitle ? '..... THÁNG ..... NĂM 2026' : options.reportDate}`],
    [''],
    [
      'STT',
      'Lớp',
      'GVCN',
      'Tổng số HS',
      'Có mặt',
      'Vắng mặt',
      'Bán trú TS',
      'Bán trú ăn',
      'Ngoại trú',
      'Học sinh vắng (Lý do)',
      'Địa chỉ / Bản',
      'Tỷ lệ đi học (%)',
    ],
  ];

  const dataRows = options.rows.map((r, i) => [
    i + 1,
    r.className,
    r.teacherName || '',
    options.exportBlankTemplate ? '' : r.totalAll,
    options.exportBlankTemplate ? '' : r.presentAll,
    options.exportBlankTemplate ? '' : r.absentAll,
    options.exportBlankTemplate ? '' : (r.totalBoarding || 0),
    options.exportBlankTemplate ? '' : (r.baoAnBoarding || r.presentBoarding || 0),
    options.exportBlankTemplate ? '' : (r.totalNgoaiTru || 0),
    options.exportBlankTemplate ? '' : (r.studentNames || ''),
    options.exportBlankTemplate ? '' : (r.studentAddresses || ''),
    options.exportBlankTemplate ? '' : `${(r.presentRate || 0).toFixed(1)}%`,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...headers, ...dataRows]);
  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo ngày');

  const fileName = `Bao_Cao_Si_So_${options.reportDate || 'Ngay'}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export interface ExportAttendanceMonthlyClassExcelOptions {
  settings?: SchoolSettings | null;
  campusName?: string;
  yearMonth: string;
  classItem: ClassItem;
  teacherName?: string;
  rows?: MonthlyDayRowData[];
  monthlyData?: any;
  signatureSettings?: any;
}

export async function exportAttendanceMonthlyClassExcel(options: ExportAttendanceMonthlyClassExcelOptions): Promise<void> {
  const wb = XLSX.utils.book_new();
  const schoolName = options.settings?.school_name || 'TRƯỜNG PTDTBT THCS XA DUNG';
  const className = options.classItem.class_name;

  const headers = [
    [schoolName.toUpperCase(), '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    [`SỔ THEO DÕI SĨ SỐ THÁNG ${options.yearMonth} - LỚP ${className}`],
    [`Giáo viên chủ nhiệm: ${options.teacherName || ''}`],
    [''],
    ['Ngày', 'Thứ', 'Tổng số', 'Có mặt', 'Vắng', 'Bán trú có mặt', 'Học sinh vắng', 'Địa chỉ', 'Tỷ lệ (%)'],
  ];

  const rawRows = options.rows || options.monthlyData?.rows || [];
  const dataRows = rawRows.map((r: MonthlyDayRowData) => [
    r.date,
    r.dayLabel || '',
    r.totalAll,
    r.presentAll,
    r.absentAll,
    r.presentBoarding || r.totalBoarding || 0,
    r.studentNames || '',
    r.studentAddresses || '',
    `${(r.presentRate || 0).toFixed(1)}%`,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...headers, ...dataRows]);
  XLSX.utils.book_append_sheet(wb, ws, `Lớp ${className}`);

  const fileName = `So_Si_So_Lop_${className}_${options.yearMonth}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export interface ExportAttendanceMonthlyAllClassesExcelOptions {
  settings?: SchoolSettings | null;
  campusName?: string;
  yearMonth: string;
  summaryRows: ClassDailyRowData[];
  classesDayRows?: Array<{
    classItem: ClassItem;
    teacherName: string;
    rows: MonthlyDayRowData[];
  }>;
  signatureSettings?: any;
}

export async function exportAttendanceMonthlyAllClassesExcel(options: ExportAttendanceMonthlyAllClassesExcelOptions): Promise<void> {
  const wb = XLSX.utils.book_new();
  const schoolName = options.settings?.school_name || 'TRƯỜNG PTDTBT THCS XA DUNG';

  // 1. Summary sheet
  const summaryHeaders = [
    [schoolName.toUpperCase()],
    [`BẢNG TỔNG HỢP THEO DÕI SĨ SỐ THÁNG ${options.yearMonth}`],
    [''],
    ['STT', 'Lớp', 'GVCN', 'Tổng số HS', 'Tổng lượt có mặt', 'Tổng lượt vắng', 'Bán trú', 'Tỷ lệ chuyên cần (%)'],
  ];

  const summaryData = options.summaryRows.map((r, i) => [
    i + 1,
    r.className,
    r.teacherName || '',
    r.totalAll,
    r.presentAll,
    r.absentAll,
    r.totalBoarding || 0,
    `${(r.presentRate || 0).toFixed(1)}%`,
  ]);

  const wsSummary = XLSX.utils.aoa_to_sheet([...summaryHeaders, ...summaryData]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp toàn trường');

  // 2. Individual class sheets
  if (options.classesDayRows && options.classesDayRows.length > 0) {
    for (const cEntry of options.classesDayRows) {
      const cRows = cEntry.rows.map((r) => [
        r.date,
        r.dayLabel || '',
        r.totalAll,
        r.presentAll,
        r.absentAll,
        r.presentBoarding || 0,
        r.studentNames || '',
        r.studentAddresses || '',
        `${(r.presentRate || 0).toFixed(1)}%`,
      ]);

      const cSheet = XLSX.utils.aoa_to_sheet([
        [`LỚP ${cEntry.classItem.class_name} - THÁNG ${options.yearMonth}`],
        [`GVCN: ${cEntry.teacherName}`],
        [''],
        ['Ngày', 'Thứ', 'Tổng số', 'Có mặt', 'Vắng', 'Bán trú', 'Học sinh vắng', 'Địa chỉ', 'Tỷ lệ'],
        ...cRows,
      ]);
      XLSX.utils.book_append_sheet(wb, cSheet, `Lớp ${cEntry.classItem.class_name}`.substring(0, 31));
    }
  }

  const fileName = `So_Tong_Hop_Si_So_Thang_${options.yearMonth}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
