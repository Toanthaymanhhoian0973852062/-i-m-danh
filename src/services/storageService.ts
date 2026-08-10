import { Group, Student, Session, AttendanceRecord, NotificationItem, User, AttendanceStats } from '../types';
import { INITIAL_USERS, INITIAL_GROUPS, INITIAL_STUDENTS, INITIAL_SESSIONS, INITIAL_ATTENDANCE, INITIAL_NOTIFICATIONS } from '../data/mockSeedData';

const KEYS = {
  USERS: 'tm_users_v3',
  GROUPS: 'tm_groups_v3',
  STUDENTS: 'tm_students_v3',
  SESSIONS: 'tm_sessions_v3',
  ATTENDANCE: 'tm_attendance_v3',
  NOTIFICATIONS: 'tm_notifications_v3',
  CURRENT_USER: 'tm_current_user_v3',
};

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export const subscribeStorage = (listener: StorageListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => fn());
};

// Generic safe storage loader
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

// Reset data to seed
export const resetToSeedData = () => {
  setStored(KEYS.USERS, INITIAL_USERS);
  setStored(KEYS.GROUPS, INITIAL_GROUPS);
  setStored(KEYS.STUDENTS, INITIAL_STUDENTS);
  setStored(KEYS.SESSIONS, INITIAL_SESSIONS);
  setStored(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  setStored(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  setStored(KEYS.CURRENT_USER, INITIAL_USERS[0]);
};

// Users
export const getUsers = (): User[] => getStored(KEYS.USERS, INITIAL_USERS);
export const getCurrentUser = (): User => getStored(KEYS.CURRENT_USER, INITIAL_USERS[0]);
export const setCurrentUser = (user: User) => setStored(KEYS.CURRENT_USER, user);
export const updateUser = (user: User) => {
  const users = getUsers().map((u) => (u.id === user.id ? user : u));
  setStored(KEYS.USERS, users);
  const currentUser = getCurrentUser();
  if (currentUser.id === user.id) {
    setCurrentUser(user);
  }

  // If this user is a parent or student, update the linked student info
  if (user.studentId && (user.role === 'parent' || user.role === 'student')) {
    const students = getStudents();
    const updatedStudents = students.map(s => {
      if (s.id === user.studentId) {
        if (user.role === 'student') {
          return { ...s, name: user.name, phone: user.phone };
        } else if (user.role === 'parent') {
          // Keep name format for parent user, update only phone and extract name if we want, but it's risky
          // A simpler approach is just to update the parent phone, and let the teacher edit the actual parent name
          return { ...s, parentPhone: user.phone };
        }
      }
      return s;
    });
    setStored(KEYS.STUDENTS, updatedStudents);
  }
};

// Groups
export const getGroups = (): Group[] => getStored(KEYS.GROUPS, INITIAL_GROUPS);
export const addGroup = (group: Omit<Group, 'id'>): Group => {
  const groups = getGroups();
  const newGroup: Group = {
    ...group,
    id: 'grp_' + Date.now(),
  };
  setStored(KEYS.GROUPS, [newGroup, ...groups]);
  return newGroup;
};
export const updateGroup = (group: Group) => {
  const groups = getGroups().map((g) => (g.id === group.id ? group : g));
  setStored(KEYS.GROUPS, groups);
};
export const deleteGroup = (id: string) => {
  const groups = getGroups().filter((g) => g.id !== id);
  setStored(KEYS.GROUPS, groups);
};

// Students
export const getStudents = (): Student[] => getStored(KEYS.STUDENTS, INITIAL_STUDENTS);
export const addStudent = (student: Omit<Student, 'id'>, password?: string): Student => {
  const students = getStudents();
  const newStudent: Student = {
    ...student,
    id: 'stu_' + Date.now() + Math.random().toString(36).substring(2, 5),
    password,
  };
  setStored(KEYS.STUDENTS, [newStudent, ...students]);

  // Create Parent and Student User Accounts
  if (password) {
    const currentUsers = getUsers();
    const parentId = 'user_parent_' + newStudent.id;
    const parentUser: User = {
      id: parentId,
      name: `PH em ${newStudent.name} (${newStudent.parentName})`,
      email: newStudent.parentEmail || '',
      phone: newStudent.parentPhone,
      role: 'parent',
      password: password,
      studentId: newStudent.id,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newStudent.parentName}`,
    };
    const studentUser: User = {
      id: 'user_student_' + newStudent.id,
      name: newStudent.name,
      email: '',
      phone: newStudent.phone || newStudent.parentPhone,
      role: 'student',
      password: password,
      studentId: newStudent.id,
      parentId: parentId,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newStudent.name}`,
    };
    setStored(KEYS.USERS, [...currentUsers, parentUser, studentUser]);
  }

  return newStudent;
};

export const addStudentsBulk = (newStudentsData: Omit<Student, 'id'>[], password?: string): Student[] => {
  const students = getStudents();
  const created: Student[] = newStudentsData.map((s, idx) => ({
    ...s,
    id: 'stu_' + (Date.now() + idx) + Math.random().toString(36).substring(2, 5),
    password,
  }));
  setStored(KEYS.STUDENTS, [...created, ...students]);

  if (password) {
    const currentUsers = getUsers();
    const newUsers: User[] = [];
    created.forEach((newStudent) => {
      const parentId = 'user_parent_' + newStudent.id;
      newUsers.push({
        id: parentId,
        name: `PH em ${newStudent.name} (${newStudent.parentName})`,
        email: newStudent.parentEmail || '',
        phone: newStudent.parentPhone,
        role: 'parent',
        password: password,
        studentId: newStudent.id,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newStudent.parentName}`,
      });
      newUsers.push({
        id: 'user_student_' + newStudent.id,
        name: newStudent.name,
        email: '',
        phone: newStudent.phone || newStudent.parentPhone,
        role: 'student',
        password: password,
        studentId: newStudent.id,
        parentId: parentId,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newStudent.name}`,
      });
    });
    setStored(KEYS.USERS, [...currentUsers, ...newUsers]);
  }

  return created;
};

export const updateStudent = (student: Student) => {
  const students = getStudents().map((s) => (s.id === student.id ? student : s));
  setStored(KEYS.STUDENTS, students);

  // Update associated users
  const currentUsers = getUsers();
  const updatedUsers = currentUsers.map(user => {
    if (user.studentId === student.id) {
      const isParent = user.role === 'parent';
      return {
        ...user,
        name: isParent ? `PH em ${student.name} (${student.parentName})` : student.name,
        email: isParent ? (student.parentEmail || '') : '',
        phone: isParent ? student.parentPhone : (student.phone || student.parentPhone),
        password: student.password || user.password,
      };
    }
    return user;
  });
  setStored(KEYS.USERS, updatedUsers);
};

export const deleteStudent = (id: string) => {
  const students = getStudents().filter((s) => s.id !== id);
  setStored(KEYS.STUDENTS, students);
};

// Sessions
export const getSessions = (): Session[] => getStored(KEYS.SESSIONS, INITIAL_SESSIONS);
export const addSession = (session: Omit<Session, 'id' | 'isCompleted'>): Session => {
  const sessions = getSessions();
  const newSession: Session = {
    ...session,
    id: 'ses_' + Date.now(),
    isCompleted: false,
  };
  setStored(KEYS.SESSIONS, [newSession, ...sessions]);
  return newSession;
};

export const updateSession = (session: Session) => {
  const sessions = getSessions().map((s) => (s.id === session.id ? session : s));
  setStored(KEYS.SESSIONS, sessions);
};

// Attendance
export const getAttendance = (): AttendanceRecord[] => getStored(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);

export const saveSessionAttendance = (
  sessionId: string,
  records: { studentId: string; status: AttendanceRecord['status']; note?: string }[]
): AttendanceRecord[] => {
  const currentAttendance = getAttendance();
  const filtered = currentAttendance.filter((a) => a.sessionId !== sessionId);
  
  const now = new Date().toISOString();
  const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
    id: 'att_' + Date.now() + '_' + idx,
    sessionId,
    studentId: r.studentId,
    status: r.status,
    note: r.note || '',
    checkedAt: now,
  }));

  const updatedAll = [...newRecords, ...filtered];
  setStored(KEYS.ATTENDANCE, updatedAll);

  // Mark session completed
  const sessions = getSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (session) {
    updateSession({ ...session, isCompleted: true });
  }

  return newRecords;
};

// Notifications
export const getNotifications = (): NotificationItem[] => getStored(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

export const addNotification = (notif: Omit<NotificationItem, 'id' | 'readStatus' | 'createdAt'>): NotificationItem => {
  const notifs = getNotifications();
  const newNotif: NotificationItem = {
    ...notif,
    id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5),
    readStatus: false,
    createdAt: new Date().toISOString(),
  };
  setStored(KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
  return newNotif;
};

export const markNotificationRead = (id: string) => {
  const notifs = getNotifications().map((n) => (n.id === id ? { ...n, readStatus: true } : n));
  setStored(KEYS.NOTIFICATIONS, notifs);
};

export const markAllNotificationsRead = (userId?: string) => {
  const notifs = getNotifications().map((n) => (!userId || n.userId === userId ? { ...n, readStatus: true } : n));
  setStored(KEYS.NOTIFICATIONS, notifs);
};

// Stats calculation functions
export const getStudentAttendanceStats = (studentId: string): AttendanceStats => {
  const records = getAttendance().filter((a) => a.studentId === studentId);
  const total = records.length;
  
  let present = 0;
  let late = 0;
  let excused = 0;
  let unexcused = 0;

  records.forEach((r) => {
    if (r.status === 'present') present++;
    else if (r.status === 'late') late++;
    else if (r.status === 'excused_absent') excused++;
    else if (r.status === 'unexcused_absent') unexcused++;
  });

  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

  return {
    totalSessions: total,
    presentCount: present,
    lateCount: late,
    excusedAbsentCount: excused,
    unexcusedAbsentCount: unexcused,
    attendanceRate: rate,
  };
};

export const getGroupAttendanceStats = (groupId: string): AttendanceStats => {
  const sessions = getSessions().filter((s) => s.groupId === groupId && s.isCompleted);
  const sessionIds = new Set(sessions.map((s) => s.id));
  const records = getAttendance().filter((a) => sessionIds.has(a.sessionId));
  
  const total = records.length;
  let present = 0;
  let late = 0;
  let excused = 0;
  let unexcused = 0;

  records.forEach((r) => {
    if (r.status === 'present') present++;
    else if (r.status === 'late') late++;
    else if (r.status === 'excused_absent') excused++;
    else if (r.status === 'unexcused_absent') unexcused++;
  });

  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

  return {
    totalSessions: sessions.length,
    presentCount: present,
    lateCount: late,
    excusedAbsentCount: excused,
    unexcusedAbsentCount: unexcused,
    attendanceRate: rate,
  };
};
