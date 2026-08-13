import React from 'react';
import { 
  getGroups, 
  getStudents, 
  getSessions, 
  getAttendance, 
  getGroupAttendanceStats, 
  getStudentAttendanceStats 
} from '../services/storageService';
import { Download, AlertTriangle, CheckCircle2, FileSpreadsheet, Users, BarChart3 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const groups = getGroups();
  const students = getStudents();
  const sessions = getSessions();
  const attendance = getAttendance();

  // Flagged students with <80% attendance or >1 unexcused absence
  const flaggedStudents = students.filter((s) => {
    const stats = getStudentAttendanceStats(s.id);
    return stats.attendanceRate < 80 || stats.unexcusedAbsentCount >= 1;
  });

  const handleExportAllCSV = () => {
    const headers = ['Mã HS', 'Tên học sinh', 'Lớp', 'Nhóm học', 'SĐT Phụ huynh', 'Tổng buổi', 'Có mặt', 'Đi trễ', 'Vắng phép', 'Vắng KP', 'Tỷ lệ %'];
    const rows = students.map((s) => {
      const g = groups.find((grp) => grp.id === s.groupId);
      const st = getStudentAttendanceStats(s.id);
      return [
        s.id,
        `"${s.name}"`,
        s.class,
        `"${g?.name || ''}"`,
        s.parentPhone,
        st.totalSessions,
        st.presentCount,
        st.lateCount,
        st.excusedAbsentCount,
        st.unexcusedAbsentCount,
        `${st.attendanceRate}%`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_chuyen_can_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            BÁO CÁO CHUYÊN CẦN & TỔNG HỢP
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo chi tiết theo lớp, học sinh có nguy cơ gián đoạn học tập và xuất file báo cáo.
          </p>
        </div>

        <button
          onClick={handleExportAllCSV}
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel/CSV Toàn Bộ</span>
        </button>
      </div>

      {/* Flagged Alert Box */}
      {flaggedStudents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center space-x-2 text-red-900 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>CẢNH BÁO HỌC SINH VẮNG NHIỀU HOẶC CHUYÊN CẦN THẤP (&lt;80%)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flaggedStudents.map((stu) => {
              const group = groups.find((g) => g.id === stu.groupId);
              const stats = getStudentAttendanceStats(stu.id);
              return (
                <div key={stu.id} className="p-3 bg-white rounded-xl border border-red-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{stu.name} (Lớp {stu.class})</div>
                    <div className="text-[11px] text-slate-500">Nhóm: {group?.name}</div>
                    <div className="text-[11px] text-red-600 font-semibold">
                      Phụ huynh: {stu.parentName} ({stu.parentPhone})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-red-600 block">{stats.attendanceRate}%</span>
                    <span className="text-[10px] text-slate-500 font-medium">🔴 Vắng KP: {stats.unexcusedAbsentCount} buổi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Group Summary Stats Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-900 text-sm">
          BÁO CÁO THEO NHÓM HỌC
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Nhóm Học</th>
                <th className="py-3 px-4">Khối</th>
                <th className="py-3 px-4">Sĩ Số</th>
                <th className="py-3 px-4">Tổng Buổi Đã Học</th>
                <th className="py-3 px-4">Tỷ Lệ Chuyên Cần Nhóm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((grp) => {
                const groupStudents = students.filter((s) => s.groupId === grp.id && s.status === 'active');
                const stats = getGroupAttendanceStats(grp.id);
                return (
                  <tr key={grp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{grp.name}</td>
                    <td className="py-3 px-4">{grp.grade}</td>
                    <td className="py-3 px-4 font-semibold">{groupStudents.length} học sinh</td>
                    <td className="py-3 px-4 font-semibold">{stats.totalSessions} buổi</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                        {stats.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
