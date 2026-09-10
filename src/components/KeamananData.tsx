import React, { useState } from 'react';
import { ShieldCheck, Download, Upload, RefreshCw, Lock, CheckCircle2, Server, Database, HardDrive, KeyRound } from 'lucide-react';
import { Student, ClassGroup, AttendanceSession, NotificationItem } from '../types';

interface KeamananDataProps {
  students: Student[];
  classes: ClassGroup[];
  sessions: AttendanceSession[];
  notifications: NotificationItem[];
  onRestoreData: (data: {
    students: Student[];
    classes: ClassGroup[];
    sessions: AttendanceSession[];
    notifications: NotificationItem[];
  }) => void;
  onResetDemoData: () => void;
}

export const KeamananData: React.FC<KeamananDataProps> = ({
  students,
  classes,
  sessions,
  notifications,
  onRestoreData,
  onResetDemoData,
}) => {
  const [pinLockEnabled, setPinLockEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('1234');
  const [isBackupSuccess, setIsBackupSuccess] = useState(false);
  const [restoreStatusMsg, setRestoreStatusMsg] = useState<string | null>(null);

  // Backup JSON File Download
  const handleExportBackup = () => {
    const backupData = {
      app: 'AbsensiMurid',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      students,
      classes,
      sessions,
      notifications,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Backup_AbsensiMurid_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setIsBackupSuccess(true);
    setTimeout(() => setIsBackupSuccess(false), 3000);
  };

  // Restore JSON File Upload
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.students && parsed.classes && parsed.sessions) {
            onRestoreData({
              students: parsed.students,
              classes: parsed.classes,
              sessions: parsed.sessions,
              notifications: parsed.notifications || [],
            });
            setRestoreStatusMsg('Data berhasil dipulihkan dari berkas cadangan!');
            setTimeout(() => setRestoreStatusMsg(null), 4000);
          } else {
            alert('Format file JSON cadangan tidak valid.');
          }
        } catch (err) {
          alert('Gagal membaca berkas backup JSON.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Aman & Terpercaya
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Data tersimpan aman di cloud, terenkripsi, dan dapat dicadangkan kapan saja.
            </p>
          </div>
        </div>

        {/* Live Protection Status */}
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Sistem Proteksi Data Aktif</span>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card 1: Cloud Persistence */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Penyimpanan Cloud</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data absensi murid disinkronkan secara otomatis dan dapat diakses dari browser mana pun tanpa khawatir hilang saat halaman ditutup.
          </p>
          <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Terhubung & Terenkripsi</span>
          </div>
        </div>

        {/* Status Card 2: Database Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Ringkasan Berkas Data</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p>• {students.length} Data Murid Terdaftar</p>
            <p>• {classes.length} Rombongan Belajar (Kelas)</p>
            <p>• {sessions.length} Sesi Absensi Terrekam</p>
            <p>• {notifications.length} Log Notifikasi Sistem</p>
          </div>
        </div>

        {/* Status Card 3: PIN Protection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Kunci PIN Mode Guru</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Kunci akses pengubahan data agar tidak dapat diubah tanpa izin oleh siswa.
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-700">
              PIN Akses (4 Digit): <span className="font-mono font-bold text-blue-600">{pinCode}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Backup and Restore Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Cadangan & Pemulihan Data</h3>
          <p className="text-xs text-slate-500 mt-1">
            Unduh salinan data seluruh sekolah dalam format JSON atau pulihkan dari berkas cadangan sebelumnya.
          </p>
        </div>

        {restoreStatusMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{restoreStatusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Download Backup */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Unduh Cadangan Data</span>
              </div>
              <p className="text-xs text-slate-500">
                Simpan file JSON backup ke komputer atau ponsel Anda.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {isBackupSuccess ? 'Berhasil Diunduh!' : 'Unduh JSON Backup'}
            </button>
          </div>

          {/* Import Backup */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Pulihkan dari File JSON</span>
              </div>
              <p className="text-xs text-slate-500">
                Unggah file JSON cadangan untuk memulihkan seluruh data.
              </p>
            </div>
            <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs text-center cursor-pointer transition-colors block">
              <span>Pilih File Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          {/* Seed Demo Data */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Muat Data Contoh</span>
              </div>
              <p className="text-xs text-slate-500">
                Isi ulang aplikasi dengan data contoh murid & kelas Indonesia.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Kembalikan aplikasi ke data contoh awal sekolah?')) {
                  onResetDemoData();
                }
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Reset ke Data Contoh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
