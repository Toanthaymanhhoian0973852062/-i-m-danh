import { Group, Student, Session, AttendanceRecord, NotificationItem, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_teacher_1',
    name: 'Thầy Nguyễn Văn Mạnh',
    email: 'toanthaymanh11293@gmail.com',
    phone: '0988123456',
    role: 'teacher',
    password: 'phuocphu2024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_GROUPS: Group[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_SESSIONS: Session[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
