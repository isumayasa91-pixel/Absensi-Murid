import React, { useState, useEffect } from 'react';
import { NavbarHeader } from './components/NavbarHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { AbsensiMudah } from './components/AbsensiMudah';
import { RiwayatAbsensi } from './components/RiwayatAbsensi';
import { LaporanLengkap } from './components/LaporanLengkap';
import { DataMurid } from './components/DataMurid';
import { NotifikasiCenter } from './components/NotifikasiCenter';
import { KeamananData } from './components/KeamananData';
import { ProfilView } from './components/ProfilView';
import { BottomNav } from './components/BottomNav';
import { LoginView } from './components/LoginView';
import { ParentWAModal } from './components/ParentWAModal';

import {
  Student,
  ClassGroup,
  AttendanceSession,
  NotificationItem,
  ActiveTab,
  AttendanceStatus,
  UserProfile,
  UserType,
} from './types';

import {
  initialClasses,
  initialStudents,
  initialSessions,
  initialNotifications,
} from './data/initialData';

import {
  subscribeStudents,
  subscribeClasses,
  subscribeSessions,
  subscribeNotifications,
  subscribeSchoolSettings,
  saveStudentToCloud,
  deleteStudentFromCloud,
  saveBulkStudentsToCloud,
  saveClassToCloud,
  deleteClassFromCloud,
  saveSessionToCloud,
  deleteSessionFromCloud,
  saveNotificationToCloud,
  saveSchoolNameToCloud,
  seedInitialDataIfEmpty,
} from './lib/firebase';

import { AppLogo } from './components/AppLogo';
import { ShieldCheck, Heart, CloudCheck } from 'lucide-react';

export default function App() {
  // Load initial or persisted state from LocalStorage & Cloud
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem('absensi_classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('absensi_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem('absensi_sessions');
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('absensi_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [schoolName, setSchoolName] = useState<string>(() => {
    const saved = localStorage.getItem('absensi_school_name');
    if (saved && saved.trim()) return saved.trim();
    const savedProfile = localStorage.getItem('absensi_user_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.schoolName && parsed.schoolName.trim()) return parsed.schoolName.trim();
      } catch (e) {}
    }
    return 'SMP Negeri 1 Indonesia';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const defaultSchool = localStorage.getItem('absensi_school_name') || 'SMP Negeri 1 Indonesia';
    const saved = localStorage.getItem('absensi_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          schoolName: parsed.schoolName || defaultSchool,
        };
      } catch (e) {}
    }
    return {
      name: 'Bu Sugiarti, S.Pd.',
      email: 'sugiarti@sekolah.id',
      role: 'Guru / Wali Kelas 7A',
      userType: 'GURU' as UserType,
      schoolName: defaultSchool,
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('absensi_is_logged_in') === 'true';
  });

  // Real-time Firestore Cloud Subscription & Seeding
  useEffect(() => {
    // Seed default data if database is brand new
    seedInitialDataIfEmpty(initialClasses, initialStudents, initialSessions, initialNotifications);

    // Subscribe to Firestore live collections for cross-device sync
    const unsubStudents = subscribeStudents((data) => {
      if (data && data.length > 0) setStudents(data);
    });

    const unsubClasses = subscribeClasses((data) => {
      if (data && data.length > 0) setClasses(data);
    });

    const unsubSessions = subscribeSessions((data) => {
      if (data) setSessions(data);
    });

    const unsubNotifs = subscribeNotifications((data) => {
      if (data) setNotifications(data);
    });

    const unsubSchool = subscribeSchoolSettings((name) => {
      if (name && name.trim()) {
        setSchoolName(name.trim());
        setUserProfile((prev) => ({ ...prev, schoolName: name.trim() }));
      }
    });

    return () => {
      unsubStudents();
      unsubClasses();
      unsubSessions();
      unsubNotifs();
      unsubSchool();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('absensi_school_name', schoolName);
  }, [schoolName]);

  useEffect(() => {
    localStorage.setItem('absensi_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('absensi_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  const handleUpdateSchoolName = (newName: string) => {
    const clean = newName.trim();
    if (!clean) return;
    setSchoolName(clean);
    localStorage.setItem('absensi_school_name', clean);
    setUserProfile((prev) => ({
      ...prev,
      schoolName: clean,
    }));
    saveSchoolNameToCloud(clean);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    const finalUser = {
      ...user,
      schoolName: user.schoolName || schoolName,
    };
    setUserProfile(finalUser);
    if (finalUser.schoolName) {
      setSchoolName(finalUser.schoolName);
      localStorage.setItem('absensi_school_name', finalUser.schoolName);
      saveSchoolNameToCloud(finalUser.schoolName);
    }
    setIsLoggedIn(true);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('absensi_is_logged_in');
  };

  // Parent WA Modal State
  const [waModalStudent, setWaModalStudent] = useState<Student | null>(null);
  const [waModalStatus, setWaModalStatus] = useState<AttendanceStatus>('ALPA');
  const [waModalNote, setWaModalNote] = useState<string>('');

  // Persist state updates to LocalStorage
  useEffect(() => {
    localStorage.setItem('absensi_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('absensi_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('absensi_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('absensi_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save new attendance session
  const handleSaveSession = (newSession: AttendanceSession) => {
    setSessions((prev) => [newSession, ...prev]);
    saveSessionToCloud(newSession);

    // Check if any student was marked ALPA or SAKIT to auto-generate notification
    const classObj = classes.find((c) => c.id === newSession.classId);
    const alpaCount = newSession.entries.filter((e) => e.status === 'ALPA').length;
    const sakitCount = newSession.entries.filter((e) => e.status === 'SAKIT').length;

    const newNotifItems: NotificationItem[] = [];

    if (alpaCount > 0) {
      const item: NotificationItem = {
        id: `notif-${Date.now()}-1`,
        title: 'Siswa Alpa Terdeteksi',
        message: `Terdapat ${alpaCount} siswa Alpa di ${classObj?.name || 'Kelas'} pada ${newSession.date}. Sebaiknya kirim peringatan ke orang tua.`,
        type: 'DANGER',
        timestamp: Date.now(),
        read: false,
        classId: newSession.classId,
      };
      newNotifItems.push(item);
      saveNotificationToCloud(item);
    }

    if (sakitCount > 0) {
      const item: NotificationItem = {
        id: `notif-${Date.now()}-2`,
        title: 'Siswa Sakit Dicatat',
        message: `Terdapat ${sakitCount} siswa Sakit di ${classObj?.name || 'Kelas'}.`,
        type: 'WARNING',
        timestamp: Date.now(),
        read: false,
        classId: newSession.classId,
      };
      newNotifItems.push(item);
      saveNotificationToCloud(item);
    }

    const savedItem: NotificationItem = {
      id: `notif-${Date.now()}-3`,
      title: 'Absensi Tersimpan',
      message: `Absensi ${classObj?.name || 'Kelas'} tanggal ${newSession.date} berhasil disimpan.`,
      type: 'SUCCESS',
      timestamp: Date.now(),
      read: false,
      classId: newSession.classId,
    };
    newNotifItems.push(savedItem);
    saveNotificationToCloud(savedItem);

    setNotifications((prev) => [...newNotifItems, ...prev]);
  };

  // Attendance Session CRUD
  const handleEditSession = (updatedSession: AttendanceSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    saveSessionToCloud(updatedSession);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    deleteSessionFromCloud(sessionId);
  };

  // Student CRUD
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    saveStudentToCloud(newStudent);
  };

  const handleBulkAddStudents = (importedStudents: Student[], importedClasses?: ClassGroup[]) => {
    let classesToSave: ClassGroup[] = [];
    if (importedClasses && importedClasses.length > 0) {
      setClasses((prev) => {
        const existingNames = new Set(prev.map((c) => c.name.toLowerCase()));
        classesToSave = importedClasses.filter((c) => !existingNames.has(c.name.toLowerCase()));
        return [...prev, ...classesToSave];
      });
    }
    setStudents((prev) => [...importedStudents, ...prev]);
    saveBulkStudentsToCloud(importedStudents, classesToSave);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    saveStudentToCloud(updatedStudent);

    // If student is logged in and updates their own record, sync userProfile
    if (
      userProfile.userType === 'SISWA' &&
      ((userProfile.studentId && userProfile.studentId === updatedStudent.id) ||
        (userProfile.nipOrNisn && userProfile.nipOrNisn === updatedStudent.nisn) ||
        (userProfile.nis && userProfile.nis === updatedStudent.nis) ||
        userProfile.name.toLowerCase() === updatedStudent.name.toLowerCase())
    ) {
      setUserProfile((prev) => ({
        ...prev,
        name: updatedStudent.name,
        nipOrNisn: updatedStudent.nisn || prev.nipOrNisn,
        nis: updatedStudent.nis || prev.nis,
        gender: updatedStudent.gender,
        avatarUrl: updatedStudent.avatarUrl,
        parentName: updatedStudent.parentName,
        parentPhone: updatedStudent.parentPhone,
        isCustomPhoto: updatedStudent.isCustomPhoto,
      }));
    }
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    if (updated.schoolName && updated.schoolName.trim()) {
      const cleanSchool = updated.schoolName.trim();
      setSchoolName(cleanSchool);
      localStorage.setItem('absensi_school_name', cleanSchool);
      saveSchoolNameToCloud(cleanSchool);
    }
    setUserProfile(updated);
    if (updated.userType === 'SISWA') {
      setStudents((prev) =>
        prev.map((s) => {
          if (
            (updated.studentId && s.id === updated.studentId) ||
            (updated.nipOrNisn && s.nisn === updated.nipOrNisn) ||
            (updated.nis && s.nis === updated.nis) ||
            s.name.toLowerCase() === updated.name.toLowerCase()
          ) {
            const updatedS = {
              ...s,
              name: updated.name,
              avatarUrl: updated.avatarUrl,
              gender: updated.gender || s.gender,
              parentName: updated.parentName || s.parentName,
              parentPhone: updated.parentPhone || s.parentPhone,
              isCustomPhoto: updated.isCustomPhoto,
            };
            saveStudentToCloud(updatedS);
            return updatedS;
          }
          return s;
        })
      );
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    deleteStudentFromCloud(studentId);
  };

  const handleDeleteStudentsByClass = (classId: string) => {
    const toDelete = students.filter((s) => s.classId === classId);
    toDelete.forEach((s) => deleteStudentFromCloud(s.id));
    setStudents((prev) => prev.filter((s) => s.classId !== classId));
  };

  // Class CRUD
  const handleAddClass = (newClass: ClassGroup) => {
    setClasses((prev) => [...prev, newClass]);
    saveClassToCloud(newClass);
  };

  const handleEditClass = (updatedClass: ClassGroup) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
    saveClassToCloud(updatedClass);
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    deleteClassFromCloud(classId);

    // Also remove students in that deleted class
    const toDelete = students.filter((s) => s.classId === classId);
    toDelete.forEach((s) => deleteStudentFromCloud(s.id));
    setStudents((prev) => prev.filter((s) => s.classId !== classId));
  };

  // Notification actions
  const handleMarkAllNotifRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleNotifRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: !n.read } : n))
    );
  };

  const handleDeleteNotification = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Restore and Reset
  const handleRestoreData = (data: {
    students: Student[];
    classes: ClassGroup[];
    sessions: AttendanceSession[];
    notifications: NotificationItem[];
  }) => {
    setStudents(data.students);
    setClasses(data.classes);
    setSessions(data.sessions);
    setNotifications(data.notifications || []);
  };

  const handleResetDemoData = () => {
    setStudents(initialStudents);
    setClasses(initialClasses);
    setSessions(initialSessions);
    setNotifications(initialNotifications);
    localStorage.clear();
  };

  // Open Parent WA Modal
  const handleOpenParentWA = (
    student: Student,
    status: AttendanceStatus,
    note?: string
  ) => {
    setWaModalStudent(student);
    setWaModalStatus(status);
    setWaModalNote(note || '');
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  if (!isLoggedIn) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        students={students}
        classes={classes}
        schoolName={schoolName}
        onUpdateSchoolName={handleUpdateSchoolName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar Header */}
      <NavbarHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotifCount={unreadNotifCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalStudents={students.length}
        userProfile={userProfile}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-8">
        {activeTab === 'home' && (
          <DashboardOverview
            setActiveTab={setActiveTab}
            students={students}
            classes={classes}
            sessions={sessions}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'absensi' && (
          <AbsensiMudah
            students={students}
            classes={classes}
            onSaveSession={handleSaveSession}
            onOpenParentWA={handleOpenParentWA}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            currentUser={userProfile}
          />
        )}

        {activeTab === 'riwayat' && (
          <RiwayatAbsensi
            sessions={sessions}
            classes={classes}
            students={students}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            onOpenParentWA={handleOpenParentWA}
            currentUser={userProfile}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanLengkap
            sessions={sessions}
            classes={classes}
            students={students}
            schoolName={schoolName}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {activeTab === 'murid' && (
          <DataMurid
            students={students}
            classes={classes}
            onAddStudent={handleAddStudent}
            onBulkAddStudents={handleBulkAddStudents}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onDeleteStudentsByClass={handleDeleteStudentsByClass}
            onAddClass={handleAddClass}
            onEditClass={handleEditClass}
            onDeleteClass={handleDeleteClass}
            currentUser={userProfile}
          />
        )}

        {activeTab === 'notifikasi' && (
          <NotifikasiCenter
            notifications={notifications}
            students={students}
            classes={classes}
            onMarkAllRead={handleMarkAllNotifRead}
            onToggleNotifRead={handleToggleNotifRead}
            onDeleteNotification={handleDeleteNotification}
            onClearNotifications={handleClearNotifications}
            onOpenParentWA={handleOpenParentWA}
          />
        )}

        {activeTab === 'keamanan' && (
          <KeamananData
            students={students}
            classes={classes}
            sessions={sessions}
            notifications={notifications}
            onRestoreData={handleRestoreData}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {activeTab === 'profil' && (
          <ProfilView
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
      />

      {/* WhatsApp Modal */}
      {waModalStudent && (
        <ParentWAModal
          student={waModalStudent}
          status={waModalStatus}
          initialNote={waModalNote}
          className={classes.find((c) => c.id === waModalStudent.classId)?.name}
          schoolName={schoolName}
          onClose={() => setWaModalStudent(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" showLabel={false} />
            <div>
              <p className="font-bold text-slate-800">Absensi Murid Sekolah</p>
              <p className="text-[11px] text-slate-400">
                Pencatatan Kehadiran, Laporan & Notifikasi Real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistem Tersimpan Aman & Terlindungi di Cloud</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
