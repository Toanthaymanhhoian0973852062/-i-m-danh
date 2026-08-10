import { Student, Session, AttendanceRecord, NotificationItem } from '../types';
import { addNotification, getStudents, getSessions } from './storageService';

export interface DispatchNotificationResult {
  notification: NotificationItem;
  deliveredChannels: string[];
}

export const processAttendanceNotifications = (
  session: Session,
  groupName: string,
  records: { studentId: string; status: AttendanceRecord['status']; note?: string }[]
): DispatchNotificationResult[] => {
  const allStudents = getStudents();
  const results: DispatchNotificationResult[] = [];

  records.forEach((rec) => {
    // Only generate parent notification if absent or late or explicitly requested
    if (rec.status === 'present' || rec.status === 'unmarked') {
      return;
    }

    const student = allStudents.find((s) => s.id === rec.studentId);
    if (!student) return;

    let statusText = '';
    let emoji = '';
    let type: NotificationItem['type'] = 'info';

    if (rec.status === 'unexcused_absent') {
      statusText = 'Vắng không phép';
      emoji = '🔴';
      type = 'absent_unexcused';
    } else if (rec.status === 'excused_absent') {
      statusText = 'Vắng có phép';
      emoji = '🔵';
      type = 'absent_excused';
    } else if (rec.status === 'late') {
      statusText = 'Đi trễ';
      emoji = '🟡';
      type = 'late';
    }

    // Format date DD/MM/YYYY
    const dateParts = session.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    let title = `${emoji} THÔNG BÁO ĐIỂM DANH: ${statusText.toUpperCase()} – ${student.name}`;
    let message = '';

    if (rec.status === 'late') {
      message = `THÔNG BÁO ĐIỂM DANH\n\nKính gửi phụ huynh em ${student.name}.\n\nEm ${student.name} đã đi trễ trong buổi học Toán ngày ${formattedDate} (${groupName}).\nGiờ bắt đầu: ${session.startTime}.\n${rec.note ? 'Ghi chú từ giáo viên: ' + rec.note + '\n' : ''}\nTOÁN THẦY MẠNH`;
    } else {
      message = `THÔNG BÁO ĐIỂM DANH\n\nKính gửi phụ huynh em ${student.name}.\n\nTrong buổi học Toán ngày ${formattedDate} (${groupName}), em ${student.name} được ghi nhận:\n${statusText}.\nThời gian học: ${session.startTime} – ${session.endTime}.\n${rec.note ? 'Lý do/Ghi chú: ' + rec.note + '\n' : ''}\nQuý phụ huynh vui lòng kiểm tra thông tin.\n\nTOÁN THẦY MẠNH`;
    }

    // Deliveries: In-App, Email (Mocked), Zalo OA API (Mocked architecture)
    const channels = ['Thông báo App', 'Email (Đã gửi)'];
    if (student.parentPhone) {
      channels.push('Zalo OA API (Sẵn sàng)');
    }

    const newNotif = addNotification({
      userId: `user_parent_${student.id}`, // mapped to child
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      title,
      message,
      type,
      sessionDate: formattedDate,
      groupName,
      channelsSent: channels,
    });

    results.push({
      notification: newNotif,
      deliveredChannels: channels,
    });
  });

  return results;
};
