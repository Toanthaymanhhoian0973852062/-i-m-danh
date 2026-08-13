import React, { useState } from 'react';
import { Group, Student, Session, AttendanceRecord } from '../types';
import { 
  getGroups, 
  getStudents, 
  getSessions, 
  getAttendance,
  addSession
} from '../services/storageService';
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  Clock, 
  UserX, 
  Plus, 
  Zap, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Sparkles,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';

interface TeacherDashboardProps {
  onOpenQuickAttendance: (session: Session) => void;
  onNavigateTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenQuickAttendance,
  onNavigateTab,
}) => {
  const groups = getGroups();
  const students = getStudents();
  const sessions = getSessions();
  const attendance = getAttendance();

  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [sessionDate, setSessionDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [sessionStartTime, setSessionStartTime] = useState('17:30');
  const [sessionEndTime, setSessionEndTime] = useState('19:00');
  const [sessionTopic, setSessionTopic] = useState('');

  // Selected date for viewing schedule
  const [selectedViewDate, setSelectedViewDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const isGroupScheduledOnDate = (schedule: string, dateStr: string) => {
    const dateObj = new Date(dateStr);
    const day = dateObj.getDay(); 
    const lowerSchedule = schedule.toLowerCase();
    
    if (day === 1) return lowerSchedule.includes('2') || lowerSchedule.includes('hai');
    if (day === 2) return lowerSchedule.includes('3') || lowerSchedule.includes('ba');
    if (day === 3) return lowerSchedule.includes('4') || lowerSchedule.includes('tư') || lowerSchedule.includes('tu');
    if (day === 4) return lowerSchedule.includes('5') || lowerSchedule.includes('năm') || lowerSchedule.includes('nam');
    if (day === 5) return lowerSchedule.includes('6') || lowerSchedule.includes('sáu') || lowerSchedule.includes('sau');
    if (day === 6) return lowerSchedule.includes('7') || lowerSchedule.includes('bảy') || lowerSchedule.includes('bay');
    if (day === 0) return lowerSchedule.includes('cn') || lowerSchedule.includes('chủ nhật') || lowerSchedule.includes('chu nhat');
    return false;
  };

  const recordedViewDateSessions = sessions.filter((s) => s.date === selectedViewDate);
  const recordedGroupIds = new Set(recordedViewDateSessions.map(s => s.groupId));

  const pendingSessions: Session[] = groups
    .filter(g => g.status === 'active' && !recordedGroupIds.has(g.id) && isGroupScheduledOnDate(g.schedule, selectedViewDate))
    .map(g => ({
      id: 'synthetic_' + g.id,
      groupId: g.id,
      date: selectedViewDate,
      startTime: g.startTime,
      endTime: g.endTime,
      isCompleted: false,
    }));

  const viewDateSessions = [...recordedViewDateSessions, ...pendingSessions].sort((a, b) => a.startTime.localeCompare(b.startTime));


  // Collect student stats for selected date's completed attendance
  const viewDateSessionIds = new Set(viewDateSessions.map((s) => s.id));
  const viewDateRecords = attendance.filter((a) => viewDateSessionIds.has(a.sessionId));

  const presentTodayCount = viewDateRecords.filter((r) => r.status === 'present').length;
  const lateTodayCount = viewDateRecords.filter((r) => r.status === 'late').length;
  const absentTodayCount = viewDateRecords.filter(
    (r) => r.status === 'excused_absent' || r.status === 'unexcused_absent'
  ).length;

  const totalActiveStudents = students.filter((s) => s.status === 'active').length;

  const handleOpenQuickAttendance = (ses: Session) => {
    if (ses.id.startsWith('synthetic_')) {
      const realSession = addSession({
        groupId: ses.groupId,
        date: ses.date,
        startTime: ses.startTime,
        endTime: ses.endTime,
        topic: ses.topic
      });
      onOpenQuickAttendance(realSession);
    } else {
      onOpenQuickAttendance(ses);
    }
  };


  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    const group = groups.find((g) => g.id === selectedGroupId);
    const newSession = addSession({
      groupId: selectedGroupId,
      date: sessionDate,
      startTime: sessionStartTime || group?.startTime || '17:30',
      endTime: sessionEndTime || group?.endTime || '19:00',
      topic: sessionTopic || `Buổi học môn ${group?.subject || 'Toán'}`,
    });

    setCreateSessionOpen(false);
    setSessionTopic('');
    // Automatically trigger fast attendance modal for new session
    onOpenQuickAttendance(newSession);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Quản Lý Lớp Học & Điểm Danh Nhanh</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Xin chào, Thầy Mạnh! 👋
            </h1>
            <p className="text-blue-100/80 text-sm mt-1 max-w-2xl">
              Hệ thống Quản lý Giảng dạy & Điểm danh.
              {viewDateSessions.length > 0 && (
                <span className="block mt-1">
                  Ngày <span className="font-bold text-amber-300">{selectedViewDate.split('-').reverse().join('/')}</span> có <span className="font-bold text-amber-300">{viewDateSessions.length} buổi học</span> scheduled. Chọn buổi học bên dưới để thực hiện điểm danh.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCreateSessionOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>TẠO BUỔI HỌC</span>
            </button>
            <button
              onClick={() => onNavigateTab('students')}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm px-3.5 py-2.5 rounded-xl transition flex items-center space-x-2"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Thêm Học Sinh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Groups */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>TỔNG NHÓM HỌC</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{groups.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-600 font-semibold">{groups.filter(g => g.status === 'active').length} active</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>TỔNG HỌC SINH</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{totalActiveStudents}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đang theo học</div>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>CÓ MẶT HÔM NAY</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600">{presentTodayCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">🟢 Đã ghi nhận</div>
        </div>

        {/* Late Today */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>ĐI TRỄ HÔM NAY</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600">{lateTodayCount}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">🟡 Cần nhắc nhở</div>
        </div>

        {/* Absent Today */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:border-red-300 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>VẮNG HÔM NAY</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-600">{absentTodayCount}</div>
          <div className="text-[11px] text-red-600 mt-1 font-medium">🔴 Tự động báo phụ huynh</div>
        </div>

      </div>

      {/* Main Section: BUỔI HỌC HÔM NAY */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">
                LỊCH DẠY
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách các nhóm học có ca dạy. Nhấn "Điểm danh" để thực hiện siêu nhanh.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <input
              type="date"
              value={selectedViewDate}
              onChange={(e) => setSelectedViewDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setCreateSessionOpen(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Buổi Học Mới</span>
            </button>
          </div>
        </div>

        {viewDateSessions.length === 0 ? (
          <div className="p-5 sm:p-8 text-center text-slate-500">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Không có buổi học nào scheduled trong ngày này.</p>
            <button
              onClick={() => setCreateSessionOpen(true)}
              className="mt-3 inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Buổi Học Mới Bắt Đầu Điểm Danh</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {viewDateSessions.map((ses) => {
              const group = groups.find((g) => g.id === ses.groupId);
              const groupStudents = students.filter((s) => s.groupId === ses.groupId && s.status === 'active');
              
              // Attendance check status
              const sesRecords = attendance.filter((a) => a.sessionId === ses.id);
              const isChecked = ses.isCompleted || sesRecords.length > 0;
              const presentCount = sesRecords.filter((r) => r.status === 'present').length;
              const lateCount = sesRecords.filter((r) => r.status === 'late').length;
              const absentCount = sesRecords.filter((r) => r.status === 'excused_absent' || r.status === 'unexcused_absent').length;

              return (
                <div 
                  key={ses.id}
                  className="p-4 sm:p-5 hover:bg-blue-50/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base sm:text-lg">
                        {group?.name || 'Nhóm học'}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">
                        {group?.grade}
                      </span>
                      {isChecked ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã điểm danh</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Chưa điểm danh</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center text-xs text-slate-600 gap-y-1 gap-x-4">
                      <div className="flex items-center space-x-1 text-blue-700 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ses.startTime} – {ses.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{groupStudents.length} học sinh</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{group?.location || 'Phòng học'}</span>
                      </div>
                    </div>

                    {ses.topic && (
                      <div className="text-xs text-slate-500 italic mt-0.5">
                        Chủ đề: {ses.topic}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {isChecked && (
                      <div className="text-right text-xs pr-2 hidden sm:block">
                        <div className="font-semibold text-slate-700">
                          🟢 {presentCount}  🟡 {lateCount}  🔴 {absentCount}
                        </div>
                        <div className="text-[10px] text-slate-400">Kết quả lưu</div>
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenQuickAttendance(ses)}
                      className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 ${
                        isChecked
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{isChecked ? 'Chỉnh Sửa Điểm Danh' : '⚡ ĐIỂM DANH HÔM NAY'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section: DANH SÁCH TẤT CẢ NHÓM HỌC */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            DANH SÁCH NHÓM HỌC QUẢN LÝ ({groups.length})
          </h2>
          <button
            onClick={() => onNavigateTab('groups')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Xem tất cả chi tiết</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((grp) => {
            const memberCount = students.filter((s) => s.groupId === grp.id && s.status === 'active').length;
            return (
              <div
                key={grp.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-900">{grp.name}</span>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                      {grp.grade}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lịch học:</span>
                      <span className="font-semibold text-slate-800">{grp.schedule} ({grp.startTime}–{grp.endTime})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Địa điểm:</span>
                      <span className="text-slate-800 truncate max-w-[200px]">{grp.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Số học sinh:</span>
                      <span className="font-bold text-blue-600">{memberCount} học sinh</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Học phí: <strong className="text-slate-800">{grp.tuition}</strong></span>
                  <button
                    onClick={() => onNavigateTab('groups')}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Quản lý nhóm →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: TẠO BUỔI HỌC MỚI */}
      {createSessionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-lg">Tạo Buổi Học Mới</h3>
              </div>
              <button
                onClick={() => setCreateSessionOpen(false)}
                className="text-blue-200 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chọn Nhóm Học *
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.schedule})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ngày Học *
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Giờ Bắt Đầu
                  </label>
                  <input
                    type="time"
                    value={sessionStartTime}
                    onChange={(e) => setSessionStartTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Giờ Kết Thúc
                  </label>
                  <input
                    type="time"
                    value={sessionEndTime}
                    onChange={(e) => setSessionEndTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chủ Đề Buổi Học (Không bắt buộc)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ôn tập Hình học chương 1..."
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateSessionOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Tạo & Mở Điểm Danh</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
