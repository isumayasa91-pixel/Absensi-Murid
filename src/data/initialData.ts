import { ClassGroup, Student, AttendanceSession, NotificationItem } from '../types';

export const initialClasses: ClassGroup[] = [
  { id: 'c1', name: 'Kelas 7A', gradeLevel: '7', waliKelas: 'Budi Raharjo, S.Pd.' },
  { id: 'c2', name: 'Kelas 7B', gradeLevel: '7', waliKelas: 'Siti Nurhaliza, M.Pd.' },
  { id: 'c3', name: 'Kelas 8A', gradeLevel: '8', waliKelas: 'Dewa Putu, S.Kom.' },
  { id: 'c4', name: 'Kelas 9A', gradeLevel: '9', waliKelas: 'Endang Lestari, S.Si.' },
];

export const initialStudents: Student[] = [
  // Kelas 7A
  { id: 's1', nis: '20260101', nisn: '0081234501', name: 'Ahmad Pratama', gender: 'L', classId: 'c1', parentName: 'Joko Pratama', parentPhone: '6281234567801' },
  { id: 's2', nis: '20260102', nisn: '0081234502', name: 'Annisa Rahmawati', gender: 'P', classId: 'c1', parentName: 'Bambang Rahmawan', parentPhone: '6281234567802' },
  { id: 's3', nis: '20260103', nisn: '0081234503', name: 'Bagus Setyawan', gender: 'L', classId: 'c1', parentName: 'Agus Setyo', parentPhone: '6281234567803' },
  { id: 's4', nis: '20260104', nisn: '0081234504', name: 'Citra Kirana Dewi', gender: 'P', classId: 'c1', parentName: 'Dwi Prasetya', parentPhone: '6281234567804' },
  { id: 's5', nis: '20260105', nisn: '0081234505', name: 'Dimas Anggara', gender: 'L', classId: 'c1', parentName: 'Supriadi', parentPhone: '6281234567805' },
  { id: 's6', nis: '20260106', nisn: '0081234506', name: 'Eka Putri Utami', gender: 'P', classId: 'c1', parentName: 'Haryanto', parentPhone: '6281234567806' },
  { id: 's7', nis: '20260107', nisn: '0081234507', name: 'Fajar Nugraha', gender: 'L', classId: 'c1', parentName: 'Rahmat Hidayat', parentPhone: '6281234567807' },
  { id: 's8', nis: '20260108', nisn: '0081234508', name: 'Gita Gutawa Larasati', gender: 'P', classId: 'c1', parentName: 'Eko Larasati', parentPhone: '6281234567808' },
  { id: 's9', nis: '20260109', nisn: '0081234509', name: 'Hafiz Maulana', gender: 'L', classId: 'c1', parentName: 'Suryanto', parentPhone: '6281234567809' },
  { id: 's10', nis: '20260110', nisn: '0081234510', name: 'Indah Permatasari', gender: 'P', classId: 'c1', parentName: 'Heri Permana', parentPhone: '6281234567810' },

  // Kelas 7B
  { id: 's11', nis: '20260201', nisn: '0081234511', name: 'Jati Kusuma', gender: 'L', classId: 'c2', parentName: 'Budi Kusuma', parentPhone: '6281234567811' },
  { id: 's12', nis: '20260202', nisn: '0081234512', name: 'Kania Intan', gender: 'P', classId: 'c2', parentName: 'Rizal Intan', parentPhone: '6281234567812' },
  { id: 's13', nis: '20260203', nisn: '0081234513', name: 'Lukman Hakim', gender: 'L', classId: 'c2', parentName: 'Hasan Hakim', parentPhone: '6281234567813' },
  { id: 's14', nis: '20260204', nisn: '0081234514', name: 'Maya Mutiara', gender: 'P', classId: 'c2', parentName: 'Taufik Mutiara', parentPhone: '6281234567814' },
  { id: 's15', nis: '20260205', nisn: '0081234515', name: 'Naufal Rizky', gender: 'L', classId: 'c2', parentName: 'Ahmad Rizky', parentPhone: '6281234567815' },

  // Kelas 8A
  { id: 's16', nis: '20250101', nisn: '0071234516', name: 'Oliver Wijaya', gender: 'L', classId: 'c3', parentName: 'Hendra Wijaya', parentPhone: '6281234567816' },
  { id: 's17', nis: '20250102', nisn: '0071234517', name: 'Putri Amelia', gender: 'P', classId: 'c3', parentName: 'Aris Amelia', parentPhone: '6281234567817' },
  { id: 's18', nis: '20250103', nisn: '0071234518', name: 'Qori Rizqullah', gender: 'L', classId: 'c3', parentName: 'Syamsul Rizqullah', parentPhone: '6281234567818' },
  { id: 's19', nis: '20250104', nisn: '0071234519', name: 'Rania Salsabila', gender: 'P', classId: 'c3', parentName: 'Rudi Salsabila', parentPhone: '6281234567819' },

  // Kelas 9A
  { id: 's20', nis: '20240101', nisn: '0061234520', name: 'Sultan Alfarizi', gender: 'L', classId: 'c4', parentName: 'Farid Alfarizi', parentPhone: '6281234567820' },
  { id: 's21', nis: '20240102', nisn: '0061234521', name: 'Tari Kirana', gender: 'P', classId: 'c4', parentName: 'Iwan Kirana', parentPhone: '6281234567821' },
];

export const initialSessions: AttendanceSession[] = [
  {
    id: 'att-20260908-c1',
    date: '2026-09-08',
    time: '07:15',
    classId: 'c1',
    subject: 'Wali Kelas / Absensi Harian',
    semester: 'Ganjil 2026/2027',
    recordedBy: 'Budi Raharjo, S.Pd.',
    createdAt: Date.now() - 86400000,
    entries: [
      { studentId: 's1', status: 'HADIR' },
      { studentId: 's2', status: 'HADIR' },
      { studentId: 's3', status: 'SAKIT', note: 'Demam tinggi, surat dokter dikirim WA' },
      { studentId: 's4', status: 'HADIR' },
      { studentId: 's5', status: 'ALPA', note: 'Tidak ada keterangan dari orang tua' },
      { studentId: 's6', status: 'HADIR' },
      { studentId: 's7', status: 'HADIR' },
      { studentId: 's8', status: 'IZIN', note: 'Acara keluarga di luar kota' },
      { studentId: 's9', status: 'HADIR' },
      { studentId: 's10', status: 'HADIR' },
    ]
  },
  {
    id: 'att-20260907-c1',
    date: '2026-09-07',
    time: '07:15',
    classId: 'c1',
    subject: 'Wali Kelas / Absensi Harian',
    semester: 'Ganjil 2026/2027',
    recordedBy: 'Budi Raharjo, S.Pd.',
    createdAt: Date.now() - 172800000,
    entries: [
      { studentId: 's1', status: 'HADIR' },
      { studentId: 's2', status: 'HADIR' },
      { studentId: 's3', status: 'HADIR' },
      { studentId: 's4', status: 'HADIR' },
      { studentId: 's5', status: 'ALPA', note: 'Belum masuk sekolah' },
      { studentId: 's6', status: 'HADIR' },
      { studentId: 's7', status: 'HADIR' },
      { studentId: 's8', status: 'HADIR' },
      { studentId: 's9', status: 'HADIR' },
      { studentId: 's10', status: 'HADIR' },
    ]
  },
  {
    id: 'att-20260908-c2',
    date: '2026-09-08',
    time: '07:30',
    classId: 'c2',
    subject: 'Wali Kelas / Absensi Harian',
    semester: 'Ganjil 2026/2027',
    recordedBy: 'Siti Nurhaliza, M.Pd.',
    createdAt: Date.now() - 86000000,
    entries: [
      { studentId: 's11', status: 'HADIR' },
      { studentId: 's12', status: 'HADIR' },
      { studentId: 's13', status: 'HADIR' },
      { studentId: 's14', status: 'IZIN', note: 'Lomba Matematika Kabupaten' },
      { studentId: 's15', status: 'HADIR' },
    ]
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Peringatan Ketidakhadiran (Alpa)',
    message: 'Siswa Dimas Anggara (Kelas 7A) tercatat Alpa 2 hari berturut-turut. Kirim notifikasi WA ke Orang Tua.',
    type: 'DANGER',
    timestamp: Date.now() - 3600000 * 2,
    read: false,
    studentId: 's5',
    classId: 'c1'
  },
  {
    id: 'notif-2',
    title: 'Absensi Kelas 7A Tersimpan',
    message: 'Absensi tanggal 8 September 2026 telah berhasil disimpan oleh Budi Raharjo, S.Pd.',
    type: 'SUCCESS',
    timestamp: Date.now() - 3600000 * 12,
    read: true,
    classId: 'c1'
  },
  {
    id: 'notif-3',
    title: 'Siswa Sakit Terdeteksi',
    message: 'Bagus Setyawan (Kelas 7A) dicatat Sakit dengan catatan: Demam tinggi.',
    type: 'WARNING',
    timestamp: Date.now() - 3600000 * 14,
    read: true,
    studentId: 's3',
    classId: 'c1'
  },
  {
    id: 'notif-4',
    title: 'Pemeriksaan Cloud Storage',
    message: 'Sistem penyimpanan lokal dan cloud aktif. Seluruh data murid terenkripsi dan terlindungi.',
    type: 'INFO',
    timestamp: Date.now() - 3600000 * 24,
    read: true
  }
];
