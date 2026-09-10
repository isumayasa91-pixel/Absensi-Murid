import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import {
  Settings,
  Lock,
  Info,
  LogOut,
  ChevronRight,
  User,
  CheckCircle2,
  X,
  Key,
  Building,
  Mail,
  ShieldCheck,
  Edit2,
  Camera,
  Trash2,
  Upload,
  Phone,
  GraduationCap
} from 'lucide-react';

interface ProfilViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout?: () => void;
}

export const ProfilView: React.FC<ProfilViewProps> = ({
  userProfile,
  onUpdateProfile,
  onLogout,
}) => {
  // Modal states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editRole, setEditRole] = useState(userProfile.role);
  const [editSchool, setEditSchool] = useState(userProfile.schoolName);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatarUrl || '');
  const [editParentName, setEditParentName] = useState(userProfile.parentName || '');
  const [editParentPhone, setEditParentPhone] = useState(userProfile.parentPhone || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setEditName(userProfile.name);
    setEditEmail(userProfile.email);
    setEditRole(userProfile.role);
    setEditSchool(userProfile.schoolName);
    setEditAvatar(userProfile.avatarUrl || '');
    setEditParentName(userProfile.parentName || '');
    setEditParentPhone(userProfile.parentPhone || '');
  }, [userProfile]);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const isStudent = userProfile.userType === 'SISWA';

  // Fallback default avatar
  const defaultFallbackAvatar = isStudent
    ? userProfile.gender === 'P'
      ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
      : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
    : userProfile.userType === 'ADMIN'
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80';

  // Preset Avatar Photos
  const presetPhotos = isStudent
    ? [
        { label: 'Siswa 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
        { label: 'Siswa 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
        { label: 'Siswi 1', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
        { label: 'Siswi 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80' },
      ]
    : [
        { label: 'Guru Wanita', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80' },
        { label: 'Guru Pria', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80' },
        { label: 'Admin', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
        { label: 'Siswa', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80' },
      ];

  // Open Edit Profile
  const handleOpenEdit = () => {
    setEditName(userProfile.name);
    setEditEmail(userProfile.email);
    setEditRole(userProfile.role);
    setEditSchool(userProfile.schoolName);
    setEditAvatar(userProfile.avatarUrl || defaultFallbackAvatar);
    setEditParentName(userProfile.parentName || '');
    setEditParentPhone(userProfile.parentPhone || '');
    setShowAccountModal(true);
  };

  // Upload Photo handler (Convert to Base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar (JPG/PNG/WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (isModal) {
        setEditAvatar(base64Url);
      } else {
        onUpdateProfile({
          ...userProfile,
          avatarUrl: base64Url,
          isCustomPhoto: true,
        });
        setSaveSuccessMsg('Foto profil baru berhasil disimpan!');
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete / Remove Photo handler
  const handleDeletePhoto = (isModal = false) => {
    if (confirm('Hapus foto profil dan kembalikan ke avatar default?')) {
      if (isModal) {
        setEditAvatar(defaultFallbackAvatar);
      } else {
        onUpdateProfile({
          ...userProfile,
          avatarUrl: defaultFallbackAvatar,
          isCustomPhoto: false,
        });
        setSaveSuccessMsg('Foto profil telah dihapus dan direset ke default.');
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    }
  };

  // Save Edit Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      name: editName,
      email: editEmail,
      role: editRole,
      schoolName: editSchool,
      avatarUrl: editAvatar,
      isCustomPhoto: editAvatar !== defaultFallbackAvatar,
      parentName: editParentName,
      parentPhone: editParentPhone,
    });
    setShowAccountModal(false);
    setSaveSuccessMsg('Profil berhasil diperbarui!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Save Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi kata sandi tidak cocok!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Kata sandi minimal 6 karakter!');
      return;
    }

    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaveSuccessMsg('Kata sandi berhasil diperbarui!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const currentAvatar = userProfile.avatarUrl || defaultFallbackAvatar;

  return (
    <div className="max-w-md mx-auto space-y-5 pb-20">
      {/* Hidden file input for direct photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handlePhotoUpload(e, false)}
        accept="image/*"
        className="hidden"
      />

      {/* Blue Mobile Top Bar */}
      <div className="bg-blue-600 -mx-4 -mt-6 sm:mx-0 sm:mt-0 sm:rounded-3xl p-6 text-white text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700/30 backdrop-blur-3xs" />
        <div className="relative z-10">
          <h1 className="text-xl font-extrabold tracking-tight">Profil</h1>
          <p className="text-xs text-blue-100 mt-0.5">
            {isStudent ? 'Profil & Biodata Siswa' : 'Pengaturan Akun & Aplikasi'}
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="cursor-pointer">
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Profile Card Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col items-center text-center space-y-4">
        {/* Avatar with Quick Upload and Delete Options */}
        <div className="relative group">
          <div className="w-28 h-28 rounded-3xl bg-indigo-50 ring-4 ring-indigo-100/70 flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src={currentAvatar}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-transform active:scale-90 cursor-pointer"
              title="Ganti Foto Profil dari Perangkat"
            >
              <Camera className="w-4 h-4" />
            </button>
            {userProfile.avatarUrl && (
              <button
                type="button"
                onClick={() => handleDeletePhoto(false)}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-transform active:scale-90 cursor-pointer"
                title="Hapus / Reset Foto Profil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Name & Email */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {userProfile.name}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {userProfile.email}
          </p>
        </div>

        {/* Role Pill Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-xs border border-blue-100">
            {userProfile.role}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-full text-xs">
            {isStudent ? 'Siswa Aktif' : userProfile.userType === 'ADMIN' ? 'Administrator' : 'Guru'}
          </span>
          {userProfile.nipOrNisn && (
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full text-xs border border-indigo-100">
              NISN: {userProfile.nipOrNisn}
            </span>
          )}
        </div>

        {/* Photo Action Buttons under Avatar */}
        <div className="pt-2 flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ganti Foto Sendiri</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeletePhoto(false)}
            className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Hapus Foto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Foto</span>
          </button>
        </div>

        {/* Student-specific Details Preview Card */}
        {isStudent && (
          <div className="w-full bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 text-left space-y-2 text-xs">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Biodata Murid
            </p>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Kelas:</span>
                <span className="font-bold text-slate-800">{userProfile.className || 'Kelas 7A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">NISN:</span>
                <span className="font-bold text-slate-800">{userProfile.nipOrNisn || '-'}</span>
              </div>
              {userProfile.parentName && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Orang Tua:</span>
                  <span className="font-semibold text-slate-800">{userProfile.parentName}</span>
                </div>
              )}
              {userProfile.parentPhone && (
                <div>
                  <span className="text-slate-400 block text-[10px]">No. WhatsApp:</span>
                  <span className="font-semibold text-slate-800">+{userProfile.parentPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* List Options Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {/* 1. Pengaturan Akun & Biodata */}
        <div
          onClick={handleOpenEdit}
          className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              {isStudent ? 'Ubah Biodata & Kontak' : 'Pengaturan Akun'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        </div>

        {/* 2. Ubah Password */}
        <div
          onClick={() => setShowPasswordModal(true)}
          className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Ubah Password</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        </div>

        {/* 3. Tentang Aplikasi */}
        <div
          onClick={() => setShowAboutModal(true)}
          className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Info className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Tentang Aplikasi</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        </div>

        {/* 4. Keluar */}
        <div
          onClick={() => setShowLogoutModal(true)}
          className="p-4 flex items-center justify-between hover:bg-rose-50/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-rose-600">Keluar</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400 group-hover:text-rose-600" />
        </div>
      </div>

      {/* Modal 1: Pengaturan Akun & Foto */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isStudent ? 'Edit Biodata Siswa' : 'Pengaturan Akun'}
                </h3>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Upload & Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Foto Profil Anda
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={editAvatar || defaultFallbackAvatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-200 shadow-xs"
                  />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      onChange={(e) => handlePhotoUpload(e, true)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5 justify-center border border-indigo-200 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Foto dari HP / Laptop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(true)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 justify-center border border-rose-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus & Reset Foto</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mb-1.5">Atau pilih avatar:</p>
                <div className="grid grid-cols-4 gap-2">
                  {presetPhotos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(p.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                        editAvatar === p.url
                          ? 'border-blue-600 ring-2 ring-blue-100 scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              {isStudent ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nama Orang Tua / Wali
                    </label>
                    <input
                      type="text"
                      value={editParentName}
                      onChange={(e) => setEditParentName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                      placeholder="Contoh: Bapak Joko Pratama"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nomor WhatsApp Orang Tua
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editParentPhone}
                        onChange={(e) => setEditParentPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                        placeholder="Contoh: 6281234567801"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Jabatan / Peran
                  </label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                    placeholder="Guru / Wali Kelas"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Sekolah
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Ubah Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Ubah Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kata Sandi Lama
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Perbarui Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Tentang Aplikasi */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 animate-scale-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/30">
              <Info className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Absensi Murid Sekolah
              </h3>
              <p className="text-xs text-blue-600 font-bold mt-0.5">Versi 2.5.0 (Mobile Ready)</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
              Aplikasi absensi digital modern dengan fitur rekapitulasi otomatis, integrasi laporan Excel, kirim pesan WhatsApp ke orang tua, dan pencatatan presensi yang cepat & responsif di semua perangkat HP & Desktop.
            </p>

            <div className="text-left space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span>Status Sistem:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terhubung Cloud
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pengampu Sekolah:</span>
                <span className="font-bold text-slate-800">{userProfile.schoolName}</span>
              </div>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer mt-2"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal 4: Konfirmasi Keluar */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        title="Yakin keluar?"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          if (onLogout) onLogout();
        }}
      />
    </div>
  );
};
