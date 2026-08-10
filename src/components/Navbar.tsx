import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getUsers, setCurrentUser, getNotifications } from '../services/storageService';
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  Calendar, 
  Bell, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  BookOpen,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  activeTab,
  setActiveTab,
  unreadCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const allUsers = getUsers();

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    onUserChange(user);
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
    
    // Set default tab based on role
    if (user.role === 'parent') {
      setActiveTab('parent_home');
    } else if (user.role === 'student') {
      setActiveTab('student_home');
    } else {
      setActiveTab('dashboard');
    }
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ForwardRefExoticComponent<any>;
    badge?: number;
  }

  const teacherNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'groups', label: 'Nhóm học', icon: BookOpen },
    { id: 'students', label: 'Học sinh', icon: Users },
    { id: 'attendance_history', label: 'Lịch sử điểm danh', icon: UserCheck },
    { id: 'reports', label: 'Báo cáo', icon: Calendar },
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: unreadCount },
  ];

  const parentNavItems: NavItem[] = [
    { id: 'parent_home', label: 'Trang con học', icon: GraduationCap },
    { id: 'attendance_history', label: 'Lịch sử điểm danh', icon: UserCheck },
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: unreadCount },
  ];

  const studentNavItems: NavItem[] = [
    { id: 'student_home', label: 'Trang cá nhân', icon: GraduationCap },
    { id: 'attendance_history', label: 'Lịch sử điểm danh', icon: UserCheck },
  ];

  const navItems = 
    currentUser.role === 'teacher' 
      ? teacherNavItems 
      : currentUser.role === 'parent' 
        ? parentNavItems 
        : studentNavItems;

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-800 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(currentUser.role === 'teacher' ? 'dashboard' : currentUser.role === 'parent' ? 'parent_home' : 'student_home')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200 font-bold text-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-blue-700 font-bold text-lg uppercase tracking-tighter">
                TOÁN THẦY MẠNH
              </div>
              <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest leading-none">
                Hệ thống Điểm danh
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* User Role Switcher & Profile */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-sm transition text-slate-800"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-500 font-medium">Đăng nhập:</span>
                <span className="font-bold text-slate-800">{currentUser.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  currentUser.role === 'teacher' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  currentUser.role === 'parent' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {currentUser.role === 'teacher' ? 'Giáo viên' : currentUser.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 divide-y divide-slate-100">
                  <div className="px-3.5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Đổi tài khoản Demo</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="py-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSwitchUser(u)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          currentUser.id === u.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                          u.role === 'teacher' ? 'bg-amber-100 text-amber-800' :
                          u.role === 'parent' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role === 'teacher' ? 'Giáo viên' : u.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => setActiveTab('landing')}
                      className="w-full text-center py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center space-x-1.5 rounded-xl bg-slate-50 hover:bg-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Về Trang Đăng Nhập / Giới Thiệu</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 text-slate-300 hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {/* User badge mobile */}
          <div className="p-2 bg-slate-800 rounded-lg text-xs flex items-center justify-between mb-3 border border-slate-700">
            <div>
              <span className="text-slate-400">Đang chọn: </span>
              <span className="font-bold text-white">{currentUser.name}</span>
            </div>
            <span className="bg-blue-600/30 text-blue-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
              {currentUser.role === 'teacher' ? 'Giáo viên' : currentUser.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
            </span>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-2">Đổi tài khoản nhanh:</div>
            <div className="grid grid-cols-1 gap-1">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={`text-left px-3 py-1.5 rounded text-xs flex items-center justify-between ${
                    currentUser.id === u.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{u.name}</span>
                  <span className="text-[10px] opacity-75 uppercase">
                    ({u.role === 'teacher' ? 'GV' : u.role === 'parent' ? 'PH' : 'HS'})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
