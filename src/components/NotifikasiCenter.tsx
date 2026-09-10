import React, { useState } from 'react';
import { NotificationItem, Student, ClassGroup, AttendanceStatus } from '../types';
import { Bell, AlertTriangle, CheckCircle2, Info, UserX, MessageSquare, ExternalLink, CheckCheck, Trash2 } from 'lucide-react';

interface NotifikasiCenterProps {
  notifications: NotificationItem[];
  students: Student[];
  classes: ClassGroup[];
  onMarkAllRead: () => void;
  onToggleNotifRead?: (notifId: string) => void;
  onDeleteNotification?: (notifId: string) => void;
  onClearNotifications: () => void;
  onOpenParentWA?: (student: Student, status: AttendanceStatus, note?: string) => void;
}

export const NotifikasiCenter: React.FC<NotifikasiCenterProps> = ({
  notifications,
  students,
  classes,
  onMarkAllRead,
  onToggleNotifRead,
  onDeleteNotification,
  onClearNotifications,
  onOpenParentWA,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pusat Notifikasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Dapatkan peringatan kehadiran secara real-time dan kirim info ke orang tua.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-slate-600" />
            <span>Tandai Semua Dibaca</span>
          </button>

          <button
            onClick={onClearNotifications}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'DANGER', 'WARNING', 'SUCCESS', 'INFO'].map((type) => {
          const count = notifications.filter((n) => (type === 'ALL' ? true : n.type === type))
            .length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {type === 'ALL' && `Semua (${count})`}
              {type === 'DANGER' && `Peringatan Alpa (${count})`}
              {type === 'WARNING' && `Siswa Sakit/Izin (${count})`}
              {type === 'SUCCESS' && `Absensi Sukses (${count})`}
              {type === 'INFO' && `Sistem (${count})`}
            </button>
          );
        })}
      </div>

      {/* Notifications Feed */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">Tidak ada notifikasi saat ini</p>
          <p className="text-xs text-slate-500 mt-1">
            Seluruh catatan presensi siswa telah diperbarui dengan rapi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => {
            const student = notif.studentId
              ? students.find((s) => s.id === notif.studentId)
              : null;
            const classObj = notif.classId ? classes.find((c) => c.id === notif.classId) : null;

            const iconMap = {
              DANGER: <UserX className="w-5 h-5 text-rose-600" />,
              WARNING: <AlertTriangle className="w-5 h-5 text-amber-600" />,
              SUCCESS: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
              INFO: <Info className="w-5 h-5 text-teal-600" />,
            };

            const bgMap = {
              DANGER: 'bg-rose-50/50 border-rose-200',
              WARNING: 'bg-amber-50/50 border-amber-200',
              SUCCESS: 'bg-emerald-50/50 border-emerald-200',
              INFO: 'bg-teal-50/50 border-teal-200',
            };

            const timeFormatted = new Date(notif.timestamp).toLocaleString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl border ${
                  bgMap[notif.type]
                } transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-white rounded-xl shadow-2xs shrink-0 mt-0.5">
                    {iconMap[notif.type]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">{notif.title}</h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                      {timeFormatted} {classObj ? `| ${classObj.name}` : ''}
                    </p>
                  </div>
                </div>

                {/* Direct Actions (WA, Mark Read/Unread, Delete) */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {student && onOpenParentWA && (
                    <button
                      onClick={() => onOpenParentWA(student, 'ALPA', notif.message)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Kirim WA</span>
                    </button>
                  )}

                  {onToggleNotifRead && (
                    <button
                      onClick={() => onToggleNotifRead(notif.id)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      title={notif.read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                    >
                      {notif.read ? 'Belum Dibaca' : 'Sudah Dibaca'}
                    </button>
                  )}

                  {onDeleteNotification && (
                    <button
                      onClick={() => onDeleteNotification(notif.id)}
                      className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="Hapus Notifikasi"
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
  );
};
