import React, { useState } from 'react';
import { AttendanceSession, ClassGroup, Student, AttendanceStatus, AttendanceEntry, UserProfile } from '../types';
import { SaveSuccessModal } from './SaveSuccessModal';
import {
  History,
  Calendar,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
  MessageSquare,
  Users,
  Edit2,
  Save,
  Check,
  User,
  GraduationCap
} from 'lucide-react';

interface RiwayatAbsensiProps {
  sessions: AttendanceSession[];
  classes: ClassGroup[];
  students: Student[];
  onEditSession?: (session: AttendanceSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenParentWA?: (student: Student, status: AttendanceStatus, note?: string) => void;
  currentUser?: UserProfile;
}

export const RiwayatAbsensi: React.FC<RiwayatAbsensiProps> = ({
  sessions,
  classes,
  students,
  onEditSession,
  onDeleteSession,
  onOpenParentWA,
  currentUser,
}) => {
  const isStudent = currentUser?.userType === 'SISWA';

  // Find the logged in student if applicable
  const studentSelf = isStudent
    ? students.find(
        (s) =>
          (currentUser?.studentId && s.id === currentUser.studentId) ||
          (currentUser?.nipOrNisn && s.nisn === currentUser.nipOrNisn) ||
          (currentUser?.nis && s.nis === currentUser.nis) ||
          s.name.toLowerCase() === (currentUser?.name || '').toLowerCase()
      ) || students[0]
    : null;

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    sessions[0]?.id || null
  );

  // Edit Session Modal State
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editRecordedBy, setEditRecordedBy] = useState('');
  const [editEntries, setEditEntries] = useState<AttendanceEntry[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleOpenEditSession = (session: AttendanceSession) => {
    setEditingSession(session);
    setEditDate(session.date);
    setEditTime(session.time);
    setEditSubject(session.subject || 'Wali Kelas / Absensi Pagi');
    setEditRecordedBy(session.recordedBy);
    setEditEntries([...session.entries]);
  };

  const handleUpdateEntryStatus = (studentId: string, status: AttendanceStatus) => {
    setEditEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status } : e))
    );
  };

  const handleUpdateEntryNote = (studentId: string, note: string) => {
    setEditEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, note } : e))
    );
  };

  const handleDeleteEntryFromEdit = (studentId: string) => {
    setEditEntries((prev) => prev.filter((e) => e.studentId !== studentId));
  };

  const handleSaveEditSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !onEditSession) return;

    const updated: AttendanceSession = {
      ...editingSession,
      date: editDate,
      time: editTime,
      subject: editSubject,
      recordedBy: editRecordedBy,
      entries: editEntries,
    };

    onEditSession(updated);
    setEditingSession(null);
    setSaveSuccessMsg('Perubahan absensi berhasil disimpan!');
  };

  // Delete single student entry from existing session
  const handleDeleteStudentEntry = (sessionId: string, studentId: string) => {
    if (!onEditSession) return;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    if (confirm('Hapus data kehadiran siswa ini dari sesi?')) {
      const updated: AttendanceSession = {
        ...session,
        entries: session.entries.filter((e) => e.studentId !== studentId),
      };
      onEditSession(updated);
    }
  };

  // Format date helper: "Rabu, 22 Mei 2024"
  const formatIndonesianDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
      const monthName = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ][d.getMonth()];
      return `${dayName}, ${d.getDate()} ${monthName} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Helper for Month label format "Mei 2024"
  const formatMonthLabel = (yyyyMm: string) => {
    try {
      const [year, month] = yyyyMm.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      const monthNames = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      return `${monthNames[monthIndex]} ${year}`;
    } catch {
      return yyyyMm;
    }
  };

  // If student, filter sessions to only those where this student has an entry
  const studentTargetId = studentSelf?.id || currentUser?.studentId;

  const relevantSessions = isStudent
    ? sessions
        .map((sess) => {
          const entry = sess.entries.find(
            (e) =>
              e.studentId === studentTargetId ||
              (studentSelf && e.studentId === studentSelf.id)
          );
          return entry ? { ...sess, entries: [entry] } : null;
        })
        .filter((s): s is AttendanceSession => s !== null)
    : sessions;

  // Get available months from relevant sessions
  const availableMonths = Array.from(
    new Set<string>(relevantSessions.map((s) => s.date.substring(0, 7)))
  ).sort().reverse();

  // Filter sessions by month/class
  const filteredSessions = relevantSessions.filter((sess) => {
    if (!isStudent && selectedClassId !== 'ALL' && sess.classId !== selectedClassId) return false;
    if (selectedMonth !== 'ALL' && !sess.date.startsWith(selectedMonth)) return false;
    return true;
  });

  // Calculate live statistics across filtered sessions
  let totalHadir = 0;
  let totalIzin = 0;
  let totalSakit = 0;
  let totalAlpa = 0;

  filteredSessions.forEach((sess) => {
    sess.entries.forEach((e) => {
      if (e.status === 'HADIR') totalHadir++;
      if (e.status === 'IZIN') totalIzin++;
      if (e.status === 'SAKIT') totalSakit++;
      if (e.status === 'ALPA') totalAlpa++;
    });
  });

  const totalEntries = totalHadir + totalIzin + totalSakit + totalAlpa;
  const attendanceRate = totalEntries > 0 ? Math.round((totalHadir / totalEntries) * 100) : 0;

  // STUDENT SPECIFIC RIWAYAT VIEW
  if (isStudent) {
    return (
      <div className="space-y-6 pb-12 max-w-3xl mx-auto">
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Riwayat Presensi Saya
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Histori catatan kehadiran pribadi Anda: <span className="font-bold text-slate-700">{currentUser?.name}</span>
              </p>
            </div>
          </div>

          {/* Month Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-600 cursor-pointer"
            >
              <option value="ALL">Semua Bulan</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-emerald-700">Hadir</span>
            <span className="text-xl font-extrabold text-emerald-900 mt-0.5">{totalHadir}</span>
          </div>

          <div className="bg-sky-50 border border-sky-200/80 p-3.5 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-sky-700">Izin</span>
            <span className="text-xl font-extrabold text-sky-900 mt-0.5">{totalIzin}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-amber-700">Sakit</span>
            <span className="text-xl font-extrabold text-amber-900 mt-0.5">{totalSakit}</span>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 p-3.5 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-rose-700">Alpa</span>
            <span className="text-xl font-extrabold text-rose-900 mt-0.5">{totalAlpa}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-indigo-600 text-white p-3.5 rounded-2xl flex flex-col items-center justify-center shadow-xs">
            <span className="text-[11px] font-semibold text-indigo-100">Kehadiran</span>
            <span className="text-xl font-extrabold mt-0.5">{attendanceRate}%</span>
          </div>
        </div>

        {/* Timeline List of Student's Past Records */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Riwayat Tanggal Presensi ({filteredSessions.length} Catatan)
            </h3>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Belum ada riwayat absensi pada periode ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSessions.map((sess) => {
                const entry = sess.entries[0];
                const status = entry?.status || 'HADIR';
                const note = entry?.note || '';
                const classObj = classes.find((c) => c.id === sess.classId);

                const statusStyles = {
                  HADIR: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  IZIN: 'bg-sky-100 text-sky-800 border-sky-200',
                  SAKIT: 'bg-amber-100 text-amber-800 border-amber-200',
                  ALPA: 'bg-rose-100 text-rose-800 border-rose-200',
                }[status];

                return (
                  <div
                    key={sess.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {formatIndonesianDate(sess.date)}
                          </h4>
                          <span className="text-xs font-mono text-slate-400">
                            • {sess.time} WIB
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {sess.subject || 'Presensi Harian'} ({classObj?.name || 'Kelas'})
                        </p>
                        {note && (
                          <p className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block mt-2">
                            <span className="font-semibold text-slate-700">Catatan:</span> {note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center self-end">
                      <span
                        className={`px-3.5 py-1 rounded-xl text-xs font-extrabold border ${statusStyles}`}
                      >
                        {status}
                      </span>

                      {/* Edit and Delete Buttons for Student Record */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditSession(sess)}
                        className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit Catatan / Status Presensi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteSession && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus catatan presensi tanggal ${sess.date}?`)) {
                              onDeleteSession(sess.id);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Catatan Presensi Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Edit Modal */}
        {editingSession && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit Catatan Presensi
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditSession} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                    <input
                      type="date"
                      required
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Waktu</label>
                    <input
                      type="text"
                      required
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">Status Kehadiran</label>
                  {editEntries.map((entry) => (
                    <div key={entry.studentId} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(['HADIR', 'IZIN', 'SAKIT', 'ALPA'] as AttendanceStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateEntryStatus(entry.studentId, st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              entry.status === st
                                ? st === 'HADIR'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : st === 'IZIN'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : st === 'SAKIT'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Catatan / Keterangan Tambahan
                        </label>
                        <input
                          type="text"
                          placeholder="Alasan / catatan..."
                          value={entry.note || ''}
                          onChange={(e) => handleUpdateEntryNote(entry.studentId, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingSession(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12 max-w-2xl mx-auto sm:max-w-none">
      {/* Top Mobile/Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Riwayat Absensi
            </h1>
            <p className="text-xs text-slate-500">
              Rekapitulasi kehadiran harian murid sekolah
            </p>
          </div>
        </div>

        {/* Top Filter Selectors */}
        <div className="grid grid-cols-2 gap-2.5 sm:w-auto">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none shadow-2xs cursor-pointer"
          >
            <option value="ALL">Semua Bulan</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>

          {/* Class Selector */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none shadow-2xs cursor-pointer"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ringkasan Box */}
      <div className="space-y-2">
        <h2 className="text-xs sm:text-sm font-bold text-slate-700 px-1 uppercase tracking-wider">
          Ringkasan
        </h2>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs grid grid-cols-4 gap-2 text-center">
          {/* Hadir */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Hadir</span>
            <span className="text-lg font-extrabold text-emerald-600 mt-0.5">{totalHadir}</span>
          </div>

          {/* Izin */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
              <Info className="w-4 h-4" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Izin</span>
            <span className="text-lg font-extrabold text-amber-600 mt-0.5">{totalIzin}</span>
          </div>

          {/* Sakit */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-1">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Sakit</span>
            <span className="text-lg font-extrabold text-rose-600 mt-0.5">{totalSakit}</span>
          </div>

          {/* Alpha */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1">
              <X className="w-4 h-4" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Alpha</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5">{totalAlpa}</span>
          </div>
        </div>
      </div>

      {/* Daftar Riwayat List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
            Daftar Riwayat
          </h2>
          <span className="text-xs text-slate-500 font-bold">
            Total {filteredSessions.length} Sesi
          </span>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Belum Ada Riwayat Absensi</p>
            <p className="text-xs text-slate-500 mt-1">
              Sesi absensi yang telah dicatat akan secara otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {filteredSessions.map((session) => {
              const classObj = classes.find((c) => c.id === session.classId);
              const isExpanded = expandedSessionId === session.id;

              const hadirCount = session.entries.filter((e) => e.status === 'HADIR').length;
              const totalCount = session.entries.length;
              const formattedDateStr = formatIndonesianDate(session.date);

              return (
                <div key={session.id} className="transition-colors">
                  {/* Date Row Item */}
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/90 cursor-pointer select-none transition-colors"
                  >
                    <div className="pr-3">
                      <p className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {formattedDateStr}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{classObj?.name || 'Kelas'}</span> • {session.subject || 'Pagi'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-sm font-extrabold text-slate-900">
                        {hadirCount}/{totalCount}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90 text-blue-600' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Session Details */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 border-t border-slate-100 p-4 space-y-3 animate-fade-in">
                      {/* Session Info & Actions (Edit & Hapus Sesi) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 text-xs text-slate-600 gap-2">
                        <div>
                          <p className="font-semibold text-slate-800">
                            Waktu: {session.time} WIB | Pengajar: {session.recordedBy}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {onEditSession && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditSession(session);
                              }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Edit Data Sesi Absensi"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Edit Sesi</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  `Hapus riwayat absensi ${classObj?.name || ''} tanggal ${session.date}?`
                                )
                              ) {
                                onDeleteSession(session.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Hapus Sesi</span>
                          </button>
                        </div>
                      </div>

                      {/* Student Entries Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {session.entries.map((entry) => {
                          const student = students.find((s) => s.id === entry.studentId);
                          if (!student) return null;

                          const statusBadgeClass =
                            entry.status === 'HADIR'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : entry.status === 'IZIN'
                              ? 'bg-sky-100 text-sky-800 border-sky-200'
                              : entry.status === 'SAKIT'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200';

                          return (
                            <div
                              key={entry.studentId}
                              className="bg-white p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    student.gender === 'L'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-pink-100 text-pink-700'
                                  }`}
                                >
                                  {student.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{student.name}</p>
                                  <p className="text-[10px] text-slate-500">
                                    NISN: {student.nisn || student.nis} {entry.note ? `| ${entry.note}` : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${statusBadgeClass}`}
                                >
                                  {entry.status}
                                </span>

                                {onOpenParentWA && entry.status !== 'HADIR' && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenParentWA(student, entry.status, entry.note)}
                                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                                    title="Kirim WA Orang Tua"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudentEntry(session.id, student.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus entri siswa ini dari sesi"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit Data Sesi Absensi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbarui tanggal, informasi pengajar, atau koreksi status murid
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSession} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Absensi
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam / Waktu
                  </label>
                  <input
                    type="text"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran / Jam
                  </label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dicatat Oleh
                  </label>
                  <input
                    type="text"
                    required
                    value={editRecordedBy}
                    onChange={(e) => setEditRecordedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Student entries list to edit */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Daftar Kehadiran Siswa ({editEntries.length})
                  </h4>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editEntries.map((entry) => {
                    const student = students.find((s) => s.id === entry.studentId);
                    return (
                      <div
                        key={entry.studentId}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {student?.name || 'Siswa'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            NISN: {student?.nisn || student?.nis || '-'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Status selection buttons */}
                          <div className="flex items-center gap-1">
                            {(['HADIR', 'SAKIT', 'IZIN', 'ALPA'] as AttendanceStatus[]).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleUpdateEntryStatus(entry.studentId, st)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  entry.status === st
                                    ? st === 'HADIR'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'SAKIT'
                                      ? 'bg-amber-600 text-white'
                                      : st === 'IZIN'
                                      ? 'bg-sky-600 text-white'
                                      : 'bg-rose-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>

                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={entry.note || ''}
                            onChange={(e) => handleUpdateEntryNote(entry.studentId, e.target.value)}
                            className="w-24 sm:w-32 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:border-indigo-500"
                          />

                          <button
                            type="button"
                            onClick={() => handleDeleteEntryFromEdit(entry.studentId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus siswa dari sesi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
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
        message={saveSuccessMsg || 'Perubahan absensi berhasil disimpan!'}
        onClose={() => setSaveSuccessMsg(null)}
      />
    </div>
  );
};
