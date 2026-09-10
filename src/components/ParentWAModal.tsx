import React, { useState } from 'react';
import { Student, AttendanceStatus } from '../types';
import { MessageSquare, X, Send, Copy, Check, ExternalLink, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';

interface ParentWAModalProps {
  student: Student;
  status: AttendanceStatus;
  initialNote?: string;
  className?: string;
  schoolName?: string;
  time?: string;
  onClose: () => void;
}

export const ParentWAModal: React.FC<ParentWAModalProps> = ({
  student,
  status,
  initialNote = '',
  className = '',
  schoolName = 'SMP Negeri 1 Denpasar',
  time,
  onClose,
}) => {
  const [note, setNote] = useState(initialNote);
  const [activity, setActivity] = useState(
    status === 'HADIR'
      ? 'Telah tiba di sekolah & aktif mengikuti kegiatan belajar mengajar (KBM)'
      : ''
  );
  const [copied, setCopied] = useState(false);

  const formatWhatsAppNumber = (phone?: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const cleanPhone = formatWhatsAppNumber(student.parentPhone);

  const statusLabel =
    status === 'SAKIT'
      ? 'Sakit'
      : status === 'IZIN'
      ? 'Izin'
      : status === 'ALPA'
      ? 'Alpa / Tanpa Keterangan'
      : 'Hadir di Sekolah';

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const currentTimeStr = time || new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const messageText = status === 'HADIR'
    ? `*NOTIFIKASI KEHADIRAN SISWA - ${schoolName.toUpperCase()}* 🏫
━━━━━━━━━━━━━━━━━━━━
Yth. Bapak/Ibu *${student.parentName || 'Orang Tua / Wali'}*,

Menginformasikan bahwa ananda tercinta telah *HADIR DI SEKOLAH*:

👤 *Nama Siswa:* ${student.name}
🆔 *NISN / NIS:* ${student.nisn || student.nis || '-'}
${className ? `🏫 *Kelas:* ${className}\n` : ''}📅 *Hari, Tanggal:* ${todayStr}
⏰ *Waktu Absen:* ${currentTimeStr} WIB
✅ *Status Presensi:* *HADIR DI SEKOLAH*
🎯 *Aktivitas Siswa:* ${activity || 'Telah tiba dengan selamat & sedang mengikuti kegiatan belajar mengajar (KBM) dengan tertib.'}
${note ? `📝 *Catatan Guru:* ${note}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
Pesan ini dikirimkan secara langsung dari sistem absensi digital *${schoolName}*. Terima kasih atas bimbingan Bapak/Ibu di rumah.

_Salam hangat,_
*Wali Kelas & Manajemen Sekolah*`
    : `*PEMBERITAHUAN KETIDAKHADIRAN SISWA - ${schoolName.toUpperCase()}* ⚠️
━━━━━━━━━━━━━━━━━━━━
Yth. Bapak/Ibu *${student.parentName || 'Orang Tua / Wali'}*,

Menginformasikan status absensi ananda di sekolah hari ini:

👤 *Nama Siswa:* ${student.name}
🆔 *NISN / NIS:* ${student.nisn || student.nis || '-'}
${className ? `🏫 *Kelas:* ${className}\n` : ''}📅 *Hari, Tanggal:* ${todayStr}
⚠️ *Status Kehadiran:* *${statusLabel.toUpperCase()}*
${note ? `📝 *Keterangan / Alasan:* ${note}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
Mohon konfirmasi atau informasi surat izin/keterangan dari Bapak/Ibu melalui balasan pesan WhatsApp ini. Terima kasih atas kerja samanya.

_Salam hangat,_
*Wali Kelas & Manajemen Sekolah*`;

  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
    : `https://wa.me/?text=${encodeURIComponent(messageText)}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const activityPresets = [
    'Telah tiba di sekolah & aktif mengikuti KBM di kelas',
    'Mengikuti kegiatan Upacara Bendera / Apel Pagi bersama',
    'Mengikuti Ujian / Penilaian Harian / Praktikum Lab',
    'Mengikuti kegiatan Ekstrakurikuler & Pembinaan Bakat',
    'Telah menyelesaikan seluruh KBM & bersiap pulang',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-up max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Kirim Notifikasi Absen via WhatsApp
              </h3>
              <p className="text-[11px] text-slate-400">
                Pemberitahuan instan langsung ke nomor orang tua siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Recipient Details */}
          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <p className="font-extrabold text-slate-900">
                Penerima: {student.parentName || 'Orang Tua'} (Wali dari {student.name})
              </p>
              <p className="text-emerald-800 font-mono font-bold mt-0.5">
                No. WhatsApp: {student.parentPhone ? `+${cleanPhone}` : 'Belum diisi'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                  status === 'HADIR'
                    ? 'bg-emerald-600 text-white'
                    : status === 'IZIN'
                    ? 'bg-sky-600 text-white'
                    : status === 'SAKIT'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                Status: {statusLabel}
              </span>
            </div>
          </div>

          {/* Activity Presets (if Hadir) */}
          {status === 'HADIR' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Aktivitas Anak di Sekolah:</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {activityPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setActivity(preset)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-left transition-all cursor-pointer ${
                      activity === preset
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Tulis aktivitas kustom anak..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
          )}

          {/* Custom Note Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Khusus dari Guru (Opsional):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Datang tepat waktu / Sangat aktif saat presentasi"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          {/* Text Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Format Pesan WhatsApp yang Akan Terkirim:
            </label>
            <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {messageText}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleCopyText}
            type="button"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim WhatsApp ke Orang Tua</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};

