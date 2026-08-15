export type UserRole = 'teacher' | 'student' | 'parent';

export type AttendanceStatus = 'present' | 'late' | 'excused_absent' | 'unexcused_absent' | 'unmarked';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  studentId?: string; // linked student for 'student' or 'parent' role
  parentId?: string;  // linked parent id for 'student' role
  password?: string;
}

export interface Group {
  id: string;
  name: string;          // e.g., "TOÁN 8A - Nhóm 1"
  grade: string;         // e.g., "Khối 8"
  subject: string;       // e.g., "Toán"
  teacherName: string;   // e.g., "Thầy Mạnh"
  schedule: string;      // e.g., "Thứ 2 - 4 - 6"
  startTime: string;     // e.g., "17:30"
  endTime: string;       // e.g., "19:00"
  location: string;      // e.g., "Phòng A2 - Cơ sở 1"
  tuition?: string;      // e.g., "1.200.000 VNĐ / tháng"
  status: 'active' | 'paused';
}

export interface Student {
  id: string;
  name: string;
  dob: string;           // YYYY-MM-DD
  class: string;         // e.g., "8A1"
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  groupId: string;
  startDate: string;     // YYYY-MM-DD
  status: 'active' | 'inactive';
  password?: string;
}

export interface Session {
  id: string;
  groupId: string;
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  topic?: string;        // e.g., "Đại số: Phương trình bậc nhất"
  isCompleted: boolean;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  checkedAt?: string;    // ISO timestamp
}

export interface NotificationItem {
  id: string;
  userId: string;        // recipient user ID
  studentId: string;
  studentName: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  title: string;
  message: string;
  type: 'absent_unexcused' | 'absent_excused' | 'late' | 'info' | 'reminder';
  readStatus: boolean;
  createdAt: string;     // ISO timestamp
  sessionDate?: string;
  groupName?: string;
  channelsSent?: string[]; // e.g. ['In-App', 'Email (Mock)', 'Zalo OA API']
}

export interface FeeConfig {
  id: string;
  groupId: string;
  studentId?: string; // null/undefined -> group default
  name: string; // e.g., "Học phí Toán 8 - Giai đoạn 1"
  amount: number;
  billingType: 'monthly'; // future: 'per_session', 'package'
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD
  status: 'active' | 'inactive';
}

export interface PaymentQRCode {
  id: string;
  name: string; // e.g., "QR 1"
  bankName: string; // e.g., "ACB"
  accountNumber: string; // e.g., "12345678"
  accountHolder: string; // e.g., "NGUYEN VAN A"
  transferTemplate: string; // e.g., "HOCPHI {{student_name}} T{{month}}"
  qrImage: string; // base64 or URL
  isDefault: boolean;
  status: 'active' | 'inactive';
}

export interface TuitionRecord {
  id: string;
  studentId: string;
  groupId: string;
  month: string; // e.g., "09/2026"
  amountDue: number; // Snapshot from fee_configs
  amountPaid: number;
  dueDate: string; // YYYY-MM-DD
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
}

export interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  excusedAbsentCount: number;
  unexcusedAbsentCount: number;
  attendanceRate: number; // Percentage 0-100
}


export type GradeType = 'TX1' | 'TX2' | 'TX3' | 'TX4' | 'TX5' | 'GK' | 'CK';

export interface GradeRecord {
  id: string;
  studentId: string;
  examName?: string; // legacy
  score: number;
  date?: string; // legacy
  subject?: string; // legacy
  notes?: string; // legacy
  semester?: 1 | 2;
  type?: GradeType;
  imageUrl?: string;
  createdAt: string;
}
