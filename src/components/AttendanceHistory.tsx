import React, { useState } from 'react';
import { Group, Student, Session, AttendanceRecord } from '../types';
import { 
  getGroups, 
  getStudents, 
  getSessions, 
  getAttendance,
  getStudentAttendanceStats
} from '../services/storageService';
import { 
  UserCheck, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  UserX, 
  AlertCircle,
  Users
} from 'lucide-react';

export const AttendanceHistory: React.FC = () => {
  const groups = getGroups();
  const students = getStudents();
  const sessions = getSessions();
  const attendance = getAttendance();

  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered attendance records
  const filteredRecords = attendance.filter((rec) => {
    const session = sessions.find((s) => s.id === rec.sessionId);
    if (!session) return false;

    const student = students.find((st) => st.id === rec.studentId);
    if (!student) return false;

    const matchesGroup = selectedGroupId === 'all' || session.groupId === selectedGroupId;
    const matchesStudent = selectedStudentId === 'all' || rec.studentId === selectedStudentId;

    const term = searchTerm.toLowerCase();
    const matchesTerm =
      student.name.toLowerCase().includes(term) ||
      session.date.includes(term) ||
      (rec.note && rec.note.toLowerCase().includes(term));

    return matchesGroup && matchesStudent && matchesTerm;
  });

  // Calculate selected student summary if 1 student picked
  const selectedStudentObj = students.find((s) => s.id === selectedStudentId);
  const selectedStudentStats = selectedStudentId !== 'all' ? getStudentAttendanceStats(selectedStudentId) : null;

  // CSV Export functionality
  const handleExportCSV = () => {
    const headers = ['STT', 'Ngày học', 'Nhóm học', 'Tên học sinh', 'Lớp', 'Trạng thái điểm danh', 'Ghi chú'];
    const rows = filteredRecords.map((rec, i) => {
      const session = sessions.find((s) => s.id === rec.sessionId);
      const group = groups.find((g) => g.id === session?.groupId);
      const student = students.find((st) => st.id === rec.studentId);

      const statusText =
        rec.status === 'present'
          ? 'Có mặt'
          : rec.status === 'late'
          ? 'Đi trễ'
          : rec.status === 'excused_absent'
          ? 'Vắng có phép'
          : 'Vắng không phép';

      return [
        i + 1,
        session?.date || '',
        `"${group?.name || ''}"`,
        `"${student?.name || ''}"`,
        student?.class || '',
        statusText,
        `"${rec.note || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lich_su_diem_danh_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            LỊCH SỬ & THỐNG KÊ ĐIỂM DANH
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu dữ liệu điểm danh theo ngày, theo nhóm hoặc xem hồ sơ chuyên cần từng học sinh.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Xuất Báo Cáo CSV / Excel</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Search Term */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tìm kiếm</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tên học sinh, từ khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Group */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Lọc theo Nhóm Học</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">Tất cả nhóm học</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Student */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Lọc theo Học Sinh</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">Tất cả học sinh</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Lớp {s.class})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Selected Student Stat Highlight Card */}
      {selectedStudentObj && selectedStudentStats && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-800/80 pb-3">
            <div>
              <span className="text-xs text-blue-300 font-bold uppercase">Hồ sơ chuyên cần cá nhân</span>
              <h2 className="text-xl font-extrabold">{selectedStudentObj.name}</h2>
              <p className="text-xs text-blue-200">
                Lớp {selectedStudentObj.class} • PH: {selectedStudentObj.parentName} ({selectedStudentObj.parentPhone})
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Tỷ lệ chuyên cần</span>
              <span className="text-2xl font-extrabold text-emerald-400">{selectedStudentStats.attendanceRate}%</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-xs pt-1">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <span className="text-blue-200 block text-[10px]">TỔNG BUỔI</span>
              <strong className="text-base text-white">{selectedStudentStats.totalSessions}</strong>
            </div>
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <span className="text-emerald-300 block text-[10px]">CÓ MẶT</span>
              <strong className="text-base text-emerald-300">{selectedStudentStats.presentCount}</strong>
            </div>
            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <span className="text-amber-300 block text-[10px]">ĐI TRỄ</span>
              <strong className="text-base text-amber-300">{selectedStudentStats.lateCount}</strong>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <span className="text-blue-300 block text-[10px]">VẮNG PHÉP</span>
              <strong className="text-base text-blue-300">{selectedStudentStats.excusedAbsentCount}</strong>
            </div>
            <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
              <span className="text-red-300 block text-[10px]">VẮNG KP</span>
              <strong className="text-base text-red-300">{selectedStudentStats.unexcusedAbsentCount}</strong>
            </div>
          </div>
        </div>
      )}

      {/* History Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Ngày Học</th>
                <th className="py-3.5 px-4">Nhóm Học</th>
                <th className="py-3.5 px-4">Học Sinh</th>
                <th className="py-3.5 px-4">Trạng Thái Điểm Danh</th>
                <th className="py-3.5 px-4">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Không tìm thấy dữ liệu điểm danh nào.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => {
                  const session = sessions.find((s) => s.id === rec.sessionId);
                  const group = groups.find((g) => g.id === session?.groupId);
                  const student = students.find((st) => st.id === rec.studentId);

                  const dateParts = (session?.date || '2026-08-10').split('-');
                  const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formattedDate}
                        <div className="text-[10px] text-slate-400 font-normal">{session?.startTime} - {session?.endTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{group?.name}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {student?.name}
                        <span className="text-[11px] text-slate-400 ml-1.5 font-normal">({student?.class})</span>
                      </td>
                      <td className="py-3 px-4">
                        {rec.status === 'present' && (
                          <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-100 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Có mặt</span>
                          </span>
                        )}
                        {rec.status === 'late' && (
                          <span className="inline-flex items-center space-x-1 text-amber-800 bg-amber-100 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Đi trễ</span>
                          </span>
                        )}
                        {rec.status === 'excused_absent' && (
                          <span className="inline-flex items-center space-x-1 text-blue-800 bg-blue-100 font-bold text-xs px-2.5 py-1 rounded-full border border-blue-300">
                            <UserX className="w-3.5 h-3.5 text-blue-600" />
                            <span>Vắng có phép</span>
                          </span>
                        )}
                        {rec.status === 'unexcused_absent' && (
                          <span className="inline-flex items-center space-x-1 text-red-800 bg-red-100 font-bold text-xs px-2.5 py-1 rounded-full border border-red-300">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Vắng không phép</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic">
                        {rec.note || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
