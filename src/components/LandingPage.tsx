import React from 'react';
import { User } from '../types';
import { getUsers, setCurrentUser } from '../services/storageService';
import { 
  GraduationCap, 
  Sparkles, 
  Zap, 
  BellRing, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface LandingPageProps {
  onSelectUser: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectUser }) => {
  const users = getUsers();

  const teacher = users.find((u) => u.role === 'teacher') || users[0];
  const parent = users.find((u) => u.role === 'parent') || users[1];
  const student = users.find((u) => u.role === 'student') || users[3];

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-8 px-4 sm:px-6 max-w-5xl mx-auto">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 my-auto pt-4">
        
        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Hệ Thống Điểm Danh & Quản Lý Nhóm Học Toán</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          TOÁN THẦY MẠNH
        </h1>

        <p className="text-lg sm:text-xl font-bold text-blue-600 italic">
          "Học chắc – Hiểu sâu – Tiến bộ mỗi ngày"
        </p>

        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          Ứng dụng giúp giáo viên điểm danh cực nhanh trong 10 giây, tự động phát thông báo điện tử tới phụ huynh khi con vắng hoặc đi trễ, quản lý chuyên cần thông minh.
        </p>

        {/* Login Role Quick Buttons */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          
          {/* Teacher Login */}
          <button
            onClick={() => onSelectUser(teacher)}
            className="group p-5 bg-gradient-to-br from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 text-left border border-blue-700/50 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center mb-3 text-2xl">
                👨‍🏫
              </div>
              <span className="text-[10px] uppercase font-extrabold text-blue-300 tracking-wider block">
                Tài khoản Giáo viên
              </span>
              <h3 className="text-lg font-bold mt-0.5 group-hover:text-amber-300 transition">
                Đăng nhập Giáo viên
              </h3>
              <p className="text-xs text-blue-100/80 mt-1">
                Quản lý nhóm, điểm danh nhanh, xem báo cáo toàn hệ thống.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-700/40 text-xs font-bold text-blue-300 flex items-center justify-between">
              <span>{teacher.name}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Parent Login */}
          <button
            onClick={() => onSelectUser(parent)}
            className="group p-5 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-left border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 text-2xl">
                👨‍👩‍👦
              </div>
              <span className="text-[10px] uppercase font-extrabold text-purple-600 tracking-wider block">
                Tài khoản Phụ huynh
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 group-hover:text-purple-700 transition">
                Đăng nhập Phụ huynh
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Xem lịch học của con, tình hình điểm danh và nhận thông báo tức thì.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-purple-700 flex items-center justify-between">
              <span>PH em Nguyễn Văn An</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Student Login */}
          <button
            onClick={() => onSelectUser(student)}
            className="group p-5 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-left border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 text-2xl">
                🎓
              </div>
              <span className="text-[10px] uppercase font-extrabold text-emerald-600 tracking-wider block">
                Tài khoản Học sinh
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 group-hover:text-emerald-700 transition">
                Đăng nhập Học sinh
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi lịch học toán cá nhân, chuyên cần và bài tập.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700 flex items-center justify-between">
              <span>Em Nguyễn Văn An</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

        </div>

      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-xs">
        
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Điểm Danh Siêu Tốc 10s</h4>
            <p className="text-slate-500 mt-0.5">
              Nút "Tất cả có mặt" hỗ trợ thầy cô điểm danh cả lớp chỉ trong vài thao tác chạm trên điện thoại.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start space-x-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Tự Động Báo Phụ Huynh</h4>
            <p className="text-slate-500 mt-0.5">
              Phát ngay thông báo điện tử qua App và Email khi học sinh vắng học hoặc đi trễ.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Thống Kê Chuyên Cần %</h4>
            <p className="text-slate-500 mt-0.5">
              Tự động tính tỷ lệ có mặt, xuất báo cáo Excel/CSV và cảnh báo học sinh vắng nhiều.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
