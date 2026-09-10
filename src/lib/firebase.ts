import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Student,
  ClassGroup,
  AttendanceSession,
  NotificationItem,
  UserProfile
} from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Firestore Collection References
export const studentsCol = collection(db, 'students');
export const classesCol = collection(db, 'classes');
export const sessionsCol = collection(db, 'sessions');
export const notificationsCol = collection(db, 'notifications');
export const settingsCol = collection(db, 'settings');

// Real-time synchronization listeners
export function subscribeStudents(callback: (data: Student[]) => void) {
  return onSnapshot(studentsCol, (snapshot) => {
    const items: Student[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Student);
    });
    callback(items);
  }, (error) => {
    console.warn('Students Firestore snapshot error:', error);
  });
}

export function subscribeClasses(callback: (data: ClassGroup[]) => void) {
  return onSnapshot(classesCol, (snapshot) => {
    const items: ClassGroup[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as ClassGroup);
    });
    callback(items);
  }, (error) => {
    console.warn('Classes Firestore snapshot error:', error);
  });
}

export function subscribeSessions(callback: (data: AttendanceSession[]) => void) {
  return onSnapshot(sessionsCol, (snapshot) => {
    const items: AttendanceSession[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as AttendanceSession);
    });
    // Sort by date/time descending
    items.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
    callback(items);
  }, (error) => {
    console.warn('Sessions Firestore snapshot error:', error);
  });
}

export function subscribeNotifications(callback: (data: NotificationItem[]) => void) {
  return onSnapshot(notificationsCol, (snapshot) => {
    const items: NotificationItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
    });
    items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    callback(items);
  }, (error) => {
    console.warn('Notifications Firestore snapshot error:', error);
  });
}

export function subscribeSchoolSettings(callback: (schoolName: string) => void) {
  const schoolDoc = doc(db, 'settings', 'school_info');
  return onSnapshot(schoolDoc, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.schoolName) {
        callback(data.schoolName);
      }
    }
  }, (error) => {
    console.warn('School info snapshot error:', error);
  });
}

// Single item / Batch save helpers
export async function saveStudentToCloud(student: Student) {
  try {
    await setDoc(doc(db, 'students', student.id), student);
  } catch (e) {
    console.error('Error saving student to cloud:', e);
  }
}

export async function deleteStudentFromCloud(studentId: string) {
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (e) {
    console.error('Error deleting student from cloud:', e);
  }
}

export async function saveBulkStudentsToCloud(students: Student[], classesToAdd?: ClassGroup[]) {
  try {
    const batch = writeBatch(db);
    students.forEach((s) => {
      const sRef = doc(db, 'students', s.id);
      batch.set(sRef, s);
    });
    if (classesToAdd && classesToAdd.length > 0) {
      classesToAdd.forEach((c) => {
        const cRef = doc(db, 'classes', c.id);
        batch.set(cRef, c);
      });
    }
    await batch.commit();
  } catch (e) {
    console.error('Error saving bulk students to cloud:', e);
  }
}

export async function saveClassToCloud(cls: ClassGroup) {
  try {
    await setDoc(doc(db, 'classes', cls.id), cls);
  } catch (e) {
    console.error('Error saving class to cloud:', e);
  }
}

export async function deleteClassFromCloud(classId: string) {
  try {
    await deleteDoc(doc(db, 'classes', classId));
  } catch (e) {
    console.error('Error deleting class from cloud:', e);
  }
}

export async function saveSessionToCloud(session: AttendanceSession) {
  try {
    await setDoc(doc(db, 'sessions', session.id), session);
  } catch (e) {
    console.error('Error saving session to cloud:', e);
  }
}

export async function deleteSessionFromCloud(sessionId: string) {
  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
  } catch (e) {
    console.error('Error deleting session from cloud:', e);
  }
}

export async function saveNotificationToCloud(notif: NotificationItem) {
  try {
    await setDoc(doc(db, 'notifications', notif.id), notif);
  } catch (e) {
    console.error('Error saving notification to cloud:', e);
  }
}

export async function saveSchoolNameToCloud(name: string) {
  try {
    await setDoc(doc(db, 'settings', 'school_info'), { schoolName: name, updatedAt: Date.now() });
  } catch (e) {
    console.error('Error saving school name to cloud:', e);
  }
}

// Initial Seeding Helper - If Firestore is empty, seed initial data once
export async function seedInitialDataIfEmpty(
  initialClasses: ClassGroup[],
  initialStudents: Student[],
  initialSessions: AttendanceSession[],
  initialNotifications: NotificationItem[]
) {
  try {
    const studentsSnap = await getDocs(studentsCol);
    if (studentsSnap.empty) {
      console.log('Seeding initial data to Firestore cloud...');
      const batch = writeBatch(db);

      initialClasses.forEach((c) => {
        batch.set(doc(db, 'classes', c.id), c);
      });

      initialStudents.forEach((s) => {
        batch.set(doc(db, 'students', s.id), s);
      });

      initialSessions.forEach((sess) => {
        batch.set(doc(db, 'sessions', sess.id), sess);
      });

      initialNotifications.forEach((n) => {
        batch.set(doc(db, 'notifications', n.id), n);
      });

      batch.set(doc(db, 'settings', 'school_info'), {
        schoolName: 'SMP Negeri 1 Indonesia',
        updatedAt: Date.now()
      });

      await batch.commit();
      console.log('Firestore initial seeding completed successfully!');
    }
  } catch (e) {
    console.error('Error seeding initial data:', e);
  }
}
