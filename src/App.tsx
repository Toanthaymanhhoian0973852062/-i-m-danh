import React, { useState, useEffect } from 'react';
import { User, Session } from './types';
import { 
  getCurrentUser, 
  setCurrentUser, 
  getNotifications, 
  subscribeStorage,
  initializeSync
} from './services/storageService';
import { Navbar } from './components/Navbar';
import { TeacherDashboard } from './components/TeacherDashboard';
import { QuickAttendanceModal } from './components/QuickAttendanceModal';
import { GroupManagement } from './components/GroupManagement';
import { StudentManagement } from './components/StudentManagement';
import { TuitionManagement } from './components/TuitionManagement';
import { AttendanceHistory } from './components/AttendanceHistory';
import { ParentView } from './components/ParentView';
import { StudentView } from './components/StudentView';
import { NotificationCenter } from './components/NotificationCenter';
import { ReportsView } from './components/ReportsView';
import { LandingPage } from './components/LandingPage';

export default function App() {
  const [currentUser, setCurrUser] = useState<User>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [quickAttendanceSession, setQuickAttendanceSession] = useState<Session | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Initialize firebase sync on mount
  useEffect(() => {
    initializeSync();
  }, []);

  // Sync storage notifications
  useEffect(() => {
    const updateStats = () => {
      const notifs = getNotifications();
      const unread = notifs.filter((n) => {
        if (currentUser.role === 'parent') {
          return (!n.readStatus && (n.userId === currentUser.id || n.studentId === currentUser.studentId));
        }
        return !n.readStatus;
      }).length;
      setUnreadCount(unread);
    };
    updateStats();
    const unsubscribe = subscribeStorage(updateStats);
    return () => unsubscribe();
  }, [currentUser]);

  const handleUserChange = (newUser: User) => {
    setCurrUser(newUser);
    setCurrentUser(newUser);
    if (newUser.role === 'parent') setActiveTab('parent_home');
    else if (newUser.role === 'student') setActiveTab('student_home');
    else setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">      
      {/* Top Navigation */}
      {activeTab !== 'landing' && (
        <Navbar
          currentUser={currentUser}
          onUserChange={handleUserChange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
        />
      )}

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'landing' && (
          <LandingPage onSelectUser={handleUserChange} />
        )}

        {activeTab === 'dashboard' && currentUser.role === 'teacher' && (
          <TeacherDashboard
            onOpenQuickAttendance={(session) => setQuickAttendanceSession(session)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'groups' && (
          <GroupManagement />
        )}

        {activeTab === 'tuition' && (
          <TuitionManagement />
        )}

        {activeTab === 'students' && (
          <StudentManagement />
        )}

        {activeTab === 'attendance_history' && (
          <AttendanceHistory />
        )}

        {activeTab === 'parent_home' && (
          <ParentView currentUser={currentUser} />
        )}

        {activeTab === 'student_home' && (
          <StudentView currentUser={currentUser} />
        )}

        {activeTab === 'notifications' && (
          <NotificationCenter currentUser={currentUser} />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}
      </main>

      {/* Quick Attendance Modal Tool */}
      {quickAttendanceSession && (
        <QuickAttendanceModal
          session={quickAttendanceSession}
          onClose={() => setQuickAttendanceSession(null)}
          onSaved={() => {
            setQuickAttendanceSession(null);
            // Optionally redirect to history or refresh
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="font-extrabold text-white text-sm">
            TOÁN THẦY MẠNH – ĐIỂM DANH & QUẢN LÝ NHÓM HỌC
          </div>
          <p className="text-slate-500">
            Học chắc – Hiểu sâu – Tiến bộ mỗi ngày • Phát triển cho Giáo viên, Phụ huynh và Học sinh
          </p>
          <div className="text-[10px] text-slate-600">
            © 2026 Toán Thầy Mạnh. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  );
}
