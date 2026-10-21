import { Student, ClassItem, DailyReport } from '../types';

export interface DropoutRiskAnalysis {
  student: Student;
  classItem?: ClassItem;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  absentCount: number;
  reasons: string[];
  recommendations: string[];
}

export const AIPredictiveService = {
  calculateDropoutRisk(
    students: Student[],
    classes: ClassItem[],
    reports: DailyReport[],
    _schoolYearId?: string
  ): DropoutRiskAnalysis[] {
    const classMap = new Map(classes.map((c) => [c.id, c]));

    // Count absences per student name from recent reports
    const absenceCounts = new Map<string, { count: number; reasons: string[] }>();

    for (const rep of reports) {
      if (rep.absent_students && Array.isArray(rep.absent_students)) {
        for (const ab of rep.absent_students) {
          const norm = (ab.full_name || '').trim().toLowerCase();
          if (!norm) continue;
          const cur = absenceCounts.get(norm) || { count: 0, reasons: [] };
          cur.count += 1;
          if (ab.reason && !cur.reasons.includes(ab.reason)) {
            cur.reasons.push(ab.reason);
          }
          absenceCounts.set(norm, cur);
        }
      }
    }

    const results: DropoutRiskAnalysis[] = [];

    for (const std of students) {
      const norm = std.full_name.trim().toLowerCase();
      const absInfo = absenceCounts.get(norm);
      const absentCount = absInfo ? absInfo.count : 0;
      const reasons = absInfo ? absInfo.reasons : [];
      const cls = classMap.get(std.class_id);

      // Determine risk score based on absences and address
      let score = Math.min(100, absentCount * 18);
      if (std.address && (std.address.toLowerCase().includes('bản xa') || std.address.toLowerCase().includes('huổi') || std.address.toLowerCase().includes('háng'))) {
        score = Math.min(100, score + 15);
      }

      let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (score >= 60 || absentCount >= 3) {
        riskLevel = 'CRITICAL';
        if (score < 75) score = 75;
      } else if (score >= 35 || absentCount >= 2) {
        riskLevel = 'HIGH';
        if (score < 50) score = 50;
      } else if (score >= 15 || absentCount >= 1) {
        riskLevel = 'MEDIUM';
      }

      if (absentCount > 0 || riskLevel !== 'LOW') {
        results.push({
          student: std,
          classItem: cls,
          riskLevel,
          riskScore: score,
          absentCount,
          reasons: reasons.length > 0 ? reasons : ['Vắng học không rõ lý do', 'Nhà xa điểm trường'],
          recommendations: [
            'GVCN chủ động liên hệ với gia đình học sinh',
            'Phối hợp với trưởng bản để nắm bắt tình hình và vận động đến lớp',
            'Hỗ trợ chế độ bán trú đầy đủ',
          ],
        });
      }
    }

    return results.sort((a, b) => b.riskScore - a.riskScore);
  },
};
