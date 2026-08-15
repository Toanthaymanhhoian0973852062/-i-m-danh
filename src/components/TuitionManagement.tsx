import React, { useState, useEffect } from 'react';
import { FeeConfig, PaymentQRCode, Group, Student, TuitionRecord, User } from '../types';
import { 
  getFeeConfigs, saveFeeConfig, deleteFeeConfig,
  getPaymentQRCodes, savePaymentQRCode, deletePaymentQRCode,
  getGroups, getStudents, getUsers, addNotification,
  getTuitionRecords, saveTuitionRecord, addTuitionRecordsBulk
} from '../services/storageService';
import { 
  Settings, Bell, QrCode, CreditCard, Calendar, Users as UsersIcon, Plus, Trash2, Edit3, CheckCircle2, ChevronDown, Upload, X, MapPin, Search
} from 'lucide-react';

export const TuitionManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'configs' | 'notifications' | 'tracking'>('configs');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <CreditCard className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">QUẢN LÝ HỌC PHÍ</h1>
            <p className="text-emerald-100 text-sm mt-1">Cấu hình mức thu, QR thanh toán & Gửi thông báo hàng loạt</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('configs')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeSubTab === 'configs' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>CÀI ĐẶT & MỨC THU</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeSubTab === 'notifications' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>GỬI THÔNG BÁO</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('tracking')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeSubTab === 'tracking' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>THEO DÕI THANH TOÁN</span>
          </div>
        </button>
      </div>

      <div className="pt-4">
        {activeSubTab === 'configs' && <TuitionConfigs />}
        {activeSubTab === 'notifications' && <TuitionNotifications />}
        {activeSubTab === 'tracking' && <TuitionTracking />}
      </div>
    </div>
  );
};

// -----------------------------------------------------
// SUB-COMPONENT: TUITION CONFIGS
// -----------------------------------------------------
const TuitionConfigs: React.FC = () => {
  const [qrs, setQrs] = useState<PaymentQRCode[]>(getPaymentQRCodes());
  const [feeConfigs, setFeeConfigs] = useState<FeeConfig[]>(getFeeConfigs());
  const groups = getGroups();
  const students = getStudents();

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrForm, setQrForm] = useState<Partial<PaymentQRCode>>({});

  // Fee Config Modal State
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState<Partial<FeeConfig>>({});
  
  const refreshData = () => {
    setQrs(getPaymentQRCodes());
    setFeeConfigs(getFeeConfigs());
  };

  const handleSaveQR = (e: React.FormEvent) => {
    e.preventDefault();
    const newQr: PaymentQRCode = {
      id: qrForm.id || `qr_${Date.now()}`,
      name: qrForm.name || '',
      bankName: qrForm.bankName || '',
      accountNumber: qrForm.accountNumber || '',
      accountHolder: qrForm.accountHolder || '',
      transferTemplate: qrForm.transferTemplate || 'HOCPHI {{student_name}} T{{month}}',
      qrImage: qrForm.qrImage || '',
      isDefault: qrForm.isDefault || false,
      status: qrForm.status || 'active',
    };
    savePaymentQRCode(newQr);
    setQrModalOpen(false);
    refreshData();
  };

  const handleDeleteQR = (id: string) => {
    if (confirm('Xóa mã QR này?')) {
      deletePaymentQRCode(id);
      refreshData();
    }
  };

  const handleSaveFeeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeForm.effectiveFrom || !feeForm.groupId) {
      alert("Vui lòng điền đủ thông tin nhóm và ngày bắt đầu.");
      return;
    }

    // Check overlaps for the same group/student
    const overlaps = feeConfigs.some(c => 
      c.groupId === feeForm.groupId &&
      c.studentId === feeForm.studentId &&
      c.id !== feeForm.id &&
      ((!c.effectiveTo || feeForm.effectiveFrom! <= c.effectiveTo) && 
       (!feeForm.effectiveTo || c.effectiveFrom <= feeForm.effectiveTo))
    );

    if (overlaps) {
      alert("⚠️ Khoảng thời gian áp dụng đang bị trùng với một mức học phí khác.");
      return;
    }

    const newConfig: FeeConfig = {
      id: feeForm.id || `fee_${Date.now()}`,
      groupId: feeForm.groupId,
      studentId: feeForm.studentId || undefined,
      name: feeForm.name || '',
      amount: feeForm.amount || 0,
      billingType: 'monthly',
      effectiveFrom: feeForm.effectiveFrom,
      effectiveTo: feeForm.effectiveTo || undefined,
      status: 'active'
    };
    saveFeeConfig(newConfig);
    setFeeModalOpen(false);
    refreshData();
  };

  const handleDeleteFeeConfig = (id: string) => {
    if (confirm('Xóa mức học phí này?')) {
      deleteFeeConfig(id);
      refreshData();
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION: PAYMENT QRs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              MÃ QR THANH TOÁN
            </h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý các mã QR ngân hàng để đính kèm vào thông báo</p>
          </div>
          <button 
            onClick={() => { setQrForm({ isDefault: qrs.length === 0, status: 'active' }); setQrModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Thêm QR mới
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrs.map(qr => (
            <div key={qr.id} className="border border-slate-200 rounded-xl p-4 relative bg-white flex flex-col items-center text-center">
              {qr.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Mặc định</span>
                </div>
              )}
              {qr.qrImage ? (
                <img src={qr.qrImage} alt="QR" className="w-32 h-32 object-contain mb-3 border border-slate-100 rounded-lg" />
              ) : (
                <div className="w-32 h-32 bg-slate-100 rounded-lg mb-3 flex items-center justify-center border border-slate-200">
                  <QrCode className="w-10 h-10 text-slate-300" />
                </div>
              )}
              <h3 className="font-bold text-slate-800">{qr.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{qr.bankName} - {qr.accountNumber}</p>
              <p className="text-xs font-semibold text-slate-700">{qr.accountHolder}</p>
              
              <div className="mt-4 flex gap-2 w-full">
                <button 
                  onClick={() => { setQrForm(qr); setQrModalOpen(true); }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Sửa
                </button>
                <button 
                  onClick={() => handleDeleteQR(qr.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {qrs.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-sm">
              Chưa có mã QR nào được thiết lập.
            </div>
          )}
        </div>
      </div>

      {/* SECTION: FEE CONFIGS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              MỨC HỌC PHÍ THEO THỜI GIAN
            </h2>
            <p className="text-sm text-slate-500 mt-1">Cấu hình mức học phí cho từng nhóm/lớp theo giai đoạn</p>
          </div>
          <button 
            onClick={() => { setFeeForm({ amount: 800000, billingType: 'monthly' }); setFeeModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Thêm mức mới
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          {groups.map(group => {
            const groupConfigs = feeConfigs.filter(c => c.groupId === group.id);
            if (groupConfigs.length === 0) return null;
            
            return (
              <div key={group.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-sm flex justify-between items-center">
                  <span>{group.name} ({group.subject} - {group.grade})</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {groupConfigs.map(config => (
                    <div key={config.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{config.name}</span>
                          {config.studentId && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Riêng: {students.find(s => s.id === config.studentId)?.name || 'Học sinh'}
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-extrabold text-emerald-600 mt-1">
                          {config.amount.toLocaleString('vi-VN')}đ <span className="text-xs font-normal text-slate-500">/ tháng</span>
                        </div>
                        <div className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> 
                          Áp dụng: <strong>{config.effectiveFrom}</strong> → <strong>{config.effectiveTo || 'Không thời hạn'}</strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setFeeForm(config); setFeeModalOpen(true); }}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFeeConfig(config.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {feeConfigs.length === 0 && (
            <div className="text-center text-slate-500 py-4 text-sm">
              Chưa có cấu hình học phí nào.
            </div>
          )}
        </div>
      </div>

      {/* QR MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{qrForm.id ? 'Sửa Mã QR' : 'Thêm Mã QR Thanh Toán'}</h3>
              <button onClick={() => setQrModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveQR} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Gợi Nhớ (vd: QR ACB Thầy Mạnh)</label>
                <input required type="text" value={qrForm.name || ''} onChange={e => setQrForm({...qrForm, name: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngân hàng</label>
                  <input required type="text" value={qrForm.bankName || ''} onChange={e => setQrForm({...qrForm, bankName: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Tài Khoản</label>
                  <input required type="text" value={qrForm.accountNumber || ''} onChange={e => setQrForm({...qrForm, accountNumber: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Chủ Tài Khoản</label>
                <input required type="text" value={qrForm.accountHolder || ''} onChange={e => setQrForm({...qrForm, accountHolder: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mẫu Nội Dung Chuyển Khoản</label>
                <p className="text-[10px] text-slate-500 mb-2">Sử dụng biến: <code>{`{{student_name}}`}</code>, <code>{`{{month}}`}</code></p>
                <input required type="text" value={qrForm.transferTemplate || ''} onChange={e => setQrForm({...qrForm, transferTemplate: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono" placeholder="HOCPHI {{student_name}} T{{month}}" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ảnh Mã QR (Tải lên)</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setQrForm({...qrForm, qrImage: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700" />
                {qrForm.qrImage && <img src={qrForm.qrImage} alt="Preview" className="mt-2 h-32 object-contain rounded-lg border border-slate-200" />}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isDefault" checked={qrForm.isDefault || false} onChange={e => setQrForm({...qrForm, isDefault: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                <label htmlFor="isDefault" className="text-sm font-bold text-slate-700 cursor-pointer">Đặt làm mã QR mặc định</label>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setQrModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold">Lưu Mã QR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEE CONFIG MODAL */}
      {feeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{feeForm.id ? 'Sửa Mức Thu' : 'Thêm Mức Học Phí'}</h3>
              <button onClick={() => setFeeModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFeeConfig} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Mức Thu (vd: Học phí Toán 8 - Giai đoạn 1)</label>
                <input required type="text" value={feeForm.name || ''} onChange={e => setFeeForm({...feeForm, name: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Nhóm/Lớp</label>
                  <select required value={feeForm.groupId || ''} onChange={e => setFeeForm({...feeForm, groupId: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm">
                    <option value="" disabled>-- Chọn nhóm --</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học sinh (Tùy chọn - mức riêng)</label>
                  <select value={feeForm.studentId || ''} onChange={e => setFeeForm({...feeForm, studentId: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm">
                    <option value="">-- Cả lớp --</option>
                    {feeForm.groupId && students.filter(s => s.groupId === feeForm.groupId).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Tiền (VNĐ/tháng)</label>
                <input required type="number" min="0" value={feeForm.amount || 0} onChange={e => setFeeForm({...feeForm, amount: Number(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Từ Ngày (Bắt đầu áp dụng)</label>
                  <input required type="date" value={feeForm.effectiveFrom || ''} onChange={e => setFeeForm({...feeForm, effectiveFrom: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đến Ngày (Kết thúc - Tùy chọn)</label>
                  <input type="date" value={feeForm.effectiveTo || ''} onChange={e => setFeeForm({...feeForm, effectiveTo: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
                  <p className="text-[10px] text-slate-500 mt-1">Để trống nếu không có ngày kết thúc</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setFeeModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">Lưu Mức Thu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// -----------------------------------------------------
// SUB-COMPONENT: TUITION NOTIFICATIONS
// -----------------------------------------------------
const TuitionNotifications: React.FC = () => {
  const groups = getGroups();
  const students = getStudents();
  const qrs = getPaymentQRCodes();
  const feeConfigs = getFeeConfigs();
  const users = getUsers();

  const [groupId, setGroupId] = useState('');
  const [targetType, setTargetType] = useState('unpaid');
  const [monthStr, setMonthStr] = useState((new Date().getMonth() + 1).toString().padStart(2, '0') + '/' + new Date().getFullYear());
  const [includeQR, setIncludeQR] = useState(true);
  const [selectedQRId, setSelectedQRId] = useState(qrs.find(q => q.isDefault)?.id || (qrs[0]?.id || ''));
  const [dueDate, setDueDate] = useState('');
  
  const [messageTemplate, setMessageTemplate] = useState(
`Kính gửi phụ huynh em {{student_name}},

Học phí tháng {{month}} của em là: {{amount_due}}
Đã thanh toán: {{amount_paid}}
Còn phải thanh toán: {{amount_remaining}}
Hạn thanh toán: {{due_date}}

Quý phụ huynh vui lòng quét mã QR hoặc thanh toán theo thông tin bên dưới để hoàn tất.
Xin cảm ơn phụ huynh đã phối hợp cùng giáo viên.`
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewList, setPreviewList] = useState<any[]>([]);

  // Calculate target students and their personalized messages
  const prepareNotifications = () => {
    if (!groupId) return alert("Vui lòng chọn nhóm!");
    if (!monthStr) return alert("Vui lòng nhập tháng!");

    const groupStudents = students.filter(s => s.groupId === groupId);
    if (groupStudents.length === 0) return alert("Nhóm không có học sinh!");

    const records = getTuitionRecords();
    
    // Convert month string "09/2026" to a date to check effective fee
    const [mStr, yStr] = monthStr.split('/');
    const checkDateStr = `${yStr}-${mStr}-31`;

    const generatedList: any[] = [];

    groupStudents.forEach(stu => {
      // Find fee config for this student on this month
      // 1. Check student specific
      let config = feeConfigs.find(c => c.groupId === groupId && c.studentId === stu.id && c.effectiveFrom <= checkDateStr && (!c.effectiveTo || c.effectiveTo >= `${yStr}-${mStr}-01`));
      // 2. Check group default
      if (!config) {
        config = feeConfigs.find(c => c.groupId === groupId && !c.studentId && c.effectiveFrom <= checkDateStr && (!c.effectiveTo || c.effectiveTo >= `${yStr}-${mStr}-01`));
      }

      const amountDue = config ? config.amount : 0;
      
      // Look up existing record
      const existingRec = records.find(r => r.studentId === stu.id && r.month === monthStr);
      const amountPaid = existingRec ? existingRec.amountPaid : 0;
      const amountRemaining = Math.max(0, amountDue - amountPaid);
      const status = existingRec ? existingRec.status : (amountRemaining > 0 ? 'unpaid' : 'paid');

      // Filter by targetType
      if (targetType === 'unpaid' && status === 'paid') return;
      if (targetType === 'debt' && amountRemaining === 0) return;
      if (amountDue === 0) return; // Ignore if no fee config applies

      // Find parent user
      const parentUser = users.find(u => u.role === 'parent' && u.phone === stu.parentPhone);

      // Generate Message
      let msg = messageTemplate
        .replace(/{{student_name}}/g, stu.name)
        .replace(/{{month}}/g, monthStr)
        .replace(/{{amount_due}}/g, amountDue.toLocaleString('vi-VN') + 'đ')
        .replace(/{{amount_paid}}/g, amountPaid.toLocaleString('vi-VN') + 'đ')
        .replace(/{{amount_remaining}}/g, amountRemaining.toLocaleString('vi-VN') + 'đ')
        .replace(/{{due_date}}/g, dueDate || 'Chưa định');

      let qrData = null;
      if (includeQR && selectedQRId) {
        const qr = qrs.find(q => q.id === selectedQRId);
        if (qr) {
          const transferContent = qr.transferTemplate
            .replace(/{{student_name}}/g, removeAccents(stu.name).toUpperCase())
            .replace(/{{month}}/g, monthStr.replace('/', ''));
          
          qrData = { ...qr, personalizedTransferContent: transferContent };
          
          msg += `\n\n[Thông tin CK]\nNgân hàng: ${qr.bankName}\nSTK: ${qr.accountNumber}\nChủ TK: ${qr.accountHolder}\nNội dung: ${transferContent}`;
          if (qr.qrImage) {
             msg += `\n[QR_IMAGE_BASE64]${qr.qrImage}[/QR_IMAGE_BASE64]`;
          }
        }
      }

      generatedList.push({
        student: stu,
        parentUser,
        amountDue,
        amountPaid,
        amountRemaining,
        message: msg,
        qrData
      });
    });

    if (generatedList.length === 0) {
      alert("Không tìm thấy học sinh nào thỏa mãn điều kiện gửi. Vui lòng kiểm tra lại Cài đặt Mức thu cho nhóm này (đảm bảo ngày áp dụng hợp lệ) và kiểm tra trạng thái đóng học phí.");
      return;
    }

    setPreviewList(generatedList);
    setPreviewOpen(true);
  };

  const handleSend = () => {
    if (previewList.length === 0) return;
    
    // Create notifications and records
    const records = getTuitionRecords();
    
    previewList.forEach(item => {
      // 1. Send Notification
      addNotification({
        userId: item.parentUser ? item.parentUser.id : 'unknown',
        studentId: item.student.id,
        studentName: item.student.name,
        parentName: item.student.parentName,
        parentPhone: item.student.parentPhone,
        title: `Thông báo học phí tháng ${monthStr}`,
        message: item.message,
        type: 'reminder',
        channelsSent: ['In-App']
      });

      // 2. Init or update TuitionRecord
      let existingRec = records.find(r => r.studentId === item.student.id && r.month === monthStr);
      if (!existingRec) {
        saveTuitionRecord({
          id: `tuition_${item.student.id}_${monthStr.replace('/', '')}`,
          studentId: item.student.id,
          groupId: groupId,
          month: monthStr,
          amountDue: item.amountDue,
          amountPaid: item.amountPaid,
          dueDate: dueDate || '',
          status: item.amountRemaining > 0 ? 'unpaid' : 'paid'
        });
      } else {
        // Just update dueDate if it was changed
        if (dueDate) {
          saveTuitionRecord({ ...existingRec, dueDate });
        }
      }
    });

    alert(`Đã gửi thành công ${previewList.length} thông báo!`);
    setPreviewOpen(false);
    setPreviewList([]);
  };

  // Helper to remove accents for transfer content
  function removeAccents(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  if (previewOpen) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-amber-800 font-bold text-lg">Xác nhận gửi thông báo</h3>
            <p className="text-amber-700 text-sm mt-1">Bạn chuẩn bị gửi thông báo đến <strong>{previewList.length} phụ huynh</strong>.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPreviewOpen(false)} className="px-4 py-2 bg-white border border-amber-300 text-amber-700 font-bold rounded-xl shadow-sm">
              Quay lại chỉnh sửa
            </button>
            <button onClick={handleSend} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md">
              Xác nhận gửi {previewList.length} thông báo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px] flex flex-col">
            <div className="bg-slate-100 p-3 font-bold text-slate-800 border-b border-slate-200">Danh sách nhận</div>
            <div className="flex-1 overflow-y-auto p-2">
              <ul className="divide-y divide-slate-100">
                {previewList.map((item, idx) => (
                  <li key={idx} className="p-3 hover:bg-slate-50 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{item.student.name}</div>
                      <div className="text-xs text-slate-500">Phụ huynh: {item.student.parentName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-600">{item.amountRemaining.toLocaleString('vi-VN')}đ</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px] flex flex-col">
            <div className="bg-slate-100 p-3 font-bold text-slate-800 border-b border-slate-200">Xem trước hiển thị (Ví dụ học sinh đầu tiên)</div>
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-3 text-lg border-b border-slate-100 pb-2">Thông báo học phí tháng {monthStr}</h4>
                <div className="whitespace-pre-line text-sm text-slate-700 leading-relaxed font-sans">
                  {(() => {
                    const parts = previewList[0].message.split('\n[QR_IMAGE_BASE64]');
                    return (
                      <>
                        {parts[0]}
                        {parts[1] && (
                          <div className="mt-6 flex justify-center">
                            <div className="p-4 border-2 border-dashed border-amber-300 rounded-xl bg-white flex flex-col items-center max-w-[250px]">
                              <img src={parts[1].replace('[/QR_IMAGE_BASE64]', '')} alt="QR" className="w-full h-auto object-contain mb-3" />
                              <span className="text-amber-700 font-bold text-xs uppercase text-center">{previewList[0].qrData?.bankName}</span>
                              <span className="text-slate-700 font-bold text-sm mt-1 text-center">{previewList[0].qrData?.personalizedTransferContent}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6 text-amber-600" />
        GỬI THÔNG BÁO HỌC PHÍ HÀNG LOẠT
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đối tượng (Nhóm/Lớp)</label>
              <select value={groupId} onChange={e => setGroupId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold">
                <option value="">-- Chọn nhóm --</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Điều kiện lọc</label>
              <select value={targetType} onChange={e => setTargetType(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm">
                <option value="all">Tất cả học sinh</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="debt">Còn nợ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tháng thu phí</label>
              <input type="text" value={monthStr} onChange={e => setMonthStr(e.target.value)} placeholder="09/2026" className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold text-center tracking-wider" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hạn thanh toán</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="incQR" checked={includeQR} onChange={e => setIncludeQR(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
              <label htmlFor="incQR" className="text-sm font-bold text-slate-700">Đính kèm QR thanh toán</label>
            </div>
            {includeQR && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn mã QR</label>
                <select value={selectedQRId} onChange={e => setSelectedQRId(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl text-sm">
                  {qrs.map(q => <option key={q.id} value={q.id}>{q.name} {q.isDefault ? '(Mặc định)' : ''}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung thông báo (Mẫu)</label>
          <div className="mb-2 flex flex-wrap gap-2">
             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">{`{{student_name}}`}</span>
             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">{`{{month}}`}</span>
             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">{`{{amount_due}}`}</span>
             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">{`{{amount_paid}}`}</span>
             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">{`{{amount_remaining}}`}</span>
             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">{`{{due_date}}`}</span>
          </div>
          <textarea 
            rows={10} 
            value={messageTemplate} 
            onChange={e => setMessageTemplate(e.target.value)} 
            className="w-full p-4 border border-slate-300 rounded-xl text-sm font-sans leading-relaxed focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
        <button onClick={prepareNotifications} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl shadow-lg transition flex items-center gap-2 text-lg">
          <Search className="w-5 h-5" />
          XEM TRƯỚC VÀ GỬI
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------
// SUB-COMPONENT: TUITION TRACKING
// -----------------------------------------------------
const TuitionTracking: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CreditCard className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">Theo dõi trạng thái thanh toán</h3>
      <p className="text-slate-500 mt-2 max-w-md mx-auto">
        Tính năng theo dõi từng khoản thu, đối soát giao dịch và xác nhận thanh toán sẽ được cập nhật trong phiên bản tiếp theo. 
        Hiện tại giáo viên có thể dùng chức năng Gửi thông báo để nhắc nhở phụ huynh.
      </p>
    </div>
  );
};
