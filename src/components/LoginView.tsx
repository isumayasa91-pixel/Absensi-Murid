import React, { useState } from 'react';
import { UserProfile, Student, ClassGroup } from '../types';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  GraduationCap,
  AlertCircle,
  Building,
  Edit2,
  Check,
  X
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  students?: Student[];
  classes?: ClassGroup[];
  schoolName?: string;
  onUpdateSchoolName?: (name: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  students = [],
  classes = [],
  schoolName = 'SMP Negeri 1 Indonesia',
  onUpdateSchoolName,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Edit School Name Modal state from Login
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [tempSchoolName, setTempSchoolName] = useState(schoolName);
  const [schoolUpdateSuccess, setSchoolUpdateSuccess] = useState(false);

  const handleSaveSchoolName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempSchoolName.trim();
    if (!clean) return;
    if (onUpdateSchoolName) {
      onUpdateSchoolName(clean);
    }
    setIsEditingSchool(false);
    setSchoolUpdateSuccess(true);
    setTimeout(() => setSchoolUpdateSuccess(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMsg('Silakan masukkan Username Anda');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg('Silakan masukkan Password Anda');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const lowerUser = cleanUsername.toLowerCase();
      const lowerPass = cleanPassword.toLowerCase();

      // 1. Administrator Login
      if (lowerUser === 'administrator' || lowerUser === 'admin') {
        if (lowerPass !== 'administrator' && lowerPass !== 'admin') {
          setErrorMsg('Password Administrator salah. Masukkan "administrator".');
          return;
        }

        onLoginSuccess({
          name: 'Administrator Sekolah',
          email: 'administrator@sekolah.id',
          role: 'Administrator / Pengelola Data Murid',
          userType: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          nipOrNisn: 'ADMIN-001',
          className: 'Semua Kelas',
          schoolName: schoolName,
        });
        return;
      }

      // 2. Check if username matches a student NISN or NIS or Student Name (Siswa)
      const matchedStudent = students.find(
        (s) =>
          s.nisn.toLowerCase() === lowerUser ||
          s.nis.toLowerCase() === lowerUser ||
          s.name.toLowerCase() === lowerUser ||
          lowerUser.includes(s.name.toLowerCase())
      ) || (lowerUser.startsWith('siswa') ? students[0] : null) || (
        /^\d{8,12}$/.test(cleanUsername) && !cleanUsername.startsWith('19') ? students[0] : null
      );

      if (matchedStudent) {
        let studentClassName = 'Kelas 7A';
        const cls = classes.find((c) => c.id === matchedStudent.classId);
        if (cls) studentClassName = cls.name;

        const isFemale = matchedStudent.gender === 'P';
        const fallbackAvatar = isFemale
          ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80';

        onLoginSuccess({
          name: matchedStudent.name,
          email: `${matchedStudent.nisn}@siswa.sekolah.id`,
          role: `Siswa ${studentClassName}`,
          userType: 'SISWA',
          avatarUrl: matchedStudent.avatarUrl || fallbackAvatar,
          isCustomPhoto: matchedStudent.isCustomPhoto,
          nipOrNisn: matchedStudent.nisn,
          studentId: matchedStudent.id,
          nis: matchedStudent.nis,
          gender: matchedStudent.gender,
          className: studentClassName.replace('Kelas ', ''),
          schoolName: schoolName,
          parentName: matchedStudent.parentName,
          parentPhone: matchedStudent.parentPhone,
        });
      } else {
        // Teacher (Guru) Login
        const isSumayasa =
          lowerUser.includes('sumayasa') ||
          lowerUser.includes('guru.smp.belajar.id') ||
          lowerUser === 'isumayasa91';
        const isPakAhmad =
          lowerUser.includes('7b') ||
          lowerUser.includes('ahmad') ||
          cleanUsername === '198207152008021001';

        let teacherName = 'Bu Sugiarti, S.Pd.';
        let teacherRole = 'Guru / Wali Kelas 7A';
        let teacherAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80';
        let teacherNip = '198503122010012003';
        let teacherClass = '7A';

        if (isSumayasa) {
          teacherName = 'I Sumayasa, S.Pd.';
          teacherRole = 'Guru / Wali Kelas';
          teacherAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80';
          teacherNip = '199105202019031005';
        } else if (isPakAhmad) {
          teacherName = 'Pak Ahmad, M.Pd.';
          teacherRole = 'Guru / Wali Kelas 7B';
          teacherAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80';
          teacherNip = '198207152008021001';
          teacherClass = '7B';
        }

        onLoginSuccess({
          name: teacherName,
          email: cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@sekolah.id`,
          role: teacherRole,
          userType: 'GURU',
          avatarUrl: teacherAvatar,
          nipOrNisn: teacherNip,
          className: teacherClass,
          schoolName: schoolName,
        });
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 relative z-10 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>

          {/* School Name Badge & Quick Edit */}
          <div className="flex flex-col items-center gap-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-blue-700 text-xs font-bold shadow-2xs max-w-full">
              <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate" title={schoolName}>
                {schoolName}
              </span>
              <button
                type="button"
                onClick={() => {
                  setTempSchoolName(schoolName);
                  setIsEditingSchool(true);
                }}
                className="p-0.5 hover:text-blue-900 text-blue-500 transition-colors cursor-pointer"
                title="Ganti Nama Sekolah"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            {schoolUpdateSuccess && (
              <span className="text-[10px] text-emerald-600 font-bold animate-fade-in">
                ✓ Nama sekolah diperbarui!
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal Login
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Aplikasi Presensi Murid Digital
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-rose-700 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form: Hanya Username & Password & Tombol Masuk */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username / NISN
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan Username / NISN"
                className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label="Tampilkan password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] font-medium text-slate-400">
            {schoolName} &copy; 2026
          </p>
        </div>
      </div>

      {/* Quick Modal: Edit School Name from Login Screen */}
      {isEditingSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Ubah Nama Sekolah
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSchool(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchoolName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Satuan Pendidikan / Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={tempSchoolName}
                  onChange={(e) => setTempSchoolName(e.target.value)}
                  placeholder="Contoh: SMP Negeri 1 Denpasar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Nama ini akan tersinkronisasi langsung ke menu login, profil akun, dan seluruh halaman laporan.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSchool(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
