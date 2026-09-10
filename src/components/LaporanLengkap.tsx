import React, { useState } from 'react';
import { AttendanceSession, ClassGroup, Student, AttendanceEntry, AttendanceStatus } from '../types';
import { PieChart as PieChartIcon, BarChart3, Printer, Download, Share2, Copy, Check, Sparkles, Award, AlertTriangle, FileSpreadsheet, Edit2, Trash2, Calendar, Clock, X, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface LaporanLengkapProps {
  sessions: AttendanceSession[];
  classes: ClassGroup[];
  students: Student[];
  schoolName?: string;
  onEditSession?: (session: AttendanceSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const LaporanLengkap: React.FC<LaporanLengkapProps> = ({
  sessions,
  classes,
  students,
  schoolName = 'SMP NEGERI 1 DENPASAR',
  onEditSession,
  onDeleteSession,
  onEditStudent,
  onDeleteStudent,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'ALL');
  const [monthFilter, setMonthFilter] = useState<string>('2026-09');
  const [copiedWASummary, setCopiedWASummary] = useState(false);

  // PDF Modal & Printing Config State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [headmasterName, setHeadmasterName] = useState('Drs. I Made Wijaya, M.Pd');
  const [headmasterNip, setHeadmasterNip] = useState('NIP. 19710315 199702 1 002');
  const [customWaliKelas, setCustomWaliKelas] = useState('');
  const [cityAndDate, setCityAndDate] = useState('Denpasar, 9 September 2026');

  // Edit Session Modal state
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editRecordedBy, setEditRecordedBy] = useState('');
  const [editEntries, setEditEntries] = useState<AttendanceEntry[]>([]);

  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentNisn, setEditStudentNisn] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');

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

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditStudentName(student.name);
    setEditStudentNisn(student.nisn || student.nis || '');
    setEditParentName(student.parentName || '');
    setEditParentPhone(student.parentPhone || '');
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !onEditStudent) return;
    const updated: Student = {
      ...editingStudent,
      name: editStudentName,
      nisn: editStudentNisn,
      nis: editStudentNisn,
      parentName: editParentName,
      parentPhone: editParentPhone,
    };
    onEditStudent(updated);
    setEditingStudent(null);
  };

  // Filter students by selected class
  const filteredStudents =
    selectedClassId === 'ALL'
      ? students
      : students.filter((s) => s.classId === selectedClassId);

  // Filter sessions by selected class and month
  const filteredSessions = sessions.filter((sess) => {
    if (selectedClassId !== 'ALL' && sess.classId !== selectedClassId) return false;
    if (monthFilter && !sess.date.startsWith(monthFilter)) return false;
    return true;
  });

  // Compute student-by-student attendance matrix
  const studentStats = filteredStudents.map((student) => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;
    let totalRecorded = 0;

    filteredSessions.forEach((sess) => {
      const entry = sess.entries.find((e) => e.studentId === student.id);
      if (entry) {
        totalRecorded++;
        if (entry.status === 'HADIR') hadir++;
        if (entry.status === 'IZIN') izin++;
        if (entry.status === 'SAKIT') sakit++;
        if (entry.status === 'ALPA') alpa++;
      }
    });

    const rate = totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 100;

    return {
      student,
      hadir,
      izin,
      sakit,
      alpa,
      totalRecorded,
      rate,
    };
  });

  // Calculate Class Aggregate totals for Chart
  let totalHadir = 0;
  let totalIzin = 0;
  let totalSakit = 0;
  let totalAlpa = 0;

  studentStats.forEach((st) => {
    totalHadir += st.hadir;
    totalIzin += st.izin;
    totalSakit += st.sakit;
    totalAlpa += st.alpa;
  });

  const pieData = [
    { name: 'Hadir', value: totalHadir, color: '#10B981' },
    { name: 'Izin', value: totalIzin, color: '#0EA5E9' },
    { name: 'Sakit', value: totalSakit, color: '#F59E0B' },
    { name: 'Alpa', value: totalAlpa, color: '#F43F5E' },
  ].filter((d) => d.value > 0);

  // Bar chart data per class if "ALL", or student top 8
  const barChartData = studentStats.slice(0, 8).map((st) => ({
    name: st.student.name.split(' ')[0],
    Hadir: st.hadir,
    Izin: st.izin,
    Sakit: st.sakit,
    Alpa: st.alpa,
  }));

  const currentClassName =
    selectedClassId === 'ALL'
      ? 'Semua Kelas'
      : classes.find((c) => c.id === selectedClassId)?.name || 'Kelas';

  const currentWaliKelas =
    customWaliKelas ||
    (selectedClassId === 'ALL'
      ? 'Guru / Wali Kelas'
      : classes.find((c) => c.id === selectedClassId)?.waliKelas || 'Wali Kelas');

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `LAPORAN ABSENSI MURID - ${currentClassName.toUpperCase()} (${monthFilter})\n`;
    csvContent += 'No,NISN,Nama Murid,Jenis Kelamin,Hadir,Izin,Sakit,Alpa,Total Sesi,% Kehadiran\n';

    studentStats.forEach((st, idx) => {
      csvContent += `${idx + 1},${st.student.nisn || st.student.nis},"${st.student.name}",${st.student.gender},${st.hadir},${st.izin},${st.sakit},${st.alpa},${st.totalRecorded},${st.rate}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Absensi_${currentClassName.replace(/\s+/g, '_')}_${monthFilter}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy WhatsApp Text Summary
  const handleCopyWASummary = () => {
    let text = `*REKAP LAPORAN ABSENSI MURID*\n`;
    text += `🏫 *Kelas:* ${currentClassName}\n`;
    text += `📅 *Bulan:* ${monthFilter}\n`;
    text += `---------------------------------\n`;
    text += `✅ *Total Hadir:* ${totalHadir}\n`;
    text += `ℹ️ *Total Izin:* ${totalIzin}\n`;
    text += `⚠️ *Total Sakit:* ${totalSakit}\n`;
    text += `❌ *Total Alpa:* ${totalAlpa}\n\n`;
    text += `*Rincian per Siswa:* \n`;

    studentStats.forEach((st, i) => {
      text += `${i + 1}. *${st.student.name}* (${st.rate}% Hadir) -> H:${st.hadir} | I:${st.izin} | S:${st.sakit} | A:${st.alpa}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedWASummary(true);
    setTimeout(() => setCopiedWASummary(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <PieChartIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Laporan Lengkap
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cetak, unduh, dan bagikan rekapitulasi kehadiran murid.
            </p>
          </div>
        </div>

        {/* Print & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPdfModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Cetak PDF Laporan</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel (CSV)</span>
          </button>

          <button
            onClick={handleCopyWASummary}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            {copiedWASummary ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedWASummary ? 'Tersalin!' : 'Bagikan WA'}</span>
          </button>
        </div>
      </div>

      {/* Filter Controls (Hidden in Print) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Class Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Pilih Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Wali: {c.waliKelas})
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Pilih Bulan
            </label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Info Summary */}
          <div className="flex items-center justify-end">
            <div className="text-right">
              <p className="text-xs text-slate-500">Total Sesi Terhitung</p>
              <p className="text-base font-extrabold text-blue-600">
                {filteredSessions.length} Sesi Terdaftar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Cards (Hidden in Print) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        {/* Pie Chart Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
            <span>Persentase Kehadiran ({monthFilter})</span>
          </h3>

          {pieData.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada data presensi pada bulan ini.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Distribusi Presensi Siswa</span>
          </h3>

          {barChartData.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada data grafik yang dapat ditampilkan.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Hadir" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Izin" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sakit" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Alpa" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Main Print-Ready Attendance Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Rekapitulasi Kehadiran Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Bulan: {monthFilter} | Total Siswa: {filteredStudents.length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Murid</th>
                <th className="py-3 px-4 text-center">JK</th>
                <th className="py-3 px-4 text-center text-emerald-700">Hadir</th>
                <th className="py-3 px-4 text-center text-sky-700">Izin</th>
                <th className="py-3 px-4 text-center text-amber-700">Sakit</th>
                <th className="py-3 px-4 text-center text-rose-700">Alpa</th>
                <th className="py-3 px-4 text-center">% Presensi</th>
                <th className="py-3 px-4 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {studentStats.map((st, idx) => (
                <tr key={st.student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 text-xs">{st.student.nisn || st.student.nis}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{st.student.name}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-600">
                    {st.student.gender}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">{st.hadir}</td>
                  <td className="py-3 px-4 text-center font-bold text-sky-600">{st.izin}</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-600">{st.sakit}</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600">{st.alpa}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                        st.rate >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.rate >= 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {st.rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditStudent(st.student)}
                      className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      title={`Edit Data Murid ${st.student.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Kelola Sesi Absensi ({filteredSessions.length} Sesi Terfilter)
            </h3>
            <p className="text-xs text-slate-500">
              Ubah rincian status atau hapus sesi absensi langsung dari laporan
            </p>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            Tidak ada sesi absensi pada filter kelas & bulan ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {filteredSessions.map((sess) => {
              const cls = classes.find((c) => c.id === sess.classId);
              const hadirCount = sess.entries.filter((e) => e.status === 'HADIR').length;
              return (
                <div
                  key={sess.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{sess.date}</p>
                        <span className="text-[11px] font-mono text-slate-400">• {sess.time} WIB</span>
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {cls?.name || 'Kelas'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sess.subject || 'Presensi'} — {hadirCount}/{sess.entries.length} Siswa Hadir (Dicatat oleh: {sess.recordedBy})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSession(sess)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Sesi</span>
                    </button>

                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus sesi tanggal ${sess.date}?`)) {
                            onDeleteSession(sess.id);
                          }
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Sesi Absensi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran / Sesi</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dicatat Oleh</label>
                  <input
                    type="text"
                    required
                    value={editRecordedBy}
                    onChange={(e) => setEditRecordedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Student entries list */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-700">Daftar Kehadiran Siswa</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editEntries.map((entry) => {
                    const student = students.find((s) => s.id === entry.studentId);
                    return (
                      <div
                        key={entry.studentId}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-bold text-slate-800 truncate max-w-[120px]">
                          {student?.name || 'Siswa'}
                        </span>

                        <div className="flex items-center gap-1">
                          {(['HADIR', 'SAKIT', 'IZIN', 'ALPA'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateEntryStatus(entry.studentId, st)}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                entry.status === st
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleDeleteEntryFromEdit(entry.studentId)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                            title="Hapus baris siswa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Sesi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
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

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NISN *</label>
                <input
                  type="text"
                  required
                  value={editStudentNisn}
                  onChange={(e) => setEditStudentNisn(e.target.value)}
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

      {/* PDF PRINT PREVIEW & CONFIGURATION MODAL */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-auto print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none">
            {/* Modal Controls Bar (Hidden on Print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Pratinjau & Cetak PDF Laporan Presensi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur Atribut Kop Dokumen, NIP, & Lembar Tanda Tangan Sebelum Dicetak
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Customization Controls (Hidden on Print) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs print:hidden">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kota & Tanggal Cetak</label>
                <input
                  type="text"
                  value={cityAndDate}
                  onChange={(e) => setCityAndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={headmasterName}
                  onChange={(e) => setHeadmasterName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={headmasterNip}
                  onChange={(e) => setHeadmasterNip(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* PRINTABLE PDF DOCUMENT PAPER PREVIEW */}
            <div className="p-6 sm:p-8 bg-white border border-slate-300 rounded-2xl shadow-xs text-slate-900 font-sans leading-normal print:p-0 print:border-none print:shadow-none print:m-0">
              {/* Kop Surat Official Header */}
              <div className="text-center border-b-4 border-double border-slate-900 pb-3 mb-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  DINAS PENDIDIKAN & KEBUDAYAAN
                </h4>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight my-0.5">
                  {schoolName}
                </h2>
                <p className="text-[11px] text-slate-600 font-medium">
                  Alamat: Jl. Kamboja No. 1, Denpasar, Bali • Telp: (0361) 222333 • Email: info@{schoolName.toLowerCase().replace(/\s+/g, '')}.sch.id
                </p>
              </div>

              {/* Document Title */}
              <div className="text-center mb-5">
                <h3 className="text-base font-extrabold uppercase underline tracking-wide text-slate-900">
                  LAPORAN REKAPITULASI PRESENSI KEHADIRAN SISWA
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Bulan: {monthFilter} | Tahun Ajaran: {academicYear}
                </p>
              </div>

              {/* Document Metadata Table */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                <div>
                  <p><strong>Kelas:</strong> {currentClassName}</p>
                  <p className="mt-0.5"><strong>Wali Kelas:</strong> {currentWaliKelas}</p>
                </div>
                <div className="text-right">
                  <p><strong>Total Siswa:</strong> {filteredStudents.length} Orang</p>
                  <p className="mt-0.5"><strong>Total Sesi Absensi:</strong> {filteredSessions.length} Pertemuan</p>
                </div>
              </div>

              {/* Matrix Attendance Table */}
              <table className="w-full text-xs text-left border-collapse border border-slate-900 mb-5">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold text-slate-900">
                    <th className="py-2 px-1.5 border border-slate-900 w-8">NO</th>
                    <th className="py-2 px-2 border border-slate-900 w-28">NISN / NIS</th>
                    <th className="py-2 px-2 border border-slate-900 text-left">NAMA LENGKAP SISWA</th>
                    <th className="py-2 px-1.5 border border-slate-900 w-10">L/P</th>
                    <th className="py-2 px-1.5 border border-slate-900 w-12 text-emerald-800">HADIR</th>
                    <th className="py-2 px-1.5 border border-slate-900 w-12 text-sky-800">IZIN</th>
                    <th className="py-2 px-1.5 border border-slate-900 w-12 text-amber-800">SAKIT</th>
                    <th className="py-2 px-1.5 border border-slate-900 w-12 text-rose-800">ALPA</th>
                    <th className="py-2 px-2 border border-slate-900 w-20">% PRESENSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {studentStats.map((st, idx) => (
                    <tr key={st.student.id} className="border-b border-slate-800">
                      <td className="py-1.5 px-1.5 border border-slate-800 text-center font-semibold">{idx + 1}</td>
                      <td className="py-1.5 px-2 border border-slate-800 text-center font-mono">{st.student.nisn || st.student.nis}</td>
                      <td className="py-1.5 px-2 border border-slate-800 font-bold text-slate-900">{st.student.name}</td>
                      <td className="py-1.5 px-1.5 border border-slate-800 text-center font-bold">{st.student.gender}</td>
                      <td className="py-1.5 px-1.5 border border-slate-800 text-center font-bold">{st.hadir}</td>
                      <td className="py-1.5 px-1.5 border border-slate-800 text-center font-bold">{st.izin}</td>
                      <td className="py-1.5 px-1.5 border border-slate-800 text-center font-bold">{st.sakit}</td>
                      <td className="py-1.5 px-1.5 border border-slate-800 text-center font-bold">{st.alpa}</td>
                      <td className="py-1.5 px-2 border border-slate-800 text-center font-extrabold">{st.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Stats */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs mb-6 flex flex-wrap items-center justify-around font-bold gap-2">
                <span>Total Kehadiran: {totalHadir} Sesi</span>
                <span>Total Izin: {totalIzin} Sesi</span>
                <span>Total Sakit: {totalSakit} Sesi</span>
                <span>Total Alpa: {totalAlpa} Sesi</span>
              </div>

              {/* Official Signature Block */}
              <div className="pt-4 grid grid-cols-2 text-center text-xs text-slate-900 gap-8">
                <div>
                  <p className="font-semibold mb-1">Mengetahui,</p>
                  <p className="font-bold">Kepala Sekolah</p>
                  <div className="h-16"></div>
                  <p className="font-extrabold underline">{headmasterName}</p>
                  <p className="font-mono text-[11px] text-slate-700">{headmasterNip}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">{cityAndDate}</p>
                  <p className="font-bold">Wali Kelas {currentClassName}</p>
                  <div className="h-16"></div>
                  <p className="font-extrabold underline">{currentWaliKelas}</p>
                  <p className="font-mono text-[11px] text-slate-700">NIP. 19850212 201001 2 015</p>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions (Hidden on Print) */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4 print:hidden">
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
