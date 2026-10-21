import { BoardingMealRecord, SchoolSettings, Student } from '../types';

export interface BoardingSeedStudent {
  name: string;
  village: string;
  gender?: 'Nam' | 'Nữ';
  birth_date?: string;
}

export const DEFAULT_BOARDING_STUDENTS_SEED: BoardingSeedStudent[] = [
  { name: 'Lò Thị Hoa', village: 'Bản Xa Dung A', gender: 'Nữ' },
  { name: 'Quàng Văn Nam', village: 'Bản Nà Sản A', gender: 'Nam' },
  { name: 'Lò Văn Dũng', village: 'Bản Suối Lư', gender: 'Nam' },
  { name: 'Lường Thị Lan', village: 'Bản Huổi Lốt', gender: 'Nữ' },
  { name: 'Cà Văn Hải', village: 'Bản Co Mạ', gender: 'Nam' },
  { name: 'Tòng Văn Hùng', village: 'Bản Pá Vạt', gender: 'Nam' },
  { name: 'Lò Thị Mai', village: 'Bản Xa Dung B', gender: 'Nữ' },
  { name: 'Quàng Thị Hương', village: 'Bản Nà Sản B', gender: 'Nữ' },
  { name: 'Lường Văn Minh', village: 'Bản Háng Tầu', gender: 'Nam' },
  { name: 'Vi Văn Sơn', village: 'Bản Làng Dung', gender: 'Nam' },
];

export interface MealSchedule {
  isMealDay: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  note?: string;
  dayName?: string;
}

export function getMealScheduleForDate(
  dateStr: string,
  _customSchedule?: any,
  settings?: SchoolSettings | null
): MealSchedule {
  const d = new Date(dateStr);
  const dayOfWeek = isNaN(d.getTime()) ? 1 : d.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const dayNames = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = dayNames[dayOfWeek] || 'Ngày học';

  // Sunday
  if (dayOfWeek === 0) {
    return {
      isMealDay: false,
      breakfast: false,
      lunch: false,
      dinner: false,
      note: 'Chủ nhật nghỉ',
      dayName,
    };
  }

  // Saturday
  if (dayOfWeek === 6) {
    const satBreakfast = Boolean(settings?.saturday_breakfast);
    const satLunch = Boolean(settings?.saturday_lunch);
    const satDinner = Boolean(settings?.saturday_dinner);
    const isSatMeal = satBreakfast || satLunch || satDinner;
    return {
      isMealDay: isSatMeal,
      breakfast: satBreakfast,
      lunch: satLunch,
      dinner: satDinner,
      note: isSatMeal ? 'Thứ 7 có chấm ăn' : 'Thứ 7 không có ăn',
      dayName,
    };
  }

  // Friday
  if (dayOfWeek === 5) {
    return {
      isMealDay: true,
      breakfast: settings?.friday_breakfast !== false,
      lunch: settings?.friday_lunch !== false,
      dinner: Boolean(settings?.friday_dinner),
      note: 'Thứ 6 chấm ăn bình thường',
      dayName,
    };
  }

  // Monday to Thursday
  return {
    isMealDay: true,
    breakfast: true,
    lunch: true,
    dinner: true,
    note: '',
    dayName,
  };
}

export function buildDefaultMealRecords(
  students: Student[],
  date: string,
  classId: string,
  absentMap?: Map<string, { reason?: string }>,
  settings?: SchoolSettings | null
): BoardingMealRecord[] {
  const schedule = getMealScheduleForDate(date, undefined, settings);

  return students.map((std, idx) => {
    const norm = std.full_name.trim().toLowerCase();
    const absentInfo = absentMap ? absentMap.get(norm) : undefined;
    const isAbsent = Boolean(absentInfo);

    return {
      id: `meal_${classId}_${date}_${std.id || idx}`,
      class_id: classId,
      date,
      student_id: std.id,
      student_name: std.full_name,
      gender: std.gender || 'Nam',
      village: std.address || std.village || '',
      breakfast: isAbsent ? false : schedule.breakfast,
      lunch: isAbsent ? false : schedule.lunch,
      dinner: isAbsent ? false : schedule.dinner,
      is_absent: isAbsent,
      absent_reason: absentInfo?.reason,
      created_at: new Date().toISOString(),
    };
  });
}
