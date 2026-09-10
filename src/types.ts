export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';

export type UserType = 'GURU' | 'SISWA' | 'ADMIN';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  userType: UserType;
  avatarUrl?: string;
  isCustomPhoto?: boolean;
  nipOrNisn?: string;
  studentId?: string;
  nis?: string;
  gender?: 'L' | 'P';
  className?: string;
  schoolName: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  parentName: string;
  parentPhone: string; // WhatsApp number format e.g. "628123456789"
  avatarUrl?: string;
  isCustomPhoto?: boolean;
}

export interface ClassGroup {
  id: string;
  name: string; // e.g. "VII-A", "VIII-B", "IX-1"
  gradeLevel: string; // e.g. "7", "8", "9"
  waliKelas: string;
  totalStudents?: number;
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string;
  date: string; // ISO date format YYYY-MM-DD
  time: string; // HH:mm
  classId: string;
  subject?: string; // e.g. "Matematika", "Bahasa Indonesia", "Wali Kelas / Pagi"
  semester: string; // e.g. "Ganjil 2026/2027"
  entries: AttendanceEntry[];
  recordedBy: string;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';
  timestamp: number;
  read: boolean;
  studentId?: string;
  classId?: string;
  actionUrl?: string;
}

export type ActiveTab = 'home' | 'absensi' | 'riwayat' | 'laporan' | 'murid' | 'notifikasi' | 'keamanan' | 'profil';
