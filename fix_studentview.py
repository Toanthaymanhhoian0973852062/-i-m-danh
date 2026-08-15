content = """import React, { useState } from 'react';
import { User, GradeRecord } from '../types';
import { getGradeRecords, saveGradeRecord, deleteGradeRecord, getStudents, getGroups, getSessions, getAttendance, getStudentAttendanceStats } from '../services/storageService';
import { GraduationCap, Book, Plus, Trash2, Calendar, Clock, Award, CheckCircle2, UserX, AlertTriangle } from 'lucide-react';

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

  const [grades, setGrades] = useState<GradeRecord[]>(getGradeRecords().filter(g => g.studentId === student?.id));
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [newGrade, setNewGrade] = useState<Partial<GradeRecord>>({});

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    const record: GradeRecord = {
      id: `grade_${Date.now()}`,
      studentId: student.id,
      examName: newGrade.examName || 'Kiểm tra',
      score: Number(newGrade.score) || 0,
      date: newGrade.date || new Date().toISOString().split('T')[0],
      subject: newGrade.subject || 'Toán',
      notes: newGrade.notes || '',
      createdAt: new Date().toISOString()
    };
    saveGradeRecord(record);
    setGrades(getGradeRecords().filter(g => g.studentId === student.id));
    setShowGradeForm(false);
    setNewGrade({});
  };

  const handleDeleteGrade = (id: string) => {
    if (confirm("Xóa điểm này?")) {
      deleteGradeRecord(id);
      setGrades(getGradeRecords().filter(g => g.studentId === student?.id));
    }
  };

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

        <div className="space-y-5">
          {/* GRADES SECTION */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2">
                <Book className="w-4 h-4 text-indigo-600" />
                <span>BÁO CÁO ĐIỂM SỐ</span>
              </h2>
              <button onClick={() => setShowGradeForm(!showGradeForm)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition">
                <Plus className="w-3 h-3" />
                Báo điểm
              </button>
            </div>

            {showGradeForm && (
              <form onSubmit={handleSaveGrade} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ thi / Bài kiểm tra *</label>
                    <input required type="text" value={newGrade.examName || ''} onChange={e => setNewGrade({...newGrade, examName: e.target.value})} placeholder="Vd: Thi Giữa Kì 1" className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                    <input type="text" value={newGrade.subject || 'Toán'} onChange={e => setNewGrade({...newGrade, subject: e.target.value})} className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Điểm số *</label>
                    <input required type="number" step="0.1" min="0" max="10" value={newGrade.score || ''} onChange={e => setNewGrade({...newGrade, score: Number(e.target.value)})} className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ngày thi</label>
                    <input type="date" value={newGrade.date || ''} onChange={e => setNewGrade({...newGrade, date: e.target.value})} className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thêm</label>
                    <input type="text" value={newGrade.notes || ''} onChange={e => setNewGrade({...newGrade, notes: e.target.value})} className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setShowGradeForm(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg">Hủy</button>
                  <button type="submit" className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg">Lưu điểm</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {grades.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-4 bg-slate-50 rounded-xl border border-slate-100">
                  Chưa có điểm nào được báo cáo.
                </div>
              ) : (
                grades.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(g => (
                  <div key={g.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{g.examName}</div>
                      <div className="text-xs text-slate-500">{g.subject} • Ngày: {g.date}</div>
                      {g.notes && <div className="text-[10px] text-slate-400 mt-0.5">📝 {g.notes}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-black text-indigo-600 bg-indigo-50 w-10 h-10 flex items-center justify-center rounded-lg">{g.score}</div>
                      <button onClick={() => handleDeleteGrade(g.id)} className="text-slate-400 hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

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
"""
with open("src/components/StudentView.tsx", "w") as f:
    f.write(content)
