// Firebase SDK Configuration & Services Integration
// Dual-mode: Cloud Firebase when credentials present, localStorage fallback otherwise

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  enableIndexedDbPersistence,
  writeBatch
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let app = null;
let db = null;
let auth = null;
export let isFirebaseConnected = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseConnected = true;
    // Enable offline persistence
    enableIndexedDbPersistence(db).catch(() => {});
    console.log('⚡ Firebase connected — RAVS Smart School');
  } else {
    console.info('ℹ️ Firebase offline mode (add credentials to .env to enable cloud sync)');
  }
} catch (err) {
  console.warn('Firebase init error:', err.message);
}

export { app, db, auth };

// ─── Status ──────────────────────────────────────────────────────────────────
export const getBackendStatus = () => ({
  status: isFirebaseConnected ? 'CLOUD' : 'LOCAL',
  label: isFirebaseConnected ? '☁️ Firebase Live' : '💾 Local Storage',
  lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
});

// ─── Generic helpers ──────────────────────────────────────────────────────────
const col = (path) => collection(db, path);
const docRef = (path, id) => doc(db, path, id);

// ─── 1. NOTICES ──────────────────────────────────────────────────────────────
export const addNoticeToCloud = async (notice) => {
  if (!isFirebaseConnected) return { success: false, mode: 'local' };
  try {
    const ref = await addDoc(col('notices'), { ...notice, createdAt: serverTimestamp() });
    return { success: true, id: ref.id };
  } catch (e) { console.error('Notice sync:', e); return { success: false }; }
};

export const listenToNotices = (callback) => {
  if (!isFirebaseConnected) return () => {};
  const q = query(col('notices'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const deleteNoticeFromCloud = async (id) => {
  if (!isFirebaseConnected) return;
  try { await deleteDoc(docRef('notices', id)); } catch (e) { console.error(e); }
};

// ─── 2. TEACHER ATTENDANCE (Gate Check-In) ───────────────────────────────────
export const syncAttendanceToCloud = async (record) => {
  if (!isFirebaseConnected) return { success: false, mode: 'local' };
  try {
    const id = record.id || `log_${Date.now()}`;
    await setDoc(docRef('teacher_attendance', id), { ...record, savedAt: serverTimestamp() }, { merge: true });
    return { success: true, id };
  } catch (e) { console.error('Attendance sync:', e); return { success: false }; }
};

export const listenToTeacherAttendance = (callback) => {
  if (!isFirebaseConnected) return () => {};
  const q = query(col('teacher_attendance'), orderBy('savedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── 3. CLASS NOTES ───────────────────────────────────────────────────────────
export const syncNotesToCloud = async (note) => {
  if (!isFirebaseConnected) return { success: false, mode: 'local' };
  try {
    const id = note.id || `cn_${Date.now()}`;
    await setDoc(docRef('class_notes', id), { ...note, createdAt: serverTimestamp() }, { merge: true });
    return { success: true, id };
  } catch (e) { console.error('Note sync:', e); return { success: false }; }
};

export const listenToClassNotes = (classId, callback) => {
  if (!isFirebaseConnected) return () => {};
  const q = query(
    col('class_notes'),
    where('targetClassId', 'in', [classId, 'ALL']),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── 4. FACULTY CHAT ──────────────────────────────────────────────────────────
export const sendFacultyChatMessage = async (channelId = 'general', message) => {
  if (!isFirebaseConnected) return { success: false, mode: 'local' };
  try {
    const ref = await addDoc(col(`faculty_channels/${channelId}/messages`), {
      ...message,
      timestamp: serverTimestamp()
    });
    return { success: true, id: ref.id };
  } catch (e) { console.error('Faculty chat sync:', e); return { success: false }; }
};

export const listenToFacultyChat = (channelId = 'general', callback) => {
  if (!isFirebaseConnected) return () => {};
  const q = query(col(`faculty_channels/${channelId}/messages`), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── 5. BUS GPS LOCATION ─────────────────────────────────────────────────────
export const updateBusLocationInCloud = async (busId, coords, driverInfo = {}) => {
  if (!isFirebaseConnected) return;
  try {
    await setDoc(docRef('bus_locations', busId), {
      busId,
      lat: coords.lat,
      lng: coords.lng,
      ...driverInfo,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) { console.error('Bus location sync:', e); }
};

export const listenToBusLocations = (callback) => {
  if (!isFirebaseConnected) return () => {};
  return onSnapshot(col('bus_locations'), (snap) => {
    const coords = {};
    snap.docs.forEach((d) => { coords[d.id] = d.data(); });
    callback(coords);
  });
};

// ─── 6. STUDENT ATTENDANCE ────────────────────────────────────────────────────
export const submitStudentAttendanceToCloud = async (classId, students, teacherId) => {
  if (!isFirebaseConnected) return { success: false, mode: 'local' };
  try {
    const sessionId = `att_${classId}_${new Date().toISOString().slice(0, 10)}`;
    await setDoc(docRef('student_attendance', sessionId), {
      classId,
      students,
      teacherId,
      submittedAt: serverTimestamp(),
      date: new Date().toLocaleDateString('en-IN')
    }, { merge: true });
    return { success: true, id: sessionId };
  } catch (e) { console.error('Student attendance sync:', e); return { success: false }; }
};

// ─── 7. CLASS CHAT (Teacher ↔ Student) ───────────────────────────────────────
export const sendClassChatToCloud = async (classId, message) => {
  if (!isFirebaseConnected) return { success: false, mode: 'local' };
  try {
    const ref = await addDoc(col(`class_chats/${classId}/messages`), {
      ...message,
      timestamp: serverTimestamp()
    });
    return { success: true, id: ref.id };
  } catch (e) { console.error('Class chat sync:', e); return { success: false }; }
};

export const listenToClassChat = (classId, callback) => {
  if (!isFirebaseConnected) return () => {};
  const q = query(col(`class_chats/${classId}/messages`), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── 8. BULK ROSTER IMPORT & ISOLATED CLASS DATABASE ─────────────────────────
export const bulkImportStudentsToCloud = async (classId, studentList) => {
  if (!isFirebaseConnected) return { success: false, count: studentList.length, mode: 'local' };
  try {
    const batch = writeBatch(db);
    studentList.forEach((st) => {
      const docId = st.id || st.roll || `st_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const ref = doc(db, `classes/${classId}/students`, docId);
      batch.set(ref, {
        ...st,
        classId,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
    await batch.commit();
    return { success: true, count: studentList.length };
  } catch (e) {
    console.error('Bulk student import error:', e);
    return { success: false, error: e.message };
  }
};

export const bulkImportTeachersToCloud = async (teacherList) => {
  if (!isFirebaseConnected) return { success: false, count: teacherList.length, mode: 'local' };
  try {
    const batch = writeBatch(db);
    teacherList.forEach((t) => {
      const docId = t.id || t.employeeId || `tch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const ref = doc(db, 'teachers', docId);
      batch.set(ref, {
        ...t,
        role: 'TEACHER',
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
    await batch.commit();
    return { success: true, count: teacherList.length };
  } catch (e) {
    console.error('Bulk teacher import error:', e);
    return { success: false, error: e.message };
  }
};

export const listenToClassRoster = (classId, callback) => {
  if (!isFirebaseConnected) return () => {};
  return onSnapshot(col(`classes/${classId}/students`), (snap) => {
    const students = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(students);
  });
};

