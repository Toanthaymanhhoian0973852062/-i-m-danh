import React, { useState, useEffect } from 'react';
import { Session, Group, Student, AttendanceStatus, AttendanceRecord, NotificationItem } from '../types';
import { 
  getGroups, 
  getStudents, 
  getAttendance, 
  saveSessionAttendance 
} from '../services/storageService';
import { processAttendanceNotifications, DispatchNotificationResult } from '../services/notificationService';
import { 
  CheckCircle2, 
  Clock, 
  UserX, 
  AlertTriangle, 
  Zap, 
  Save, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  Check, 
  Mail, 
  PhoneCall, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface QuickAttendanceModalProps {
  session: Session;
  onClose: () => void;
  onSaved: () => void;
}

export const QuickAttendanceModal: React.FC<QuickAttendanceModalProps> = ({
  session,
  onClose,
  onSaved,
}) => {
  const groups = getGroups();
  const allStudents = getStudents();
  const existingAttendance = getAttendance().filter((a) => a.sessionId === session.id);

  const group = groups.find((g) => g.id === session.groupId);
  const groupStudents = allStudents.filter(
    (s) => s.groupId === session.groupId && s.status === 'active'
  );

  // Map studentId -> status & note
  const [records, setRecords] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >({});

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [notificationResults, setNotificationResults] = useState<DispatchNotificationResult[] | null>(null);

  // Initialize records from existing attendance or default to unmarked
  useEffect(() => {
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    
    groupStudents.forEach((stu) => {
      const match = existingAttendance.find((a) => a.studentId === stu.id);
      if (match) {
        initialMap[stu.id] = { status: match.status, note: match.note || '' };
      } else {
        initialMap[stu.id] = { status: 'unmarked', note: '' };
      }
    });

    setRecords(initialMap);
  }, [session.id]);

  // Fast action: MARK ALL PRESENT
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    groupStudents.forEach((stu) => {
      updated[stu.id] = {
        status: 'present',
        note: records[stu.id]?.note || '',
      };
    });
    setRecords(updated);
  };

  // Change individual student status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Change individual student note
  const handleSetNote = (studentId: string, note: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  // Save & process notifications
  const handleSaveAttendance = () => {
    // Check if any student is still unmarked
    const unmarkedList = groupStudents.filter(
      (stu) => !records[stu.id] || records[stu.id].status === 'unmarked'
    );

    if (unmarkedList.length > 0) {
      const confirmUnmarked = window.confirm(
        `Còn ${unmarkedList.length} học sinh chưa được đánh dấu điểm danh. Bạn có muốn đánh dấu các học sinh này là CÓ MẶT và lưu không?`
      );
      if (confirmUnmarked) {
        handleMarkAllPresent();
      } else {
        return;
      }
    }

    setSaving(true);

    const payload = groupStudents.map((stu) => ({
      studentId: stu.id,
      status: records[stu.id]?.status || 'present',
      note: records[stu.id]?.note || '',
    }));

    // 1. Save to local storage
    saveSessionAttendance(session.id, payload);

    // 2. Automatically dispatch notifications for absent/late students
    const dispatched = processAttendanceNotifications(session, group?.name || 'Nhóm học', payload);

    setSaving(false);
    setSuccessToast(true);

    if (dispatched.length > 0) {
      setNotificationResults(dispatched);
    } else {
      setTimeout(() => {
        onSaved();
      }, 1200);
    }
  };

  // Count current statistics
  const currentValues = Object.values(records) as { status: AttendanceStatus; note: string }[];
  const countPresent = currentValues.filter((r) => r.status === 'present').length;
  const countLate = currentValues.filter((r) => r.status === 'late').length;
  const countExcused = currentValues.filter((r) => r.status === 'excused_absent').length;
  const countUnexcused = currentValues.filter((r) => r.status === 'unexcused_absent').length;
  const countUnmarked = currentValues.filter((r) => r.status === 'unmarked').length;

  // Date formatting
  const dateParts = session.date.split('-');
  const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-auto my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 sm:p-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg sm:text-lg sm:text-xl font-extrabold tracking-tight">
                  ĐIỂM DANH: {group?.name || 'Nhóm học'}
                </h2>
                <div className="text-xs text-blue-200 flex items-center space-x-3 mt-0.5">
                  <span>📅 Ngày {displayDate}</span>
                  <span>⏰ {session.startTime} – {session.endTime}</span>
                  <span>👥 {groupStudents.length} học sinh</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Counter Bar */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-blue-800/60 text-center text-xs">
            <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-1.5">
              <span className="text-emerald-400 font-bold block text-sm sm:text-base">{countPresent}</span>
              <span className="text-[10px] text-emerald-200 uppercase font-medium">🟢 Có mặt</span>
            </div>
            <div className="bg-amber-950/60 border border-amber-500/30 rounded-lg p-1.5">
              <span className="text-amber-400 font-bold block text-sm sm:text-base">{countLate}</span>
              <span className="text-[10px] text-amber-200 uppercase font-medium">🟡 Đi trễ</span>
            </div>
            <div className="bg-blue-950/60 border border-blue-500/30 rounded-lg p-1.5">
              <span className="text-blue-400 font-bold block text-sm sm:text-base">{countExcused}</span>
              <span className="text-[10px] text-blue-200 uppercase font-medium">🔵 Vắng phép</span>
            </div>
            <div className="bg-red-950/60 border border-red-500/30 rounded-lg p-1.5">
              <span className="text-red-400 font-bold block text-sm sm:text-base">{countUnexcused}</span>
              <span className="text-[10px] text-red-200 uppercase font-medium">🔴 Vắng KP</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-1.5 hidden sm:block">
              <span className="text-slate-300 font-bold block text-sm sm:text-base">{countUnmarked}</span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Chưa chọn</span>
            </div>
          </div>
        </div>

        {/* Toolbar: FAST ACTION MARK ALL PRESENT */}
        <div className="p-3 bg-blue-50/80 border-b border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-blue-900 font-medium flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Thao tác nhanh: Bấm nút dưới đây để đánh dấu tất cả có mặt, sau đó chỉ việc chỉnh các em vắng/trễ.</span>
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>⚡ ĐIỂM DANH TẤT CẢ CÓ MẶT</span>
          </button>
        </div>

        {/* Student List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100">
          {groupStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              Chưa có học sinh nào trong nhóm học này. Vào mục "Học sinh" để thêm học sinh vào nhóm.
            </div>
          ) : (
            groupStudents.map((stu, index) => {
              const currentStatus = records[stu.id]?.status || 'unmarked';
              const currentNote = records[stu.id]?.note || '';

              return (
                <div
                  key={stu.id}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition ${
                    currentStatus === 'present'
                      ? 'bg-emerald-50/40 border border-emerald-200/50'
                      : currentStatus === 'late'
                      ? 'bg-amber-50/40 border border-amber-200/50'
                      : currentStatus === 'unexcused_absent'
                      ? 'bg-red-50/40 border border-red-200/50'
                      : currentStatus === 'excused_absent'
                      ? 'bg-blue-50/40 border border-blue-200/50'
                      : 'bg-white border border-slate-200/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    {/* Student Info */}
                    <div className="flex items-center space-x-3">
                      <span className="w-6 text-center text-xs font-bold text-slate-400">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                          <span>{stu.name}</span>
                          <span className="text-xs font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            Lớp {stu.class}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          PH: <strong className="text-slate-700">{stu.parentName}</strong> ({stu.parentPhone})
                        </div>
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 shrink-0 sm:w-auto w-full">
                      
                      {/* Present */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(stu.id, 'present')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                      >
                        <span>🟢 Có mặt</span>
                      </button>

                      {/* Late */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(stu.id, 'late')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                          currentStatus === 'late'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500'
                            : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800'
                        }`}
                      >
                        <span>🟡 Đi trễ</span>
                      </button>

                      {/* Excused Absent */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(stu.id, 'excused_absent')}
                        className={`px-2 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                          currentStatus === 'excused_absent'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-800'
                        }`}
                      >
                        <span>🔵 Vắng phép</span>
                      </button>

                      {/* Unexcused Absent */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(stu.id, 'unexcused_absent')}
                        className={`px-2 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                          currentStatus === 'unexcused_absent'
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-800'
                        }`}
                      >
                        <span>🔴 Vắng KP</span>
                      </button>

                    </div>
                  </div>

                  {/* Note Input if Late or Absent */}
                  {(currentStatus === 'late' || currentStatus === 'excused_absent' || currentStatus === 'unexcused_absent') && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-slate-500 shrink-0">Ghi chú/Lý do:</span>
                      <input
                        type="text"
                        placeholder={
                          currentStatus === 'late'
                            ? 'Đi trễ 15 phút, kẹt xe...'
                            : currentStatus === 'excused_absent'
                            ? 'Bị sốt, phụ huynh đã nhắn...'
                            : 'Chưa thấy phụ huynh liên hệ...'
                        }
                        value={currentNote}
                        onChange={(e) => handleSetNote(stu.id, e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {successToast ? (
              <span className="text-emerald-600 font-bold flex items-center space-x-1 animate-bounce">
                <Check className="w-4 h-4" />
                <span>Đã lưu điểm danh thành công!</span>
              </span>
            ) : (
              <span>💡 Nhấn <strong>Lưu & Gửi Thông Báo</strong> để hoàn tất và báo phụ huynh.</span>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAttendance}
              className="w-1/2 sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'LƯU & GỬI THÔNG BÁO'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Notification Dispatch Modal Preview */}
      {notificationResults && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 border border-slate-200">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Đã Lưu & Phát Thông Báo Cho Phụ Huynh!
              </h3>
              <p className="text-xs text-slate-600">
                Hệ thống đã tự động tạo và gửi thông báo điểm danh cho phụ huynh các học sinh vắng hoặc đi trễ:
              </p>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {notificationResults.map((res, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{res.notification.studentName} ({res.notification.title.split(':')[1] || 'Thông báo'})</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                      {res.notification.parentName}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 italic">"{res.notification.message}"</p>
                  <div className="flex items-center space-x-2 text-[10px] text-emerald-700 pt-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Kênh phát: {res.deliveredChannels.join(' • ')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setNotificationResults(null);
                  onSaved();
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-md transition"
              >
                Xác Nhận & Hoàn Tất
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
