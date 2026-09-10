import React, { useState, useEffect } from 'react';
import { Student, ClassGroup, AttendanceStatus, AttendanceEntry, AttendanceSession, UserProfile } from '../types';
import { SaveSuccessModal } from './SaveSuccessModal';
import {
  Check,
  Info,
  AlertTriangle,
  X,
  CheckCircle2,
  Save,
  Search,
  Filter,
  Send,
  Sparkles,
  UserCheck,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Upload,
  Camera,
  CheckSquare,
  Edit2,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface AbsensiMudahProps {
  students: Student[];
  classes: ClassGroup[];
  onSaveSession: (session: AttendanceSession) => void;
  onOpenParentWA?: (student: Student, status: AttendanceStatus, note?: string) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  selectedClassIdFilter?: string;
  onBackToHome?: () => void;
  currentUser?: UserProfile;
}

export const AbsensiMudah: React.FC<AbsensiMudahProps> = ({
  students,
  classes,
  onSaveSession,
  onOpenParentWA,
  onEditStudent,
  onDeleteStudent,
  selectedClassIdFilter,
  currentUser,
}) => {
  const isStudent = currentUser?.userType === 'SISWA';

  // State for quick student edit modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');
  const [editNisn, setEditNisn] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditNisn(student.nisn || student.nis || '');
    setEditParentName(student.parentName || '');
    setEditParentPhone(student.parentPhone || '');
  };

  const handleSaveQuickStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !onEditStudent) return;
    const updated: Student = {
      ...editingStudent,
      name: editName,
      nisn: editNisn,
      nis: editNisn,
      parentName: editParentName,
      parentPhone: editParentPhone,
    };
    onEditStudent(updated);
    setEditingStudent(null);
    setSaveSuccessMsg(`Data murid ${editName} berhasil diperbarui!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Find the logged-in student record if user is student
  const studentSelf = isStudent
    ? students.find(
        (s) =>
          (currentUser?.studentId && s.id === currentUser.studentId) ||
          (currentUser?.nipOrNisn && s.nisn === currentUser.nipOrNisn) ||
          (currentUser?.nis && s.nis === currentUser.nis) ||
          s.name.toLowerCase() === (currentUser?.name || '').toLowerCase()
      ) || students[0]
    : null;

  const [selectedClassId, setSelectedClassId] = useState<string>(
    studentSelf?.classId || selectedClassIdFilter || classes[0]?.id || ''
  );

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
  const [subject, setSubject] = useState<string>('Presensi Harian Pagi');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Student self-attendance state
  const [selfStatus, setSelfStatus] = useState<AttendanceStatus>('HADIR');
  const [selfNote, setSelfNote] = useState<string>('');
  const [selfPhotoProof, setSelfPhotoProof] = useState<string | null>(null);

  // Map of studentId -> { status: AttendanceStatus, note: string } for Teacher Mode
  const [entriesMap, setEntriesMap] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});

  const [recordedBy, setRecordedBy] = useState<string>(
    currentUser?.name || (isStudent ? 'Siswa Mandiri' : 'Budi Raharjo, S.Pd.')
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentClass = classes.find((c) => c.id === (studentSelf?.classId || selectedClassId));
  const classStudents = isStudent && studentSelf
    ? [studentSelf]
    : students.filter((s) => s.classId === selectedClassId);

  // Initialize or update entries when class selection changes
  useEffect(() => {
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach((s) => {
      initialMap[s.id] = { status: 'HADIR', note: '' };
    });
    setEntriesMap(initialMap);
  }, [selectedClassId, students]);

  // Filter students by search
  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis && s.nis.includes(searchQuery)) ||
      (s.nisn && s.nisn.includes(searchQuery))
  );

  // Status Change Handler
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setEntriesMap((prev) => ({
      ...prev,
      [studentId]: {
        status,
        note: prev[studentId]?.note || '',
      },
    }));
  };

  // Note Change Handler
  const handleNoteChange = (studentId: string, note: string) => {
    setEntriesMap((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'HADIR',
        note,
      },
    }));
  };

  // Quick Action: Mark All Present
  const handleMarkAllHadir = () => {
    const updatedMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach((s) => {
      updatedMap[s.id] = {
        status: 'HADIR',
        note: entriesMap[s.id]?.note || '',
      };
    });
    setEntriesMap(updatedMap);
  };

  // Calculate live statistics for current class
  let totalHadir = 0;
  let totalIzin = 0;
  let totalSakit = 0;
  let totalAlpa = 0;

  Object.values(entriesMap).forEach((entry: { status: AttendanceStatus; note: string }) => {
    if (entry.status === 'HADIR') totalHadir++;
    if (entry.status === 'IZIN') totalIzin++;
    if (entry.status === 'SAKIT') totalSakit++;
    if (entry.status === 'ALPA') totalAlpa++;
  });

  const totalStudentsInClass = classStudents.length;
  const presencePercentage =
    totalStudentsInClass > 0 ? Math.round((totalHadir / totalStudentsInClass) * 100) : 0;

  // Student Self Check-in Submit
  const handleStudentSelfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentSelf) return;

    const studentEntry: AttendanceEntry = {
      studentId: studentSelf.id,
      status: selfStatus,
      note: selfNote || (selfStatus === 'HADIR' ? 'Hadir tepat waktu' : `Keterangan: ${selfStatus}`),
    };

    const newSession: AttendanceSession = {
      id: `att-self-${Date.now()}`,
      date,
      time,
      classId: studentSelf.classId,
      subject: subject || 'Presensi Mandiri Siswa',
      semester: 'Ganjil 2026/2027',
      recordedBy: currentUser?.name || studentSelf.name,
      createdAt: Date.now(),
      entries: [studentEntry],
    };

    onSaveSession(newSession);
    setSaveSuccessMsg('(Simulasi) Absensi disimpan!');
  };

  // Handle Form Submit for Teacher / Admin
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const entriesList: AttendanceEntry[] = classStudents.map((s) => ({
      studentId: s.id,
      status: entriesMap[s.id]?.status || 'HADIR',
      note: entriesMap[s.id]?.note || '',
    }));

    const newSession: AttendanceSession = {
      id: `att-${Date.now()}`,
      date,
      time,
      classId: selectedClassId,
      subject,
      semester: 'Ganjil 2026/2027',
      recordedBy,
      createdAt: Date.now(),
      entries: entriesList,
    };

    onSaveSession(newSession);
    setSaveSuccessMsg('(Simulasi) Absensi disimpan!');
  };

  // STUDENT VIEW ONLY (Personalized single-student presence check-in)
  if (isStudent) {
    const student = studentSelf || {
      id: currentUser?.studentId || 'std-self',
      name: currentUser?.name || 'Siswa',
      nisn: currentUser?.nipOrNisn || '0081234501',
      gender: currentUser?.gender || 'L',
      classId: classes[0]?.id || 'cls-1',
      parentName: currentUser?.parentName || 'Orang Tua',
      parentPhone: currentUser?.parentPhone || '628123456789',
      avatarUrl: currentUser?.avatarUrl,
    };

    const studentAvatar =
      currentUser?.avatarUrl ||
      student.avatarUrl ||
      (student.gender === 'P'
        ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80');

    return (
      <div className="max-w-xl mx-auto space-y-6 pb-12">
        {/* Header Title */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Presensi Mandiri Siswa
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Konfirmasi kehadiran Anda untuk hari ini secara langsung.
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold shadow-xs animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Student Personal Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <img
              src={studentAvatar}
              alt={student.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {student.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-100">
                  {currentClass?.name || 'Kelas 7A'}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono font-semibold rounded-lg text-xs">
                  NISN: {student.nisn}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleStudentSelfSubmit} className="space-y-5">
            {/* Date & Time info */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">Tanggal Hari Ini</span>
                  <span className="font-bold text-slate-800">{date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400">Waktu Presensi</span>
                  <span className="font-bold text-slate-800">{time} WIB</span>
                </div>
              </div>
            </div>

            {/* Attendance Status Selection Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Pilih Status Kehadiran Anda Hari Ini:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* HADIR */}
                <button
                  type="button"
                  onClick={() => setSelfStatus('HADIR')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selfStatus === 'HADIR'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102 ring-4 ring-emerald-100'
                      : 'bg-emerald-50/50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                  }`}
                >
                  <Check className="w-6 h-6" />
                  <span className="font-extrabold text-sm">HADIR</span>
                  <span className="text-[10px] opacity-85">Tepat Waktu</span>
                </button>

                {/* IZIN */}
                <button
                  type="button"
                  onClick={() => setSelfStatus('IZIN')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selfStatus === 'IZIN'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md scale-102 ring-4 ring-sky-100'
                      : 'bg-sky-50/50 text-sky-800 border-sky-200 hover:bg-sky-100/70'
                  }`}
                >
                  <Info className="w-6 h-6" />
                  <span className="font-extrabold text-sm">IZIN</span>
                  <span className="text-[10px] opacity-85">Ada Kepentingan</span>
                </button>

                {/* SAKIT */}
                <button
                  type="button"
                  onClick={() => setSelfStatus('SAKIT')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selfStatus === 'SAKIT'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-102 ring-4 ring-amber-100'
                      : 'bg-amber-50/50 text-amber-800 border-amber-200 hover:bg-amber-100/70'
                  }`}
                >
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-extrabold text-sm">SAKIT</span>
                  <span className="text-[10px] opacity-85">Surat / Istirahat</span>
                </button>
              </div>
            </div>

            {/* Note / Reason Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Keterangan / Alasan {selfStatus !== 'HADIR' ? '(Wajib Diisi)' : '(Opsional)'}
              </label>
              <textarea
                rows={3}
                required={selfStatus !== 'HADIR'}
                value={selfNote}
                onChange={(e) => setSelfNote(e.target.value)}
                placeholder={
                  selfStatus === 'HADIR'
                    ? 'Contoh: Hadir di kelas / kegiatan belajar mengajar'
                    : selfStatus === 'IZIN'
                    ? 'Tuliskan alasan izin keperluan keluarga / acara dinas...'
                    : 'Tuliskan gejala sakit / rawat inap / istirahat dokter...'
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 text-xs sm:text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Kirim & Simpan Presensi Saya</span>
            </button>
          </form>
        </div>

        {/* Save Success Modal */}
        <SaveSuccessModal
          isOpen={!!saveSuccessMsg}
          message={saveSuccessMsg || '(Simulasi) Absensi disimpan!'}
          onClose={() => setSaveSuccessMsg(null)}
        />
      </div>
    );
  }

  // GURU / ADMIN VIEW (Full Class Presence Management)
  return (
    <div className="space-y-6 pb-12">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Absensi Mudah
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Catat kehadiran murid dengan cepat, praktis, dan akurat.
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Class & Date Selector Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Select Class */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Pilih Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Wali: {c.waliKelas})
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Tanggal Absensi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>

          {/* Mata Pelajaran / Sesi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Mata Pelajaran / Jam
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Wali Kelas / Pagi"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>

          {/* Pengajar / Guru */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Dicatat Oleh
            </label>
            <input
              type="text"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>
        </div>

        {/* Live Counters & Quick Controls Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Badges Summary */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200/80 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Hadir: {totalHadir}</span>
            </span>
            <span className="px-3 py-1.5 bg-sky-100 text-sky-800 rounded-xl border border-sky-200/80 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Izin: {totalIzin}</span>
            </span>
            <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200/80 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Sakit: {totalSakit}</span>
            </span>
            <span className="px-3 py-1.5 bg-rose-100 text-rose-800 rounded-xl border border-rose-200/80 flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-600" />
              <span>Alpa: {totalAlpa}</span>
            </span>
            <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl shadow-xs font-extrabold">
              Tingkat Kehadiran: {presencePercentage}%
            </span>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleMarkAllHadir}
              className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tandai Semua Hadir</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset status absensi dan catatan untuk seluruh murid di kelas ini?')) {
                  const resetMap: Record<string, { status: AttendanceStatus; note: string }> = {};
                  classStudents.forEach((s) => {
                    resetMap[s.id] = { status: 'HADIR', note: '' };
                  });
                  setEntriesMap(resetMap);
                }
              }}
              className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset isian kehadiran"
            >
              <X className="w-3.5 h-3.5 text-slate-600" />
              <span>Reset Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List Table & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Murid {currentClass?.name || ''} ({classStudents.length} Siswa)
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Table Content */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold">Tidak ada murid ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Siswa & NISN</th>
                  <th className="py-3.5 px-4 w-72 text-center">Status Kehadiran</th>
                  <th className="py-3.5 px-4">Keterangan / Alasan</th>
                  <th className="py-3.5 px-4 w-36 text-center">Aksi & Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => {
                  const currentEntry = entriesMap[student.id] || { status: 'HADIR', note: '' };
                  const isAbsent = currentEntry.status !== 'HADIR';

                  const defaultAvatar =
                    student.avatarUrl ||
                    (student.gender === 'P'
                      ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
                      : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80');

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isAbsent ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Number */}
                      <td className="py-3.5 px-4 text-center font-bold text-xs text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Name & NISN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={defaultAvatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              NISN: {student.nisn || student.nis}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* HADIR */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'HADIR')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              currentEntry.status === 'HADIR'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            Hadir
                          </button>

                          {/* SAKIT */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'SAKIT')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              currentEntry.status === 'SAKIT'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            Sakit
                          </button>

                          {/* IZIN */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'IZIN')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              currentEntry.status === 'IZIN'
                                ? 'bg-sky-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            Izin
                          </button>

                          {/* ALPA */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ALPA')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              currentEntry.status === 'ALPA'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            Alpa
                          </button>
                        </div>
                      </td>

                      {/* Note Input */}
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder={isAbsent ? 'Tambahkan catatan...' : 'Catatan opsional...'}
                          value={currentEntry.note}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none transition-colors ${
                            isAbsent
                              ? 'bg-white border-amber-300 text-slate-800 focus:border-amber-500'
                              : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-indigo-500'
                          }`}
                        />
                      </td>

                      {/* Actions Column: WA, Edit Student, Reset */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Edit Student Data Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudent(student)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                            title={`Edit Data Murid: ${student.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Student Row */}
                          <button
                            type="button"
                            onClick={() => {
                              handleStatusChange(student.id, 'HADIR');
                              handleNoteChange(student.id, '');
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Reset Kehadiran Siswa Ini ke Hadir"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Parent WA Notification */}
                          {onOpenParentWA && (
                            <button
                              type="button"
                              onClick={() => onOpenParentWA(student, currentEntry.status, currentEntry.note)}
                              className={`p-1.5 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                currentEntry.status === 'HADIR'
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                              title={
                                currentEntry.status === 'HADIR'
                                  ? `Kirim WA Hadir ke Orang Tua (${student.parentName || 'Ortu'}: ${student.parentPhone || '-'})`
                                  : `Kirim WA Ketidakhadiran (${currentEntry.status}) ke Orang Tua`
                              }
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline text-[10px]">
                                {currentEntry.status === 'HADIR' ? 'WA Hadir' : 'WA'}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Save Action */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Menampilkan {filteredStudents.length} dari {classStudents.length} Siswa
          </p>

          <button
            onClick={handleSave}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Absensi {currentClass?.name || ''}</span>
          </button>
        </div>
      </div>

      {/* Quick Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Edit Data Murid
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NISN *</label>
                <input
                  type="text"
                  required
                  value={editNisn}
                  onChange={(e) => setEditNisn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                <input
                  type="text"
                  value={editParentName}
                  onChange={(e) => setEditParentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Orang Tua</label>
                <input
                  type="text"
                  value={editParentPhone}
                  onChange={(e) => setEditParentPhone(e.target.value)}
                  placeholder="628123456789"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      <SaveSuccessModal
        isOpen={!!saveSuccessMsg}
        message={saveSuccessMsg || '(Simulasi) Absensi disimpan!'}
        onClose={() => setSaveSuccessMsg(null)}
      />
    </div>
  );
};
