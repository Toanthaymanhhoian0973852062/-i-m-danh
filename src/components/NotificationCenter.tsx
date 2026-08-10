import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../services/storageService';
import { 
  Bell, 
  CheckCheck, 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  X
} from 'lucide-react';

interface NotificationCenterProps {
  currentUser: User;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ currentUser }) => {
  const notifications = getNotifications();
  const [filterType, setFilterType] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  const userNotifs = notifications.filter((n) => {
    if (currentUser.role === 'parent') {
      return n.userId === currentUser.id || n.studentId === currentUser.studentId;
    }
    return true; // Teacher sees all dispatched notifications
  });

  const filtered = userNotifs.filter((n) => {
    if (filterType === 'unread') return !n.readStatus;
    if (filterType === 'absent') return n.type === 'absent_unexcused' || n.type === 'absent_excused';
    if (filterType === 'late') return n.type === 'late';
    return true;
  });

  const handleMarkAll = () => {
    markAllNotificationsRead(currentUser.role === 'parent' ? currentUser.id : undefined);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>TRUNG TÂM THÔNG BÁO</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Nhật ký thông báo tự động gửi tới phụ huynh khi học sinh vắng, đi trễ hoặc có cập nhật buổi học.
          </p>
        </div>

        <button
          onClick={handleMarkAll}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả ({userNotifs.length})
        </button>

        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'unread' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Chưa đọc ({userNotifs.filter((n) => !n.readStatus).length})
        </button>

        <button
          onClick={() => setFilterType('absent')}
          className={`px-3 py-1.5 rounded-lg transition ${
            filterType === 'absent' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Thông báo Vắng học
        </button>
      </div>

      {/* Notification Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            Chưa có thông báo nào.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                setSelectedNotif(n);
              }}
              className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer flex items-start justify-between gap-4 ${
                !n.readStatus
                  ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                  {!n.readStatus && (
                    <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                      Mới
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-2">
                  {n.message}
                </p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                  <span>📅 Ngày {n.sessionDate || '—'}</span>
                  <span>👤 Học sinh: {n.studentName}</span>
                  <span className="text-emerald-700 font-semibold">
                    Kênh: {n.channelsSent?.join(' • ') || 'Thành công'}
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                {new Date(n.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{selectedNotif.title}</h3>
              <button onClick={() => setSelectedNotif(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs whitespace-pre-line text-slate-800 leading-relaxed font-sans">
              {selectedNotif.message}
              {selectedNotif.message.includes('[Đính kèm Mã QR') && (
                <div className="mt-4 p-4 border-2 border-dashed border-amber-300 rounded-xl flex flex-col items-center justify-center bg-white">
                  <div className="w-32 h-32 bg-slate-100 border border-slate-200 rounded flex items-center justify-center mb-2">
                    <span className="text-slate-400 text-xs text-center px-2">Khu vực hiển thị<br/>Mã QR</span>
                  </div>
                  <span className="text-amber-700 font-bold text-[11px] uppercase">Mã QR Thanh Toán</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50 rounded-xl text-xs space-y-1">
              <div className="font-bold text-blue-900">Chi tiết phát thông báo:</div>
              <div className="text-slate-600">Phụ huynh: {selectedNotif.parentName} ({selectedNotif.parentPhone})</div>
              <div className="text-slate-600">Email: {selectedNotif.parentEmail || '—'}</div>
              <div className="text-emerald-700 font-bold pt-1">
                Trạng thái phát kịch bản: {selectedNotif.channelsSent?.join(' • ')}
              </div>
            </div>

            <button
              onClick={() => setSelectedNotif(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
