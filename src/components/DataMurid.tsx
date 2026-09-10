import React, { useState, useRef } from 'react';
import { Student, ClassGroup, UserProfile } from '../types';
import { SaveSuccessModal } from './SaveSuccessModal';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Plus,
  CheckCircle2,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Camera,
  Image as ImageIcon,
  User,
  GraduationCap,
  Save,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataMuridProps {
  students: Student[];
  classes: ClassGroup[];
  onAddStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteStudentsByClass?: (classId: string) => void;
  onAddClass: (classGroup: ClassGroup) => void;
  onEditClass?: (classGroup: ClassGroup) => void;
  onDeleteClass?: (classId: string) => void;
  onBulkAddStudents?: (students: Student[], createdClasses?: ClassGroup[]) => void;
  currentUser?: UserProfile;
}

export const DataMurid: React.FC<DataMuridProps> = ({
  students,
  classes,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onDeleteStudentsByClass,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onBulkAddStudents,
  currentUser,
}) => {
  const isStudent = currentUser?.userType === 'SISWA';

  // Find the logged-in student record
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const studentPhotoInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Download Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nama Lengkap': 'Andi Saputra',
        'NISN': '0081234567',
        'Jenis Kelamin (L/P)': 'L',
        'Kelas': 'Kelas 7A',
        'Nama Orang Tua': 'Bapak Saputra',
        'No HP Orang Tua': '628123456789'
      },
      {
        'Nama Lengkap': 'Siti Aminah',
        'NISN': '0081234568',
        'Jenis Kelamin (L/P)': 'P',
        'Kelas': 'Kelas 7A',
        'Nama Orang Tua': 'Ibu Aminah',
        'No HP Orang Tua': '628198765432'
      },
      {
        'Nama Lengkap': 'Budi Santoso',
        'NISN': '0081234569',
        'Jenis Kelamin (L/P)': 'L',
        'Kelas': 'Kelas 7B',
        'Nama Orang Tua': 'Bapak Santoso',
        'No HP Orang Tua': '628134567890'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 20 },
      { wch: 15 },
      { wch: 22 },
      { wch: 20 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Murid');
    XLSX.writeFile(workbook, 'Template_Import_Data_Murid.xlsx');
  };

  // Upload & Process Excel/CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          alert('File Excel kosong atau tidak terbaca!');
          return;
        }

        const newStudents: Student[] = [];
        const newClassesMap: Record<string, ClassGroup> = {};

        json.forEach((row, idx) => {
          const rawName = row['Nama Lengkap'] || row['Nama'] || row['NAMA'] || row['Nama Murid'] || '';
          if (!rawName || String(rawName).trim() === '') return;

          const name = String(rawName).trim();
          const nisn = String(row['NISN'] || row['Nisn'] || row['nisn'] || row['NIS'] || `008${1000000 + idx}`).trim();
          const nis = nisn;

          const rawJk = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['JK'] || row['Gender'] || 'L').toUpperCase();
          const gender: 'L' | 'P' = rawJk.includes('P') || rawJk.includes('PEREMPUAN') ? 'P' : 'L';

          const rawClassName = String(row['Kelas'] || row['Nama Kelas'] || row['KELAS'] || 'Kelas 7A').trim();

          let matchedClass = classes.find((c) => c.name.toLowerCase() === rawClassName.toLowerCase())
                             || newClassesMap[rawClassName.toLowerCase()];

          if (!matchedClass) {
            const newClassObj: ClassGroup = {
              id: `c-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: rawClassName,
              gradeLevel: rawClassName.match(/\d+/)?.[0] || '7',
              waliKelas: 'Guru Pengampu',
            };
            newClassesMap[rawClassName.toLowerCase()] = newClassObj;
            matchedClass = newClassObj;
          }

          const parentName = String(row['Nama Orang Tua'] || row['Nama Orangtua'] || row['Orang Tua'] || row['Ortu'] || 'Orang Tua').trim();
          let parentPhone = String(row['No HP Orang Tua'] || row['No HP'] || row['No WA'] || row['Telepon'] || '628123456789').replace(/[^0-9]/g, '');
          if (parentPhone.startsWith('0')) {
            parentPhone = '62' + parentPhone.substring(1);
          }

          newStudents.push({
            id: `s-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            name,
            nis,
            nisn,
            gender,
            classId: matchedClass.id,
            parentName,
            parentPhone: parentPhone || '628123456789',
          });
        });

        if (newStudents.length === 0) {
          alert('Format file Excel tidak terdeteksi. Pastikan menggunakan nama kolom yang benar atau unduh template yang disediakan.');
          return;
        }

        const createdClasses = Object.values(newClassesMap);
        if (onBulkAddStudents) {
          onBulkAddStudents(newStudents, createdClasses);
        }

        setImportStatusMsg(
          `Berhasil mengimpor ${newStudents.length} murid${
            createdClasses.length > 0 ? ` dan membuat ${createdClasses.length} kelas baru (${createdClasses.map((c) => c.name).join(', ')})` : ''
          }!`
        );

        setTimeout(() => setImportStatusMsg(null), 6000);
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat membaca file. Pastikan format file .xlsx, .xls, atau .csv');
      }
    };
    reader.readAsBinaryString(file);

    if (e.target) e.target.value = '';
  };

  // Student Form State
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('628123456789');

  // Class Form State
  const [classNameInput, setClassNameInput] = useState('');
  const [gradeLevelInput, setGradeLevelInput] = useState('7');
  const [waliKelasInput, setWaliKelasInput] = useState('');

  // Open Add Student Modal
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setName('');
    setNisn(`008${Math.floor(1000000 + Math.random() * 9000000)}`);
    setGender('L');
    setClassId(classes[0]?.id || '');
    setParentName('');
    setParentPhone('628123456789');
    setShowStudentModal(true);
  };

  // Open Edit Student Modal
  const handleOpenEditStudent = (st: Student) => {
    setEditingStudent(st);
    setName(st.name);
    setNisn(st.nisn || st.nis);
    setGender(st.gender);
    setClassId(st.classId);
    setParentName(st.parentName);
    setParentPhone(st.parentPhone);
    setShowStudentModal(true);
  };

  // Save Student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nisn.trim()) return;

    const cleanNisn = nisn.trim();

    if (editingStudent) {
      onEditStudent({
        ...editingStudent,
        name: name.trim(),
        nis: cleanNisn,
        nisn: cleanNisn,
        gender,
        classId,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
      });
    } else {
      const newStudent: Student = {
        id: `s-${Date.now()}`,
        name: name.trim(),
        nis: cleanNisn,
        nisn: cleanNisn,
        gender,
        classId,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
      };
      onAddStudent(newStudent);
    }

    setSaveSuccessMsg('Data murid berhasil disimpan!');
    setShowStudentModal(false);
  };

  // Open Edit Class Modal
  const handleOpenEditClass = (c: ClassGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClass(c);
    setClassNameInput(c.name);
    setGradeLevelInput(c.gradeLevel || '7');
    setWaliKelasInput(c.waliKelas || '');
    setShowClassModal(true);
  };

  // Open Add Class Modal
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassNameInput('');
    setGradeLevelInput('7');
    setWaliKelasInput('');
    setShowClassModal(true);
  };

  // Save Class (Add or Edit)
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    if (editingClass && onEditClass) {
      onEditClass({
        ...editingClass,
        name: classNameInput.trim(),
        gradeLevel: gradeLevelInput,
        waliKelas: waliKelasInput.trim() || 'Guru Pengampu',
      });
    } else {
      const newClass: ClassGroup = {
        id: `c-${Date.now()}`,
        name: classNameInput.trim(),
        gradeLevel: gradeLevelInput,
        waliKelas: waliKelasInput.trim() || 'Guru Pengampu',
      };
      onAddClass(newClass);
    }

    setClassNameInput('');
    setWaliKelasInput('');
    setEditingClass(null);
    setShowClassModal(false);
    setSaveSuccessMsg('Data kelas berhasil disimpan!');
  };

  // Student photo upload & reset handlers
  const handleStudentPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !studentSelf) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG/PNG/WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onEditStudent({
        ...studentSelf,
        avatarUrl: base64,
        isCustomPhoto: true,
      });
      setSaveSuccessMsg('Foto profil Anda berhasil diganti!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleStudentDeletePhoto = () => {
    if (!studentSelf) return;
    const defaultAvatar =
      studentSelf.gender === 'P'
        ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80';

    onEditStudent({
      ...studentSelf,
      avatarUrl: defaultAvatar,
      isCustomPhoto: false,
    });
    setSaveSuccessMsg('Foto profil Anda telah dihapus dan direset ke avatar default.');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // STUDENT PERSONAL BIODATA VIEW
  if (isStudent && studentSelf) {
    const classObj = classes.find((c) => c.id === studentSelf.classId);
    const studentAvatar =
      studentSelf.avatarUrl ||
      (studentSelf.gender === 'P'
        ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80');

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Hidden File Input for Student Photo */}
        <input
          type="file"
          ref={studentPhotoInputRef}
          onChange={handleStudentPhotoUpload}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Biodata Murid Saya
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Data identitas siswa terdaftar di sekolah.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenEditStudent(studentSelf)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Biodata</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold shadow-xs animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Main Biodata Card with Photo Action */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          {/* Photo Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6 text-center sm:text-left">
            <div className="relative group shrink-0">
              <img
                src={studentAvatar}
                alt={studentSelf.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-50 shadow-md"
              />
              <button
                type="button"
                onClick={() => studentPhotoInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition-transform active:scale-95"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-lg">
                  {classObj?.name || 'Kelas 7A'}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg">
                  NISN: {studentSelf.nisn || studentSelf.nis}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {studentSelf.name}
              </h2>
              <p className="text-xs text-slate-500">
                Wali Kelas: <span className="font-semibold text-slate-700">{classObj?.waliKelas || 'Guru Wali'}</span>
              </p>

              {/* Photo Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => studentPhotoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Upload Foto Sendiri</span>
                </button>

                {studentSelf.isCustomPhoto && (
                  <button
                    type="button"
                    onClick={handleStudentDeletePhoto}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Nama Lengkap
              </span>
              <p className="font-extrabold text-slate-900">{studentSelf.name}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Nomor Induk Siswa Nasional (NISN)
              </span>
              <p className="font-mono font-extrabold text-slate-900">{studentSelf.nisn || studentSelf.nis}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Jenis Kelamin
              </span>
              <p className="font-bold text-slate-900">
                {studentSelf.gender === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Kelas & Tingkat
              </span>
              <p className="font-bold text-slate-900">
                {classObj?.name || 'Kelas'} (Tingkat {classObj?.gradeLevel || '7'})
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Nama Orang Tua / Wali
              </span>
              <p className="font-bold text-slate-900">{studentSelf.parentName || '-'}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                No. WhatsApp Orang Tua
              </span>
              <p className="font-mono font-bold text-slate-900">{studentSelf.parentPhone || '-'}</p>
            </div>
          </div>
        </div>

        {/* Edit Student Modal for student */}
        {showStudentModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900">Edit Biodata Saya</h3>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NISN (Nomor Induk Siswa Nasional) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Orang Tua / Wali *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp Orang Tua (Format: 628xxx) *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowStudentModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Filter Students for Teacher / Admin
  const filteredStudents = students.filter((s) => {
    if (selectedClassId !== 'ALL' && s.classId !== selectedClassId) return false;
    const query = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      (s.nisn && s.nisn.includes(query)) ||
      (s.nis && s.nis.includes(query)) ||
      s.parentName.toLowerCase().includes(query)
    );
  });

  // Batch delete selected students
  const handleBatchDeleteStudents = () => {
    if (selectedStudentIds.length === 0) return;
    if (confirm(`Hapus ${selectedStudentIds.length} murid terpilih secara permanen?`)) {
      selectedStudentIds.forEach((id) => onDeleteStudent(id));
      setSelectedStudentIds([]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Data Murid & Kelas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola data seluruh murid, upload Excel masal, dan atur wali kelas.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
            title="Unduh format template Excel data murid"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Unduh Template Excel</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel / CSV</span>
          </button>

          <button
            onClick={() => setShowClassModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Tambah Kelas</span>
          </button>

          <button
            onClick={handleOpenAddStudent}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Success Banner Alert for Excel Import */}
      {importStatusMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{importStatusMsg}</span>
          </div>
          <button
            onClick={() => setImportStatusMsg(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Excel Upload Info Box */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 p-4 rounded-3xl border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Impor Data Murid Sekaligus via Excel / CSV
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Format kolom yang didukung: <span className="font-semibold text-emerald-800">Nama Lengkap, NISN, Jenis Kelamin (L/P), Kelas, Nama Orang Tua, No HP Orang Tua</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Format Template (.xlsx)</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pilih File Excel</span>
          </button>
        </div>
      </div>

      {/* Class List Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Daftar Kelas ({classes.length})
          </h3>
          <button
            type="button"
            onClick={handleOpenAddClass}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kelas</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {classes.map((c) => {
            const studentCount = students.filter((s) => s.classId === c.id).length;
            const isSelected = selectedClassId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 group relative ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400/20 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-indigo-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 text-sm">{c.name}</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-bold">
                      {studentCount} Murid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">Wali: {c.waliKelas}</p>
                </div>

                {/* Class Edit & Delete Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Tingkat {c.gradeLevel || '7'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditClass(c, e)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Kelas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteClass && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Hapus ${c.name}? Peringatan: Seluruh murid di kelas ini juga akan ikut terhapus.`
                            )
                          ) {
                            onDeleteClass(c.id);
                            if (selectedClassId === c.id) setSelectedClassId('ALL');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Kelas"
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
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedClassId('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedClassId === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kelas ({students.length})
          </button>

          {selectedClassId !== 'ALL' && onDeleteStudentsByClass && (
            <button
              onClick={() => {
                const targetClassName = classes.find((c) => c.id === selectedClassId)?.name || 'kelas ini';
                if (confirm(`Hapus semua murid di ${targetClassName}?`)) {
                  onDeleteStudentsByClass(selectedClassId);
                  setSelectedStudentIds([]);
                }
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus Semua Murid di Kelas Ini</span>
            </button>
          )}

          {selectedStudentIds.length > 0 && (
            <button
              onClick={handleBatchDeleteStudents}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer animate-fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus {selectedStudentIds.length} Murid Terpilih</span>
            </button>
          )}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NISN, atau orang tua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      selectedStudentIds.length === filteredStudents.length
                    }
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    title="Pilih Semua"
                  />
                </th>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Murid</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Orang Tua / Wali</th>
                <th className="py-3 px-4 text-center">Aksi WA</th>
                <th className="py-3 px-4 text-center">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredStudents.map((student, idx) => {
                const classObj = classes.find((c) => c.id === student.classId);
                const isChecked = selectedStudentIds.includes(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isChecked ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelectStudent(student.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>

                    {/* Student Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                            student.gender === 'L'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[10px] text-slate-500">
                            JK: {student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* NISN */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-xs">
                        {student.nisn || student.nis}
                      </span>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {classObj?.name || 'Unassigned'}
                    </td>

                    {/* Parent Info */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{student.parentName}</p>
                      <p className="text-[10px] text-slate-500">WA: {student.parentPhone}</p>
                    </td>

                    {/* Quick WA Action */}
                    <td className="py-3 px-4 text-center">
                      <a
                        href={`https://wa.me/${student.parentPhone}?text=${encodeURIComponent(
                          `Yth. Bapak/Ibu ${student.parentName}, wali murid dari ${student.name} (${classObj?.name || 'Sekolah'}).`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kirim WA</span>
                      </a>
                    </td>

                    {/* Manage Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditStudent(student)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Edit Data Murid"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus murid ${student.name}?`)) {
                              onDeleteStudent(student.id);
                              setSelectedStudentIds((prev) => prev.filter((i) => i !== student.id));
                            }
                          }}
                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Murid"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingStudent ? 'Edit Data Murid' : 'Tambah Murid Baru'}
              </h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Murid *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Pratama"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Induk Siswa Nasional (NISN) *
                </label>
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  placeholder="Contoh: 0081234567 (10 Digit Angka)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  NISN 10 digit digunakan siswa untuk login ke portal presensi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Orang Tua / Wali *
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Contoh: Joko Pratama"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. WhatsApp Orang Tua (Format: 628xxx)
                </label>
                <input
                  type="text"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="628123456789"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowClassModal(false);
                  setEditingClass(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  required
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="Contoh: Kelas 8B"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkat Kelas
                </label>
                <select
                  value={gradeLevelInput}
                  onChange={(e) => setGradeLevelInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="7">Tingkat 7 (VII)</option>
                  <option value="8">Tingkat 8 (VIII)</option>
                  <option value="9">Tingkat 9 (IX)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Wali Kelas
                </label>
                <input
                  type="text"
                  value={waliKelasInput}
                  onChange={(e) => setWaliKelasInput(e.target.value)}
                  placeholder="Contoh: Ahmad Yani, S.Pd."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowClassModal(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingClass ? 'Simpan Perubahan' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      <SaveSuccessModal
        isOpen={!!saveSuccessMsg}
        message={saveSuccessMsg || 'Data berhasil disimpan!'}
        onClose={() => setSaveSuccessMsg(null)}
      />
    </div>
  );
};
