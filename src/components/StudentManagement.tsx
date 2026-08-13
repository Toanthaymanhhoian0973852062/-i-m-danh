import React, { useState } from 'react';
import { Student, Group } from '../types';
import { 
  getStudents, 
  getGroups, 
  addStudent, 
  addStudentsBulk, 
  updateStudent, 
  deleteStudent,
  getStudentAttendanceStats,
  addNotification,
  getUsers
} from '../services/storageService';
import { 
  Users, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Phone, 
  Mail, 
  Calendar, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Filter, 
  BarChart2, 
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
  QrCode,
  Banknote
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const students = getStudents();
  const groups = getGroups();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroupId, setFilterGroupId] = useState('all');
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkNotifModalOpen, setBulkNotifModalOpen] = useState(false);
  const [bulkNotifGroupId, setBulkNotifGroupId] = useState('');
  const [bulkNotifTitle, setBulkNotifTitle] = useState('');
  const [bulkNotifMessage, setBulkNotifMessage] = useState('');
  const [bulkNotifIncludeQR, setBulkNotifIncludeQR] = useState(false);
  const [bulkNotifImageBase64, setBulkNotifImageBase64] = useState('');
  
  const [tuitionNotifModalOpen, setTuitionNotifModalOpen] = useState(false);
  const [tuitionNotifGroupId, setTuitionNotifGroupId] = useState('');
  const [tuitionNotifMonth, setTuitionNotifMonth] = useState((new Date().getMonth() + 1).toString());
  const [tuitionNotifIncludeQR, setTuitionNotifIncludeQR] = useState(false);
  const [tuitionNotifImageBase64, setTuitionNotifImageBase64] = useState('');

  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifStudent, setNotifStudent] = useState<Student | null>(null);
  const [notifType, setNotifType] = useState<'info' | 'reminder'>('info');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifIncludeQR, setNotifIncludeQR] = useState(false);
  const [notifImageBase64, setNotifImageBase64] = useState('');
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<Student | null>(null);

  // Form states for Single Student
  const [name, setName] = useState('');
  const [dob, setDob] = useState('2012-01-01');
  const [stuClass, setStuClass] = useState('8A1');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
    const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [showLoginPassword, setShowLoginPassword] = useState(true);

  // Bulk Import text area
  const [bulkRawText, setBulkRawText] = useState(
    `Nguyễn Hoàng Anh, 8A1, 0981112233, Nguyễn Văn Hoàng, 0912121212, hoangparent@gmail.com
Trần Đức Trí, 8A2, 0982223344, Trần Thu Hương, 0903030303, huongparent@gmail.com
Phạm Ngọc Linh, 8A1, 0983334455, Phạm Văn Hải, 0934343434, haiparent@gmail.com`
  );

  const openCreateModal = () => {
    setEditingStudent(null);
    setName('');
    setDob('2012-05-10');
    setStuClass('8A1');
    setPhone('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setGroupId(groups[0]?.id || '');
    setStartDate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
    setStatus('active');
    setLoginPassword('123456');
    setSingleModalOpen(true);
  };

  const openEditModal = (stu: Student) => {
    setEditingStudent(stu);
    setName(stu.name);
    setDob(stu.dob);
    setStuClass(stu.class);
    setPhone(stu.phone);
    setParentName(stu.parentName);
    setParentPhone(stu.parentPhone);
    setParentEmail(stu.parentEmail);
    setGroupId(stu.groupId);
    setStartDate(stu.startDate);
    setStatus(stu.status);
    setLoginPassword(stu.password || '123456');
    setSingleModalOpen(true);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !parentName) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        name,
        dob,
        class: stuClass,
        phone,
        parentName,
        parentPhone,
        parentEmail,
        groupId,
        startDate,
        status,
        password: loginPassword,
      });
    } else {
      addStudent({
        name,
        dob,
        class: stuClass,
        phone,
        parentName,
        parentPhone,
        parentEmail,
        groupId,
        startDate,
        status,
      }, loginPassword);
    }

    setSingleModalOpen(false);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkRawText.trim()) return;

    const lines = bulkRawText.split('\n').filter((l) => l.trim().length > 0);
    const newStudentsPayload: Omit<Student, 'id'>[] = [];

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        newStudentsPayload.push({
          name: parts[0] || 'Học sinh mới',
          dob: '2012-01-01',
          class: parts[1] || '8A',
          phone: parts[2] || '',
          parentName: parts[3] || 'Phụ huynh',
          parentPhone: parts[4] || '',
          parentEmail: parts[5] || '',
          groupId: groupId || groups[0]?.id || '',
          startDate: new Date().toISOString().split('T')[0],
          status: 'active',
        });
      }
    });

    if (newStudentsPayload.length > 0) {
      addStudentsBulk(newStudentsPayload, '123456');
      setBulkModalOpen(false);
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Xóa học sinh ${name}?`)) {
      deleteStudent(id);
      if (selectedStudentProfile?.id === id) setSelectedStudentProfile(null);
    }
  };

  const handleOpenNotifModal = (stu: Student) => {
    setNotifStudent(stu);
    setNotifType('info');
    setNotifTitle('Thông báo học tập');
    setNotifMessage(`Kính gửi phụ huynh em ${stu.name},\n\n`);
    setNotifIncludeQR(false);
    setNotifImageBase64('');
    setNotifModalOpen(true);
  };

  const handleSendTuitionNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuitionNotifGroupId) {
      alert('Vui lòng chọn nhóm/lớp!');
      return;
    }
    
    const targetStudents = students.filter(s => s.groupId === tuitionNotifGroupId);
    if (targetStudents.length === 0) {
      alert('Nhóm này chưa có học sinh nào!');
      return;
    }

    const group = groups.find(g => g.id === tuitionNotifGroupId);
    const users = getUsers();
    
    let qrSuffix = '';
    if (tuitionNotifIncludeQR) {
      qrSuffix += '\n\n[Đính kèm Mã QR Thanh toán - Giáo viên có thể bổ sung sau]';
      if (tuitionNotifImageBase64) {
        qrSuffix += `\n[QR_IMAGE_BASE64]${tuitionNotifImageBase64}[/QR_IMAGE_BASE64]`;
      }
    }

    targetStudents.forEach(stu => {
      const parentUser = users.find(u => u.role === 'parent' && u.phone === stu.parentPhone);
      const message = `Kính gửi phụ huynh em ${stu.name},\n\nTrung tâm xin thông báo học phí tháng ${tuitionNotifMonth} của em tại lớp ${group?.name || 'học'}. Kính mong phụ huynh hoàn thành học phí sớm nhất.\n\nTrân trọng cảm ơn!${qrSuffix}`;
      
      addNotification({
        userId: parentUser ? parentUser.id : 'unknown',
        studentId: stu.id,
        studentName: stu.name,
        parentName: stu.parentName,
        parentPhone: stu.parentPhone,
        title: `Thông báo học phí tháng ${tuitionNotifMonth}`,
        message: message,
        type: 'reminder',
        channelsSent: ['In-App']
      });
    });

    setTuitionNotifModalOpen(false);
    setTuitionNotifGroupId('');
    setTuitionNotifMonth((new Date().getMonth() + 1).toString());
    setTuitionNotifIncludeQR(false);
    setTuitionNotifImageBase64('');
    alert(`Đã gửi thông báo học phí cho ${targetStudents.length} phụ huynh!`);
  };

  const handleSendBulkNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkNotifGroupId) {
      alert('Vui lòng chọn nhóm/lớp!');
      return;
    }
    
    const targetStudents = students.filter(s => s.groupId === bulkNotifGroupId);
    if (targetStudents.length === 0) {
      alert('Nhóm này chưa có học sinh nào!');
      return;
    }

    const users = getUsers();
    
    let finalMessage = bulkNotifMessage;
    if (bulkNotifIncludeQR) {
      finalMessage += '\n\n[Đính kèm Mã QR Thanh toán - Giáo viên có thể bổ sung sau]';
      if (bulkNotifImageBase64) {
        finalMessage += `\n[QR_IMAGE_BASE64]${bulkNotifImageBase64}[/QR_IMAGE_BASE64]`;
      }
    }

    targetStudents.forEach(stu => {
      const parentUser = users.find(u => u.role === 'parent' && u.phone === stu.parentPhone);
      addNotification({
        userId: parentUser ? parentUser.id : 'unknown',
        studentId: stu.id,
        studentName: stu.name,
        parentName: stu.parentName,
        parentPhone: stu.parentPhone,
        title: bulkNotifTitle,
        message: `Kính gửi phụ huynh em ${stu.name},\n\n${finalMessage}`,
        type: 'info',
        channelsSent: ['In-App']
      });
    });

    setBulkNotifModalOpen(false);
    setBulkNotifGroupId('');
    setBulkNotifTitle('');
    setBulkNotifMessage('');
    setBulkNotifIncludeQR(false);
    setBulkNotifImageBase64('');
    alert(`Đã gửi thông báo thành công cho ${targetStudents.length} phụ huynh!`);
  };

  const handleSendNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifStudent) return;
    
    const users = getUsers();
    const parentUser = users.find(u => u.role === 'parent' && u.phone === notifStudent.parentPhone);
    
    let finalMessage = notifMessage;
    if (notifIncludeQR) {
      finalMessage += '\n\n[Đính kèm Mã QR Thanh toán - Giáo viên có thể bổ sung sau]';
      if (notifImageBase64) {
        finalMessage += `\n[QR_IMAGE_BASE64]${notifImageBase64}[/QR_IMAGE_BASE64]`;
      }
    }

    addNotification({
      userId: parentUser ? parentUser.id : 'unknown',
      studentId: notifStudent.id,
      studentName: notifStudent.name,
      parentName: notifStudent.parentName,
      parentPhone: notifStudent.parentPhone,
      title: notifTitle,
      message: finalMessage,
      type: notifType,
      channelsSent: ['In-App']
    });

    setNotifModalOpen(false);
    alert('Đã gửi thông báo thành công cho phụ huynh!');
  };

  // Search & Filtered
  const filteredStudents = students.filter((s) => {
    const matchesGroup = filterGroupId === 'all' || s.groupId === filterGroupId;
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      s.name.toLowerCase().includes(term) ||
      s.phone.includes(term) ||
      s.parentName.toLowerCase().includes(term) ||
      s.parentPhone.includes(term) ||
      s.class.toLowerCase().includes(term);

    return matchesGroup && matchesTerm;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            QUẢN LÝ HỌC SINH & PHỤ HUYNH
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng số: <strong className="text-blue-600">{students.length} học sinh</strong> trong hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBulkNotifModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition"
          >
            <Bell className="w-4 h-4" />
            <span>Gửi thông báo lớp</span>
          </button>
          
          <button
            onClick={() => setBulkModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📥 Nhập từ Excel/CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>THÊM HỌC SINH</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, phụ huynh, lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-medium shrink-0">Lọc theo nhóm:</span>
          <select
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
            className="w-full sm:w-48 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">Tất cả nhóm học ({students.length})</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Họ và Tên Học Sinh</th>
                <th className="py-3.5 px-4">Lớp Trường</th>
                <th className="py-3.5 px-4">Nhóm Học Toán</th>
                <th className="py-3.5 px-4">Phụ Huynh & SĐT Contact</th>
                <th className="py-3.5 px-4 text-center">Chuyên Cần</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Không tìm thấy học sinh phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu, index) => {
                  const group = groups.find((g) => g.id === stu.groupId);
                  const stats = getStudentAttendanceStats(stu.id);

                  return (
                    <tr key={stu.id} className="hover:bg-blue-50/30 transition">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedStudentProfile(stu)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm block text-left"
                        >
                          {stu.name}
                        </button>
                        <div className="text-[11px] text-slate-400">
                          SĐT: {stu.phone || 'Chưa cập nhật'}
                        </div>
                        <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
                          Mật khẩu: {stu.password || '123456'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">Lớp {stu.class}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-50 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                          {group?.name || 'Chưa xếp nhóm'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{stu.parentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <a href={`tel:${stu.parentPhone}`} className="hover:underline font-bold text-emerald-700">
                            {stu.parentPhone}
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full font-bold text-[11px] ${
                          stats.attendanceRate >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : stats.attendanceRate >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {stats.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenNotifModal(stu)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Gửi thông báo"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(stu)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stu.id, stu.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Single Student Create/Edit */}
      {singleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-auto">
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingStudent ? 'Sửa Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới'}
              </h3>
              <button onClick={() => setSingleModalOpen(false)} className="text-blue-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSingleSubmit} className="p-5 space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Họ và Tên Học Sinh *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Lớp Tại Trường</label>
                  <input
                    type="text"
                    placeholder="8A1"
                    value={stuClass}
                    onChange={(e) => setStuClass(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">SĐT Học Sinh</label>
                  <input
                    type="text"
                    placeholder="0981112233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Chọn Nhóm Học *</label>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="text-blue-900 font-extrabold uppercase block mb-2">Thông Tin Phụ Huynh (Nhận Thông Báo)</span>
                
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Họ Tên Phụ Huynh *</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn Bình"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">SĐT Phụ Huynh *</label>
                      <input
                        type="text"
                        placeholder="0912345678"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Email Phụ Huynh</label>
                      <input
                        type="email"
                        placeholder="parent@gmail.com"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Mật Khẩu Đăng Nhập * (Cho cả PH và HS)</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mặc định (vd: 123456)"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-amber-50 border-amber-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md"
                >
                  {editingStudent ? 'Lưu Thay Đổi' : 'Thêm Học Sinh'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Import from CSV / Excel Text */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-auto">
            <div className="bg-emerald-800 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-lg">Nhập Danh Sách Học Sinh Từ Excel/CSV</h3>
              </div>
              <button onClick={() => setBulkModalOpen(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Thêm Vào Nhóm Học:</label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Dán Dữ Liệu (Mỗi dòng 1 học sinh theo định dạng):
                </label>
                <div className="text-[10px] text-slate-500 mb-1">
                  Cú pháp: <code className="bg-slate-100 px-1 font-mono">Tên, Lớp, SĐT_HọcSinh, Tên_PhụHuynh, SĐT_PhụHuynh, Email_PhụHuynh</code>
                </div>
                <textarea
                  rows={6}
                  value={bulkRawText}
                  onChange={(e) => setBulkRawText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Dự kiến thêm: <strong>{bulkRawText.split('\n').filter((l) => l.trim()).length} em</strong>
                </span>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                  >
                    Import Danh Sách
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Drawer Profile Student Detail */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-slate-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Hồ sơ học sinh</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">{selectedStudentProfile.name}</h3>
              </div>
              <button onClick={() => setSelectedStudentProfile(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Lớp tại trường:</span>
                <strong className="text-slate-900">{selectedStudentProfile.class}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SĐT Học sinh:</span>
                <strong className="text-slate-900">{selectedStudentProfile.phone || 'Chưa cập nhật'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phụ huynh:</span>
                <strong className="text-slate-900">{selectedStudentProfile.parentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SĐT Phụ huynh:</span>
                <a href={`tel:${selectedStudentProfile.parentPhone}`} className="text-emerald-600 font-bold hover:underline">
                  {selectedStudentProfile.parentPhone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Phụ huynh:</span>
                <span className="text-slate-800">{selectedStudentProfile.parentEmail || 'Chưa cập nhật'}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl text-xs space-y-1">
              <div className="font-bold text-blue-900">Thống kê chuyên cần:</div>
              {(() => {
                const stats = getStudentAttendanceStats(selectedStudentProfile.id);
                return (
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-2 bg-white rounded border border-blue-100">
                      <span className="text-slate-500 block text-[10px]">Tổng buổi</span>
                      <strong className="text-slate-900 text-sm">{stats.totalSessions}</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-blue-100">
                      <span className="text-slate-500 block text-[10px]">Tỷ lệ có mặt</span>
                      <strong className="text-emerald-600 text-sm">{stats.attendanceRate}%</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setSelectedStudentProfile(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Đóng
            </button>

          </div>
        </div>
      )}

      {/* Modal: Tuition Notification */}
      {tuitionNotifModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-auto">
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Banknote className="w-5 h-5" /> Gửi thông báo học phí
              </h3>
              <button onClick={() => setTuitionNotifModalOpen(false)} className="text-indigo-200 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSendTuitionNotif} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chọn Nhóm/Lớp Học</label>
                <select
                  value={tuitionNotifGroupId}
                  onChange={(e) => setTuitionNotifGroupId(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>-- Chọn nhóm --</option>
                  {groups.map((g) => (
                     <option key={g.id} value={g.id}>
                      {g.name} ({g.subject} - {g.grade})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chọn tháng học phí</label>
                <select
                  value={tuitionNotifMonth}
                  onChange={(e) => setTuitionNotifMonth(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>Tháng {i+1}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Bản xem trước mẫu tin nhắn</label>
                <div className="text-sm text-slate-600 italic">
                  "Kính gửi phụ huynh em <strong>[Tên Học Sinh]</strong>,<br/><br/>
                  Trung tâm xin thông báo học phí tháng <strong>{tuitionNotifMonth}</strong> của em tại lớp <strong>{groups.find(g => g.id === tuitionNotifGroupId)?.name || '[Tên Lớp]'}</strong>. Kính mong phụ huynh hoàn thành học phí sớm nhất.<br/><br/>
                  Trân trọng cảm ơn!"
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="tuitionIncludeQR"
                    checked={tuitionNotifIncludeQR}
                    onChange={(e) => setTuitionNotifIncludeQR(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300"
                  />
                  <label htmlFor="tuitionIncludeQR" className="text-sm font-medium text-slate-700 flex items-center gap-1 cursor-pointer">
                    <QrCode className="w-4 h-4 text-slate-500" /> Đính kèm Mã QR Thanh Toán
                  </label>
                </div>
                {tuitionNotifIncludeQR && (
                  <div className="pl-6 pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tải ảnh QR lên (Tùy chọn)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTuitionNotifImageBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {tuitionNotifImageBase64 && (
                      <div className="mt-2">
                        <img src={tuitionNotifImageBase64} alt="QR Preview" className="max-h-32 object-contain border border-slate-200 rounded-lg" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTuitionNotifModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
                >
                  Gửi Hàng Loạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Notification to Class */}
      {bulkNotifModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-auto">
            <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" /> Gửi thông báo cho lớp
              </h3>
              <button onClick={() => setBulkNotifModalOpen(false)} className="text-amber-200 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSendBulkNotif} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chọn Nhóm/Lớp Học</label>
                <select
                  value={bulkNotifGroupId}
                  onChange={(e) => setBulkNotifGroupId(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>-- Chọn nhóm --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.subject} - {g.grade})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiêu đề</label>
                <input 
                  type="text"
                  required
                  value={bulkNotifTitle}
                  onChange={(e) => setBulkNotifTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nội dung</label>
                <textarea 
                  rows={4}
                  required
                  value={bulkNotifMessage}
                  onChange={(e) => setBulkNotifMessage(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  placeholder="Kính gửi phụ huynh..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="bulkIncludeQR"
                    checked={bulkNotifIncludeQR}
                    onChange={(e) => setBulkNotifIncludeQR(e.target.checked)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-slate-300"
                  />
                  <label htmlFor="bulkIncludeQR" className="text-sm font-medium text-slate-700 flex items-center gap-1 cursor-pointer">
                    <QrCode className="w-4 h-4 text-slate-500" /> Đính kèm Mã QR (Thu học phí)
                  </label>
                </div>
                {bulkNotifIncludeQR && (
                  <div className="pl-6 pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tải ảnh QR lên (Tùy chọn)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setBulkNotifImageBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {bulkNotifImageBase64 && (
                      <div className="mt-2">
                        <img src={bulkNotifImageBase64} alt="QR Preview" className="max-h-32 object-contain border border-slate-200 rounded-lg" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBulkNotifModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md"
                >
                  Gửi Hàng Loạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Notification to Parent */}
      {notifModalOpen && notifStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-auto">
            <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" /> Gửi thông báo
              </h3>
              <button onClick={() => setNotifModalOpen(false)} className="text-amber-200 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSendNotif} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gửi đến</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
                  Phụ huynh em: {notifStudent.name} <br/>
                  <span className="text-slate-500 font-normal">{notifStudent.parentName} - {notifStudent.parentPhone}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiêu đề</label>
                <input 
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nội dung</label>
                <textarea 
                  rows={4}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="includeQR"
                    checked={notifIncludeQR}
                    onChange={(e) => setNotifIncludeQR(e.target.checked)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-slate-300"
                  />
                  <label htmlFor="includeQR" className="text-sm font-medium text-slate-700 flex items-center gap-1 cursor-pointer">
                    <QrCode className="w-4 h-4 text-slate-500" /> Đính kèm Mã QR (Thu học phí)
                  </label>
                </div>
                {notifIncludeQR && (
                  <div className="pl-6 pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tải ảnh QR lên (Tùy chọn)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNotifImageBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {notifImageBase64 && (
                      <div className="mt-2">
                        <img src={notifImageBase64} alt="QR Preview" className="max-h-32 object-contain border border-slate-200 rounded-lg" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNotifModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md"
                >
                  Gửi Thông Báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
