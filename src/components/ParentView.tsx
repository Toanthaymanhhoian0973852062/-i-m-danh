import React, { useState } from 'react';
import { User, Student, Group, Session, AttendanceRecord, NotificationItem } from '../types';
import { 
  getStudents, 
  getGroups, 
  getSessions, 
  getAttendance, 
  getNotifications, 
  getStudentAttendanceStats,
  markNotificationRead,
  getUsers
} from '../services/storageService';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  BookOpen, 
  Phone, 
  Award,
  ChevronRight,
  Sparkles,
  MapPin,
  UserX
} from 'lucide-react';

interface ParentViewProps {
  currentUser: User;
}

export const ParentView: React.FC<ParentViewProps> = ({ currentUser }) => {
  const allStudents = getStudents();
  const groups = getGroups();
  const sessions = getSessions();
  const attendance = getAttendance();
  const notifications = getNotifications();

  const users = getUsers();
  const teachers = users.filter((u) => u.role === 'teacher');
  
  // Find linked student for this parent
  const linkedStudent = allStudents.find((s) => s.id === currentUser.studentId) || allStudents[0];
  const group = groups.find((g) => g.id === linkedStudent?.groupId);
  
  const teacher = group 
    ? teachers.find(t => {
        const shortName = group.teacherName?.replace('Thầy ', '')?.replace('Cô ', '') || '';
        return t.name.includes(shortName);
      }) || teachers[0]
    : teachers[0];

  const stats = linkedStudent ? getStudentAttendanceStats(linkedStudent.id) : null;

  // Student's session attendance records
  const studentRecords = attendance.filter((a) => a.studentId === linkedStudent?.id);

  // Parent notifications
  const parentNotifs = notifications.filter(
    (n) => n.studentId === linkedStudent?.id || n.userId === currentUser.id
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Banner / Child Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/50 border-2 border-blue-400/30 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
              🎓
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-blue-400/30">
                  CỔNG THÔNG TIN PHỤ HUYNH
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-0.5">
                CON CỦA TÔI: {linkedStudent?.name}
              </h1>
              <p className="text-blue-100 text-xs mt-1">
                Lớp <strong className="text-white">{linkedStudent?.class}</strong> • Lớp Toán: <strong className="text-amber-300">{group?.name}</strong>
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-[10px] font-bold text-blue-200 uppercase block">Tỷ lệ chuyên cần</span>
            <span className="text-3xl font-extrabold text-emerald-400">{stats?.attendanceRate}%</span>
          </div>

        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Column 1 & 2: Attendance Stats & History */}
        <div className="md:col-span-2 space-y-5">
          
          {/* Section: TÌNH HÌNH HỌC TẬP */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>TÌNH HÌNH HỌC TẬP & CHUYÊN CẦN</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-semibold block">Tổng buổi</span>
                <strong className="text-slate-900 text-lg font-extrabold">{stats?.totalSessions}</strong>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <span className="text-emerald-700 text-[10px] uppercase font-semibold block">🟢 Có mặt</span>
                <strong className="text-lg font-extrabold">{stats?.presentCount}</strong>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                <span className="text-amber-700 text-[10px] uppercase font-semibold block">🟡 Đi trễ</span>
                <strong className="text-lg font-extrabold">{stats?.lateCount}</strong>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-800">
                <span className="text-blue-700 text-[10px] uppercase font-semibold block">🔵 Vắng phép</span>
                <strong className="text-lg font-extrabold">{stats?.excusedAbsentCount}</strong>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 col-span-2 sm:col-span-1">
                <span className="text-red-700 text-[10px] uppercase font-semibold block">🔴 Vắng KP</span>
                <strong className="text-lg font-extrabold">{stats?.unexcusedAbsentCount}</strong>
              </div>

            </div>
          </div>

          {/* Section: LỊCH SỬ ĐIỂM DANH */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>LỊCH SỬ ĐIỂM DANH TỪNG BUỔI</span>
            </h2>

            <div className="space-y-2">
              {studentRecords.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Chưa có dữ liệu điểm danh.</p>
              ) : (
                studentRecords.map((rec) => {
                  const ses = sessions.find((s) => s.id === rec.sessionId);
                  const dateParts = (ses?.date || '2026-08-10').split('-');
                  const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

                  return (
                    <div
                      key={rec.id}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs hover:bg-slate-100 transition"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          Buổi học ngày {formattedDate} ({ses?.startTime} – {ses?.endTime})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {ses?.topic || 'Nội dung bài học Toán'}
                        </div>
                        {rec.note && (
                          <div className="text-[11px] text-amber-700 italic mt-0.5">
                            Ghi chú từ giáo viên: "{rec.note}"
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {rec.status === 'present' && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                            🟢 Có mặt
                          </span>
                        )}
                        {rec.status === 'late' && (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-xs">
                            🟡 Đi trễ
                          </span>
                        )}
                        {rec.status === 'excused_absent' && (
                          <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-xs">
                            🔵 Vắng có phép
                          </span>
                        )}
                        {rec.status === 'unexcused_absent' && (
                          <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-xs">
                            🔴 Vắng không phép
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Column 3: Schedule & Teacher Contact & Notifications */}
        <div className="space-y-5">
          
          {/* Section: LỊCH HỌC */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>LỊCH HỌC CỦA CON</span>
            </h2>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2 text-xs">
              <div className="font-bold text-indigo-950 text-sm">{group?.name}</div>
              <div className="text-slate-700">📅 Lịch: <strong>{group?.schedule}</strong></div>
              <div className="text-slate-700">⏰ Khung giờ: <strong>{group?.startTime} – {group?.endTime}</strong></div>
              <div className="text-slate-700 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{group?.location}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">Giáo viên phụ trách:</div>
              <div className="text-slate-700">{teacher?.name || 'Chưa phân công'}</div>
              {teacher?.phone && (
                <div className="text-emerald-700 font-bold flex items-center space-x-1 pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${teacher.phone}`} className="hover:underline">{teacher.phone}</a>
                </div>
              )}
            </div>
          </div>

          {/* Section: THÔNG BÁO TỪ GIÁO VIÊN */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Bell className="w-4 h-4 text-red-500" />
                <span>THÔNG BÁO ĐIỂM DANH</span>
              </h2>
              {parentNotifs.length > 0 && (
                <span className="bg-red-100 text-red-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {parentNotifs.length} thông báo
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {parentNotifs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Chưa có thông báo nào.</p>
              ) : (
                parentNotifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      !n.readStatus
                        ? 'bg-red-50/80 border-red-200 text-slate-900 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                      <span>{n.title}</span>
                      {!n.readStatus && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] whitespace-pre-line leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>{new Date(n.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="text-emerald-600 font-bold">{n.channelsSent?.join(' • ') || 'Đã gửi'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
