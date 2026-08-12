import React, { useState } from 'react';
import { Group, Student } from '../types';
import { 
  getGroups, 
  getStudents, 
  addGroup, 
  updateGroup, 
  deleteGroup, 
  getGroupAttendanceStats 
} from '../services/storageService';
import { 
  BookOpen, 
  Plus, 
  Users, 
  Clock, 
  MapPin, 
  DollarSign, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  PauseCircle, 
  UserPlus, 
  BarChart2, 
  Calendar,
  X
} from 'lucide-react';

export const GroupManagement: React.FC = () => {
  const groups = getGroups();
  const students = getStudents();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<Group | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Khối 8');
  const [subject, setSubject] = useState('Toán');
  const [schedule, setSchedule] = useState('Thứ 2 – 4 – 6');
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('19:00');
  const [location, setLocation] = useState('Phòng 201 – Cơ sở Cầu Giấy');
  const [tuition, setTuition] = useState('1.200.000 VNĐ / tháng');
  const [status, setStatus] = useState<'active' | 'paused'>('active');

  const openCreateModal = () => {
    setEditingGroup(null);
    setName('');
    setGrade('Khối 8');
    setSubject('Toán');
    setSchedule('Thứ 2 – 4 – 6');
    setStartTime('17:30');
    setEndTime('19:00');
    setLocation('Phòng 201 – Cơ sở Cầu Giấy');
    setTuition('1.200.000 VNĐ / tháng');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    setName(group.name);
    setGrade(group.grade);
    setSubject(group.subject);
    setSchedule(group.schedule);
    setStartTime(group.startTime);
    setEndTime(group.endTime);
    setLocation(group.location);
    setTuition(group.tuition || '');
    setStatus(group.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingGroup) {
      updateGroup({
        ...editingGroup,
        name,
        grade,
        subject,
        schedule,
        startTime,
        endTime,
        location,
        tuition,
        status,
      });
    } else {
      addGroup({
        name,
        grade,
        subject,
        teacherName: 'Thầy Mạnh',
        schedule,
        startTime,
        endTime,
        location,
        tuition,
        status,
      });
    }

    setModalOpen(false);
  };

  const handleDeleteGroup = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm học "${name}" không?`)) {
      deleteGroup(id);
      if (selectedGroupDetail?.id === id) setSelectedGroupDetail(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            QUẢN LÝ NHÓM HỌC TOÁN
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tạo và chỉnh sửa danh sách lớp học, thời khóa biểu, học phí và theo dõi chuyên cần theo nhóm.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>TẠO NHÓM HỌC MỚI</span>
        </button>
      </div>

      {/* Group Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map((grp) => {
          const groupStudents = students.filter((s) => s.groupId === grp.id && s.status === 'active');
          const stats = getGroupAttendanceStats(grp.id);

          return (
            <div
              key={grp.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                {/* Top header badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {grp.grade} • {grp.subject}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                      {grp.name}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                    grp.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}>
                    {grp.status === 'active' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <PauseCircle className="w-3 h-3" />}
                    <span>{grp.status === 'active' ? 'Đang học' : 'Tạm dừng'}</span>
                  </span>
                </div>

                {/* Info List */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Lịch: <strong>{grp.schedule}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Giờ học: <strong>{grp.startTime} – {grp.endTime}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">Địa điểm: {grp.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Học phí: {grp.tuition}</span>
                  </div>
                </div>

                {/* Progress Attendance Gauge */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{groupStudents.length} Học Sinh</span>
                    </span>
                    <span className="font-bold text-emerald-700">Chuyên cần: {stats.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedGroupDetail(grp)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Xem Chi Tiết</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(grp)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(grp.id, grp.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Xóa nhóm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Group Detail Overview */}
      {selectedGroupDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-auto max-h-[90vh] flex flex-col">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs text-blue-400 font-bold uppercase">{selectedGroupDetail.grade} • {selectedGroupDetail.subject}</span>
                <h2 className="text-xl font-extrabold">{selectedGroupDetail.name}</h2>
              </div>
              <button
                onClick={() => setSelectedGroupDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Lịch học</span>
                  <strong className="text-slate-900 text-sm">{selectedGroupDetail.schedule}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Khung giờ</span>
                  <strong className="text-slate-900 text-sm">{selectedGroupDetail.startTime} - {selectedGroupDetail.endTime}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Sĩ số</span>
                  <strong className="text-blue-600 text-sm">{students.filter(s => s.groupId === selectedGroupDetail.id && s.status === 'active').length} HS</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Chuyên cần</span>
                  <strong className="text-emerald-600 text-sm">{getGroupAttendanceStats(selectedGroupDetail.id).attendanceRate}%</strong>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-2 uppercase">
                  Danh Sách Học Sinh Trong Nhóm
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {students
                    .filter((s) => s.groupId === selectedGroupDetail.id && s.status === 'active')
                    .map((stu, i) => (
                      <div key={stu.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-slate-400 w-5">#{i + 1}</span>
                          <div>
                            <div className="font-bold text-slate-900">{stu.name} (Lớp {stu.class})</div>
                            <div className="text-[11px] text-slate-500">PH: {stu.parentName} – {stu.parentPhone}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {stu.phone}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right shrink-0">
              <button
                onClick={() => setSelectedGroupDetail(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Đóng Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Create/Edit Group */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-auto">
            
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingGroup ? 'Chỉnh Sửa Nhóm Học' : 'Tạo Nhóm Học Mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-blue-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tên Nhóm Học *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: TOÁN 8A – NHÓM 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Khối Học</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                    <option value="Khối 10">Khối 10</option>
                    <option value="Khối 11">Khối 11</option>
                    <option value="Khối 12">Khối 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Trạng Thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'paused')}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="active">Đang học</option>
                    <option value="paused">Tạm dừng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Lịch Học Trong Tuần</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thứ 2 – 4 – 6"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Giờ Bắt Đầu</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Giờ Kết Thúc</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Địa Điểm Học</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phòng 201 – Cơ sở Cầu Giấy"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Học Phí</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1.200.000 VNĐ / tháng"
                  value={tuition}
                  onChange={(e) => setTuition(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md"
                >
                  {editingGroup ? 'Lưu Thay Đổi' : 'Tạo Nhóm Mới'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
