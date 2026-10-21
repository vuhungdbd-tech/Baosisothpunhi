import * as XLSX from 'xlsx';
import { StorageService } from '../services/storage';

export interface ExportMonthlyBoardingExcelOptions {
  classId: string;
  className: string;
  campusName?: string;
  schoolName?: string;
  monthStr: string; // 'YYYY-MM'
  teacherName?: string;
  principalName?: string;
  students?: any[];
  signatureSettings?: any;
}

export async function exportMonthlyBoardingExcel(options: ExportMonthlyBoardingExcelOptions): Promise<void> {
  const wb = XLSX.utils.book_new();
  const schoolName = options.schoolName || 'TRƯỜNG PTDTBT THCS XA DUNG';
  const className = options.className || '';
  const monthStr = options.monthStr;

  let students: any[] = options.students || [];
  if (students.length === 0) {
    try {
      const allStudents = await StorageService.getStudents();
      students = allStudents.filter(
        (s) => s.class_id === options.classId && (s.isBoarding === true || (s as any).is_boarding === true)
      );
    } catch (err) {
      console.warn('Error fetching students for boarding excel:', err);
    }
  }

  const [yearStr, monthNumStr] = monthStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthNumStr, 10);
  const daysInMonth = new Date(y, m, 0).getDate();

  const dayHeaders: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dayHeaders.push(String(d));
  }

  const headerRows = [
    [schoolName.toUpperCase(), '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    ['', '', '', 'Độc lập - Tự do - Hạnh phúc'],
    [''],
    [`SỔ CHẤM ĂN HỌC SINH BÁN TRÚ - THÁNG ${m}/${y} - LỚP ${className}`],
    [`Điểm trường / Phân hiệu: ${options.campusName || 'Khu chính'}`],
    [''],
    ['STT', 'Họ và tên', 'Địa chỉ / Bản', 'Giới tính', ...dayHeaders, 'Tổng cộng ngày ăn'],
  ];

  const studentRows = students.map((std, idx) => {
    const dailyMarks = Array(daysInMonth).fill('x'); // default mark x (ăn)
    return [
      idx + 1,
      std.full_name,
      std.address || std.village || '',
      std.gender || 'Nam',
      ...dailyMarks,
      daysInMonth,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...studentRows]);
  XLSX.utils.book_append_sheet(wb, ws, `Bán Trú Lớp ${className}`.substring(0, 31));

  const fileName = `So_Cham_An_Ban_Tru_Lop_${className}_${monthStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
