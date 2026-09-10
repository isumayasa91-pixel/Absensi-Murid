import React, { useState } from 'react';
import { FeatureSquircleIcon, AppLogo } from './AppLogo';
import { ActiveTab, AttendanceSession, Student, ClassGroup, UserProfile, AttendanceEntry, AttendanceStatus } from '../types';
import {
  ArrowRight,
  CheckCircle2,
  UserX,
  AlertTriangle,
  Sparkles,
  Plus,
  Clock,
  FileSpreadsheet,
  UserCheck,
  GraduationCap,
  Award,
  Calendar,
  ShieldCheck,
  User,
  Edit2,
  Trash2,
  X,
  Save,
  Check
} from 'lucide-react';

interface DashboardOverviewProps {
  setActiveTab: (tab: ActiveTab) => void;
  students: Student[];
  classes: ClassGroup[];
  sessions: AttendanceSession[];
  userProfile: UserProfile;
  onEditSession?: (session: AttendanceSession) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  setActiveTab,
  students,
  classes,
  sessions,
  userProfile,
  onEditSession,
  onDeleteSession,
}) => {
  // Modal Edit Session state
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editRecordedBy, setEditRecordedBy] = useState('');
  const [editEntries, setEditEntries] = useState<AttendanceEntry[]>([]);

  const handleOpenEditSession = (session: AttendanceSession) => {
    setEditingSession(session);
    setEditDate(session.date);
    setEditTime(session.time);
    setEditSubject(session.subject || 'Presensi Harian');
    setEditRecordedBy(session.recordedBy);
    setEditEntries([...session.entries]);
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
  };

  const handleUpdateEntryStatus = (studentId: string, status: AttendanceStatus) => {
    setEditEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status } : e))
    );
  };

  const handleDeleteEntryFromEdit = (studentId: string) => {
    setEditEntries((prev) => prev.filter((e) => e.studentId !== studentId));
  };
  // Calculate stats for Today
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.date === todayStr);

  let totalHadirToday = 0;
  let totalIzinToday = 0;
  let totalSakitToday = 0;
  let totalAlpaToday = 0;
  let totalRecordedToday = 0;

  todaySessions.forEach((sess) => {
    sess.entries.forEach((e) => {
      totalRecordedToday++;
      if (e.status === 'HADIR') totalHadirToday++;
      if (e.status === 'IZIN') totalIzinToday++;
      if (e.status === 'SAKIT') totalSakitToday++;
      if (e.status === 'ALPA') totalAlpaToday++;
    });
  });

  // Recent attendance rate
  const attendanceRateToday =
    totalRecordedToday > 0 ? Math.round((totalHadirToday / totalRecordedToday) * 100) : 0;

  // Is user student, admin or teacher?
  const isStudent = userProfile.userType === 'SISWA';
  const isAdmin = userProfile.userType === 'ADMIN';

  // Fallback default avatar if none provided
  const avatarUrl =
    userProfile.avatarUrl ||
    (isAdmin
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
      : isStudent
      ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
      : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80');

  const featureCards: {
    id: ActiveTab;
    type: 'absensi' | 'riwayat' | 'laporan' | 'murid' | 'notifikasi' | 'keamanan';
    title: string;
    description: string;
    badge?: string;
  }[] = [
    {
      id: 'murid',
      type: 'murid',
      title: 'Data Murid',
      description: isAdmin
        ? 'Kelola biodata, ganti nama murid, NISN, kelas, dan import Excel.'
        : 'Daftar biodata siswa, NISN, dan kontak orang tua.',
      badge: isAdmin ? 'Akses Utama' : undefined,
    },
    {
      id: 'absensi',
      type: 'absensi',
      title: 'Absensi Kelas',
      description: isStudent
        ? 'Lihat status presensi harian Anda dan teman kelas.'
        : 'Catat dan perbarui kehadiran murid kelas secara praktis.',
      badge: !isAdmin && !isStudent ? 'Fitur Utama' : undefined,
    },
    {
      id: 'riwayat',
      type: 'riwayat',
      title: 'Riwayat Absensi',
      description: 'Lihat rekapitulasi histori kehadiran berdasarkan tanggal.',
    },
    {
      id: 'laporan',
      type: 'laporan',
      title: 'Laporan Presensi',
      description: 'Unduh laporan rekap bulanan format resmi sekolah.',
    },
    {
      id: 'notifikasi',
      type: 'notifikasi',
      title: 'Notifikasi',
      description: 'Pemberitahuan absensi dan pesan sekolah real-time.',
    },
    {
      id: 'keamanan',
      type: 'keamanan',
      title: 'Aman & Terenkripsi',
      description: 'Data tersimpan otomatis di cloud dan terlindungi.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Background Glossy Glow Ambient Blobs - Light Blue Theme */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-60 right-0 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP PROFILE BANNER - Display Photo, Role & Login Context */}
      <div className="bg-gradient-to-br from-white/95 via-sky-50/80 to-blue-50/70 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/90 shadow-xl shadow-sky-500/10 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden group">
        {/* Glossy Reflection Highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-bl from-cyan-300/30 via-sky-300/20 to-transparent rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
          {/* User Profile Photo with Active Status ring */}
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt={userProfile.name}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 shadow-xl ${
                isAdmin
                  ? 'ring-sky-400/50 shadow-sky-500/25'
                  : isStudent
                  ? 'ring-cyan-400/50 shadow-cyan-500/25'
                  : 'ring-blue-400/50 shadow-blue-500/25'
              }`}
            />
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-md"
              title="Status Login Aktif"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </span>
          </div>

          {/* User Profile Info */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-xs ${
                isAdmin
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600'
                  : isStudent
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  : 'bg-gradient-to-r from-blue-500 to-sky-600'
              }`}>
                {isAdmin ? 'Administrator' : isStudent ? 'Siswa Aktif' : 'Guru / Wali Kelas'}
              </span>
              <span className="text-xs font-bold text-slate-600 bg-white/90 px-2.5 py-0.5 rounded-full border border-sky-100 shadow-2xs">
                {userProfile.schoolName}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Selamat Datang, <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 bg-clip-text text-transparent">{userProfile.name}</span>!
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 font-semibold">
              <div className="flex items-center gap-1.5">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                )}
                <span>{userProfile.role}</span>
              </div>
              {userProfile.nipOrNisn && (
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="font-bold text-slate-400">
                    {isAdmin ? 'ID:' : isStudent ? 'NISN:' : 'NIP:'}
                  </span>
                  <span className="font-extrabold text-slate-800">{userProfile.nipOrNisn}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button & Quick Profile Link */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('profil')}
            className="px-4 py-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-sky-600 text-xs sm:text-sm font-bold rounded-2xl border border-sky-200/80 shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <User className="w-4 h-4 text-sky-500" />
            <span>Lihat Profil</span>
          </button>

          {isAdmin ? (
            <button
              onClick={() => setActiveTab('murid')}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 hover:from-sky-600 hover:to-blue-600 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Seting Data Murid</span>
            </button>
          ) : !isStudent ? (
            <button
              onClick={() => setActiveTab('absensi')}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Absensi</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('riwayat')}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>Riwayat Absensi Saya</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. HERO WELCOME BANNER & STATS - Bright Light Blue Theme */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-500 text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sky-500/25 border border-white/30">
        {/* Glossy Lens Flare & Light Glow */}
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-cyan-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-white/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/25 backdrop-blur-md border border-white/40 rounded-full text-xs font-bold tracking-wide text-white shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>Sistem Presensi Digital Sekolah</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight drop-shadow-sm">
              {isStudent
                ? `Dashboard Presensi Siswa Kelas ${userProfile.className || '7A'}`
                : 'Aplikasi Absensi Murid Pintar & Terintegrasi'}
            </h2>
            <p className="text-xs sm:text-sm text-sky-50 leading-relaxed font-semibold">
              {isStudent
                ? 'Pantau catatan kehadiran harian Anda, verifikasi status presensi, dan tinjau rekapitulasi bulanan dengan transparan.'
                : 'Pencatatan kehadiran murid harian, analisis grafik presensi, pembuatan laporan otomatis, dan pemberitahuan ke Orang Tua via WhatsApp.'}
            </p>
          </div>

          {/* Teacher or Student Duty Badge */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 shrink-0 items-start sm:items-center">
            <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-2xl p-3.5 text-white flex items-center gap-3 shadow-lg">
              <img
                src={avatarUrl}
                alt={userProfile.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/70 shadow-md"
              />
              <div>
                <p className="text-[10px] font-bold text-sky-100 uppercase tracking-wider">
                  {isStudent ? 'Siswa Terdaftar' : 'Guru / Wali Kelas'}
                </p>
                <p className="text-xs font-extrabold truncate max-w-[140px]">
                  {userProfile.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid inside Banner - Glossy Cards */}
        <div className="mt-8 pt-6 border-t border-white/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-2xl p-3.5 flex items-center gap-3 shadow-md hover:bg-white/35 transition-all transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-emerald-400/35 border border-emerald-200/50 rounded-xl text-emerald-100 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-sky-100 font-bold">Presensi Hari Ini</p>
              <p className="text-lg font-black text-white drop-shadow-xs">
                {totalRecordedToday > 0 ? `${attendanceRateToday}%` : 'Selesai'}
              </p>
            </div>
          </div>

          <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-2xl p-3.5 flex items-center gap-3 shadow-md hover:bg-white/35 transition-all transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-sky-300/40 border border-sky-100/50 rounded-xl text-cyan-100 shadow-xs">
              <AppLogo size="sm" />
            </div>
            <div>
              <p className="text-xs text-sky-100 font-bold">Total Murid Kelas</p>
              <p className="text-lg font-black text-white drop-shadow-xs">{students.length} Siswa</p>
            </div>
          </div>

          <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-2xl p-3.5 flex items-center gap-3 shadow-md hover:bg-white/35 transition-all transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-amber-300/40 border border-amber-100/50 rounded-xl text-amber-100 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-sky-100 font-bold">Izin / Sakit Hari Ini</p>
              <p className="text-lg font-black text-white drop-shadow-xs">
                {totalIzinToday + totalSakitToday} Siswa
              </p>
            </div>
          </div>

          <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-2xl p-3.5 flex items-center gap-3 shadow-md hover:bg-white/35 transition-all transform hover:-translate-y-0.5">
            <div className="p-2.5 bg-rose-300/40 border border-rose-100/50 rounded-xl text-rose-100 shadow-xs">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-sky-100 font-bold">Tanpa Keterangan</p>
              <p className="text-lg font-black text-white drop-shadow-xs">{totalAlpaToday} Siswa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3 pt-2">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Menu Utama</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Akses cepat fitur presensi dan rekapitulasi data sekolah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full shadow-xs">
            {classes.length} Kelas Terdaftar
          </span>
        </div>
      </div>

      {/* 6 Feature Cards Grid - Glossy & Bright Light Blue Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {featureCards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className="group relative text-left bg-gradient-to-br from-white via-white to-sky-50/60 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-300 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer overflow-hidden"
          >
            {/* Top Glossy Gradient Highlight Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start gap-4">
              {/* Feature Icon */}
              <FeatureSquircleIcon type={card.type} size="md" />

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {card.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Optional Badge */}
            {card.badge && (
              <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-[10px] font-black rounded-full shadow-2xs">
                {card.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Recent Activity / Sessions Quick Summary Section */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl shadow-slate-200/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Sesi Absensi Terakhir</h3>
          </div>
          <button
            onClick={() => setActiveTab('riwayat')}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <span>Lihat Semua Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 bg-sky-50/50 rounded-2xl border border-dashed border-sky-200">
            <p className="text-sm font-semibold text-slate-600">Belum ada sesi absensi yang dicatat.</p>
            {!isStudent && (
              <button
                onClick={() => setActiveTab('absensi')}
                className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                Catat Absensi Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 3).map((sess) => {
              const classObj = classes.find((c) => c.id === sess.classId);
              const total = sess.entries.length;
              const hadir = sess.entries.filter((e) => e.status === 'HADIR').length;
              const izin = sess.entries.filter((e) => e.status === 'IZIN').length;
              const sakit = sess.entries.filter((e) => e.status === 'SAKIT').length;
              const alpa = sess.entries.filter((e) => e.status === 'ALPA').length;
              const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;

              return (
                <div
                  key={sess.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-white to-sky-50/70 hover:from-sky-50 hover:to-blue-50/80 rounded-2xl border border-slate-200/80 transition-all shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                      {classObj ? classObj.name.replace('Kelas ', '') : '7A'}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {classObj?.name || 'Kelas'} - {sess.subject || 'Absensi Harian'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {sess.date} | Pukul {sess.time} WIB | Dicatat oleh: {sess.recordedBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap justify-end">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold shadow-2xs">
                      {hadir} Hadir
                    </span>
                    {izin > 0 && (
                      <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg font-semibold shadow-2xs">
                        {izin} Izin
                      </span>
                    )}
                    {sakit > 0 && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-semibold shadow-2xs">
                        {sakit} Sakit
                      </span>
                    )}
                    {alpa > 0 && (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-bold shadow-2xs">
                        {alpa} Alpa
                      </span>
                    )}
                    <span className="font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1 rounded-lg shadow-xs">
                      {rate}%
                    </span>

                    {/* Edit & Delete Sesi Buttons on Dashboard */}
                    <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSession(sess)}
                        className="p-1.5 bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                        title="Edit Sesi Absensi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteSession && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus sesi absensi ${classObj?.name || 'Kelas'} tanggal ${sess.date}?`)) {
                              onDeleteSession(sess.id);
                            }
                          }}
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                          title="Hapus Sesi Absensi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Monthly Report Helper Banner - Glossy Emerald Teal */}
      <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600 text-white rounded-3xl p-6 shadow-xl shadow-teal-500/20 border border-white/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 shadow-lg">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black">Butuh Rekap Laporan Bulanan?</h4>
            <p className="text-xs sm:text-sm text-teal-50 mt-0.5 font-medium">
              Cetak laporan absensi format resmi sekolah atau unduh berkas Excel/CSV untuk arsip wali kelas.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('laporan')}
          className="px-6 py-3 bg-white text-teal-800 hover:bg-teal-50 text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg whitespace-nowrap transition-all cursor-pointer active:scale-95 relative z-10"
        >
          Buka Laporan
        </button>
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Edit Sesi Absensi
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waktu (WIB)</label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran / Sesi</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dicatat Oleh</label>
                  <input
                    type="text"
                    required
                    value={editRecordedBy}
                    onChange={(e) => setEditRecordedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Entries Status Table */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Daftar Status Siswa Pada Sesi Ini ({editEntries.length} Siswa)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editEntries.map((entry) => {
                    const student = students.find((s) => s.id === entry.studentId);
                    return (
                      <div
                        key={entry.studentId}
                        className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate">
                            {student?.name || 'Siswa'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            NISN: {student?.nisn || student?.nis || '-'}
                          </p>
                        </div>

                        {/* Status Select Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {(['HADIR', 'IZIN', 'SAKIT', 'ALPA'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateEntryStatus(entry.studentId, st)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                entry.status === st
                                  ? st === 'HADIR'
                                    ? 'bg-emerald-600 text-white'
                                    : st === 'IZIN'
                                    ? 'bg-sky-600 text-white'
                                    : st === 'SAKIT'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-rose-600 text-white'
                                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleDeleteEntryFromEdit(entry.studentId)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 ml-1 cursor-pointer"
                            title="Hapus Murid dari Sesi Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
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
    </div>
  );
};

