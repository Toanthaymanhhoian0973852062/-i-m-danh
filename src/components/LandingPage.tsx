import React, { useState } from 'react';
import { User } from '../types';
import { getUsers } from '../services/storageService';
import { 
  GraduationCap, 
  Sparkles, 
  Zap, 
  BellRing, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  BookOpen,
  KeyRound,
  Phone,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

interface LandingPageProps {
  onSelectUser: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectUser }) => {
  const users = getUsers();
  const [activeTab, setActiveTab] = useState<'teacher' | 'parent' | 'student'>(
    (localStorage.getItem('tm_last_tab') as any) || 'parent'
  );
  
  // Login form state
  const [identifier, setIdentifier] = useState(() => {
    const lastTab = localStorage.getItem('tm_last_tab');
    return lastTab === 'teacher' ? '' : (localStorage.getItem('tm_last_id') || '');
  });
  const [password, setPassword] = useState(() => {
    const lastTab = localStorage.getItem('tm_last_tab');
    return lastTab === 'teacher' ? '' : (localStorage.getItem('tm_last_pwd') || '');
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let successUser = null;

    // Mock Authentication Logic
    if (activeTab === 'teacher') {
      const foundTeacher = users.find(u => u.role === 'teacher' && (u.email === identifier || u.phone === identifier));
      if (foundTeacher && password === (foundTeacher.password || 'phuocphu2024')) {
        successUser = foundTeacher;
      } else {
        setError('Email/SĐT hoặc Mã bảo mật không chính xác.');
      }
    } else if (activeTab === 'parent') {
      const foundParent = users.find(u => u.role === 'parent' && u.phone === identifier);
      if (foundParent && password === (foundParent.password || '123456')) {
        successUser = foundParent;
      } else {
        setError('Số điện thoại hoặc mật khẩu không chính xác.');
      }
    } else if (activeTab === 'student') {
      const foundStudent = users.find(u => u.role === 'student' && u.phone === identifier);
      if (foundStudent && password === (foundStudent.password || '123456')) {
        successUser = foundStudent;
      } else {
        setError('SĐT học sinh hoặc mật khẩu không chính xác.');
      }
    }

    if (successUser) {
      localStorage.setItem('tm_last_tab', activeTab);
      if (activeTab === 'teacher') {
        localStorage.removeItem('tm_last_id');
        localStorage.removeItem('tm_last_pwd');
      } else {
        localStorage.setItem('tm_last_id', identifier);
        localStorage.setItem('tm_last_pwd', password);
      }
      onSelectUser(successUser);
    }
  };

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

        {/* Login Form Section */}
        <div className="pt-8 max-w-md mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Role Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              <button 
                onClick={() => { setActiveTab('parent'); setError(''); setIdentifier(''); setPassword(''); }}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'parent' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Phụ huynh
              </button>
              <button 
                onClick={() => { setActiveTab('student'); setError(''); setIdentifier(''); setPassword(''); }}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'student' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Học sinh
              </button>
              <button 
                onClick={() => { setActiveTab('teacher'); setError(''); setIdentifier(''); setPassword(''); }}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'teacher' ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Giáo viên
              </button>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4 text-left">
              {activeTab === 'teacher' && (
                <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100">
                  <p className="font-bold text-blue-800 mb-1">Dành riêng cho giáo viên quản trị</p>
                  Yêu cầu đăng nhập bằng Email/SĐT và Mã bảo mật cấp riêng.
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {activeTab === 'teacher' ? 'Email / Số điện thoại' : 'Số điện thoại'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {activeTab === 'teacher' ? (
                      <div className="flex -space-x-1">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                    ) : (
                      <Phone className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <input
                    type={activeTab === 'teacher' ? 'text' : 'tel'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder={activeTab === 'teacher' ? 'Email Đăng nhập' : 'Nhập số điện thoại'}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {activeTab === 'teacher' ? 'Mã Bảo Mật (Key)' : 'Mật khẩu'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Nhập mật khẩu..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
              >
                <span>ĐĂNG NHẬP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>
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
