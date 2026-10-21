import { Student } from '../types';
import { inferGenderFromName } from './studentUtils';

export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export interface ParsedStudentResult {
  students: Array<Omit<Student, 'id' | 'created_at'>>;
  totalStudents: number;
  boardingCount: number;
  dayCount: number;
}

export function parseStudentExcelData(
  rawData: any[],
  classId: string
): ParsedStudentResult {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return { students: [], totalStudents: 0, boardingCount: 0, dayCount: 0 };
  }

  const students: Array<Omit<Student, 'id' | 'created_at'>> = [];
  let boardingCount = 0;
  let dayCount = 0;

  // Find header row or field names
  let headerIndex = -1;
  let nameColIdx = -1;
  let genderColIdx = -1;
  let birthDateColIdx = -1;
  let addressColIdx = -1;
  let boardingColIdx = -1;

  for (let r = 0; r < Math.min(rawData.length, 10); r++) {
    const row = rawData[r];
    if (Array.isArray(row)) {
      row.forEach((cell, idx) => {
        const text = removeVietnameseAccents(String(cell || ''));
        if (text.includes('ho va ten') || text.includes('ho ten') || text === 'ten') {
          nameColIdx = idx;
          headerIndex = r;
        }
        if (text.includes('gioi tinh') || text === 'nam/nu') genderColIdx = idx;
        if (text.includes('ngay sinh') || text.includes('nam sinh')) birthDateColIdx = idx;
        if (text.includes('dia chi') || text.includes('thon') || text.includes('ban') || text.includes('noi o')) addressColIdx = idx;
        if (text.includes('ban tru') || text.includes('dien') || text.includes('che do')) boardingColIdx = idx;
      });
      if (headerIndex !== -1) break;
    } else if (typeof row === 'object' && row !== null) {
      // Row is object
      headerIndex = 0;
      break;
    }
  }

  const startRow = headerIndex >= 0 ? headerIndex + 1 : 0;

  for (let i = startRow; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row) continue;

    let fullName = '';
    let gender = '';
    let birthDate = '';
    let address = '';
    let isBoarding = true; // default boarding

    if (Array.isArray(row)) {
      if (nameColIdx >= 0) {
        fullName = String(row[nameColIdx] || '').trim();
      } else {
        // Fallback: look for first text cell that looks like a name
        const textCell = row.find(c => typeof c === 'string' && c.trim().length > 3 && !/^\d+$/.test(c.trim()));
        if (textCell) fullName = textCell.trim();
      }

      if (genderColIdx >= 0) gender = String(row[genderColIdx] || '').trim();
      if (birthDateColIdx >= 0) birthDate = String(row[birthDateColIdx] || '').trim();
      if (addressColIdx >= 0) address = String(row[addressColIdx] || '').trim();

      if (boardingColIdx >= 0) {
        const bText = removeVietnameseAccents(String(row[boardingColIdx] || ''));
        if (bText.includes('ngoai tru') || bText.includes('khong') || bText.includes('o nha') || bText === '0') {
          isBoarding = false;
        }
      }
    } else if (typeof row === 'object') {
      const keys = Object.keys(row);
      for (const k of keys) {
        const normK = removeVietnameseAccents(k);
        const val = String(row[k] || '').trim();
        if (normK.includes('ho va ten') || normK.includes('ho ten') || normK === 'ten') fullName = val;
        else if (normK.includes('gioi tinh')) gender = val;
        else if (normK.includes('ngay sinh') || normK.includes('nam sinh')) birthDate = val;
        else if (normK.includes('dia chi') || normK.includes('ban') || normK.includes('thon')) address = val;
        else if (normK.includes('ban tru') || normK.includes('dien')) {
          const valNorm = removeVietnameseAccents(val);
          if (valNorm.includes('ngoai tru') || valNorm.includes('khong')) isBoarding = false;
        }
      }
    }

    if (fullName && fullName.length >= 2 && !/^(tong|stt|ho ten|ghi chu)/i.test(fullName)) {
      if (!gender) gender = inferGenderFromName(fullName);

      if (isBoarding) boardingCount++;
      else dayCount++;

      students.push({
        class_id: classId,
        full_name: fullName,
        gender: gender.toLowerCase().includes('nữ') || gender.toLowerCase().includes('nu') ? 'Nữ' : 'Nam',
        birth_date: birthDate || undefined,
        address: address || undefined,
        village: address || undefined,
        isBoarding,
        is_boarding: isBoarding,
      });
    }
  }

  return {
    students,
    totalStudents: students.length,
    boardingCount,
    dayCount,
  };
}
