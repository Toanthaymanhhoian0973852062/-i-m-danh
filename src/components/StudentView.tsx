import React from 'react';
import { User } from '../types';
import { getStudents, getGroups, getSessions, getAttendance, getStudentAttendanceStats } from '../services/storageService';
import { GraduationCap, Calendar, Clock, Award, CheckCircle2, UserX, AlertTriangle } from 'lucide-react';

interface StudentViewProps {
  currentUser: User;
}

export const StudentView: React.FC<StudentViewProps> = ({ currentUser }) => {
  const students = getStudents();
  const groups = getGroups();
  const sessions = getSessions();
  const attendance = getAttendance();

  const student = students.find((s) => s.id === currentUser.studentId) || students[0];
  const group = groups.find((g) => g.id === student?.groupId);
  const stats = student ? getStudentAttendanceStats(student.id) : null;
  const myRecords = attendance.filter((a) => a.studentId === student?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/50 border border-blue-400/30 flex items-center justify-center text-3xl font-bold">
            🎓
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
              TRANG HỌC SINH
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-1">Xin chào, {student?.name}!</h1>
            <p className="text-xs text-blue-100">Lớp {student?.class} • Nhóm Toán: {group?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase mb-4 flex items-center space-x-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>KẾT QUẢ CHUYÊN CẦN CỦA TÔI</span>
            </h2>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">TỔNG BUỔI</span>
                <strong className="text-slate-900 text-base">{stats?.totalSessions}</strong>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <span className="block text-[10px]">🟢 CÓ MẶT</span>
                <strong className="text-base">{stats?.presentCount}</strong>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                <span className="block text-[10px]">🟡 ĐI TRỄ</span>
                <strong className="text-base">{stats?.lateCount}</strong>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800">
                <span className="block text-[10px]">🔴 VẮNG</span>
                <strong className="text-base">{(stats?.excusedAbsentCount || 0) + (stats?.unexcusedAbsentCount || 0)}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>LỊCH SỬ THAM GIA LỚP HỌC</span>
            </h2>

            <div className="space-y-2">
              {myRecords.map((rec) => {
                const ses = sessions.find((s) => s.id === rec.sessionId);
                return (
                  <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Ngày {ses?.date} ({ses?.startTime} – {ses?.endTime})</div>
                      <div className="text-[11px] text-slate-500">{ses?.topic}</div>
                    </div>
                    <div>
                      {rec.status === 'present' && <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">🟢 Có mặt</span>}
                      {rec.status === 'late' && <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">🟡 Đi trễ</span>}
                      {rec.status === 'excused_absent' && <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full">🔵 Vắng có phép</span>}
                      {rec.status === 'unexcused_absent' && <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">🔴 Vắng không phép</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>LỊCH HỌC TOÁN</span>
            </h2>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1 text-xs">
              <div className="font-bold text-indigo-950">{group?.name}</div>
              <div className="text-slate-700">📅 Lịch: <strong>{group?.schedule}</strong></div>
              <div className="text-slate-700">⏰ Khung giờ: <strong>{group?.startTime} – {group?.endTime}</strong></div>
              <div className="text-slate-700">📍 {group?.location}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
