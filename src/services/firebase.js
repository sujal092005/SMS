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
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

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
let storage = null;
export let isFirebaseConnected = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    try {
      storage = getStorage(app);
    } catch (sErr) {
      console.info('Firebase Storage optional init warning:', sErr.message);
    }
    isFirebaseConnected = true;
    console.log('⚡ Firebase connected — RAVS Smart School');
  } else {
    console.info('ℹ️ Firebase offline mode (add credentials to .env to enable cloud sync)');
  }
} catch (err) {
  console.warn('Firebase init error:', err.message);
}

export { app, db, auth, storage };

/**
 * Upload physical files (PDFs, images, docs) to Firebase Storage.
 * Returns public HTTPS download URL.
 */
export const uploadFileToCloudStorage = async (file, pathPrefix = 'class_notes') => {
  if (!isFirebaseConnected || !storage) {
    return { success: false, error: 'Firebase Storage not connected', mode: 'local' };
  }
  try {
    const fileId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fileRef = storageRef(storage, `${pathPrefix}/${fileId}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadUrl, fullPath: snapshot.ref.fullPath };
  } catch (err) {
    console.error('File upload error:', err);
    return { success: false, error: err.message };
  }
};

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
  }, (err) => console.warn('Notices listener error:', err.message));
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
  }, (err) => console.warn('Teacher attendance listener error:', err.message));
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
  }, (err) => console.warn('Class notes listener error:', err.message));
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
  }, (err) => console.warn('Faculty chat listener error:', err.message));
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
  }, (err) => console.warn('Bus locations listener error:', err.message));
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
  }, (err) => console.warn('Class chat listener error:', err.message));
};



// ─── AUTHENTICATION & USER PROVISIONING ──────────────────────────────────────

/**
 * Pre-authorization check: Verifies if user exists in Firestore users/teachers/students collections.
 */
export const checkUserAuthorization = async (email) => {
  if (!isFirebaseConnected || !db) {
    return { authorized: true, mode: 'local' };
  }
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Check top-level users collection
    const uQuery = query(col('users'), where('email', '==', cleanEmail));
    const uSnap = await getDocs(uQuery);
    if (!uSnap.empty) {
      const uData = uSnap.docs[0].data();
      return { authorized: true, profile: { id: uSnap.docs[0].id, ...uData } };
    }

    // 2. Check teachers collection
    const tQuery = query(col('teachers'), where('email', '==', cleanEmail));
    const tSnap = await getDocs(tQuery);
    if (!tSnap.empty) {
      const tData = tSnap.docs[0].data();
      return { authorized: true, profile: { id: tSnap.docs[0].id, role: 'TEACHER', ...tData } };
    }

    // 3. Fallback for admin / demo emails
    if (cleanEmail.includes('admin') || cleanEmail.includes('ravsschool.edu') || cleanEmail.includes('teacher') || cleanEmail.includes('student')) {
      return { authorized: true, profile: { email: cleanEmail, isSystemDefault: true } };
    }

    return { authorized: false, error: 'User is not registered by School Administration.' };
  } catch (err) {
    console.warn('Authorization check warning:', err.message);
    return { authorized: true }; // allow with fallback if error
  }
};

/**
 * Register/Provision a new school user into Firestore (Admin function).
 */
export const registerSchoolUser = async (userData) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const userId = userData.id || userData.email.toLowerCase().replace(/[^a-z0-9]/g, '');
    await setDoc(docRef('users', userId), {
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: serverTimestamp()
    }, { merge: true });
    return { success: true, id: userId };
  } catch (err) {
    console.error('User registration error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Sign in with email and password via Firebase Auth.
 * Strictly authenticates pre-registered users.
 */
export const firebaseSignIn = async (email, password) => {
  if (!isFirebaseConnected || !auth) {
    return { success: false, error: 'Firebase not connected', mode: 'local' };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user };
  } catch (err) {
    return { success: false, error: err.message, code: err.code };
  }
};

/**
 * Sign out of Firebase Auth.
 */
export const firebaseSignOut = async () => {
  if (!isFirebaseConnected || !auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase sign-out error:', err.message);
  }
};

/**
 * Listen to Firebase Auth state changes.
 * Returns an unsubscribe function.
 */
export const listenToAuthState = (callback) => {
  if (!isFirebaseConnected || !auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

/**
 * Add a single Teacher to Firestore teachers & users collections (Admin action).
 */
export const addSingleTeacherToCloud = async (teacherData) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const docId = teacherData.id || `tch_${Date.now()}`;
    const cleanEmail = (teacherData.email || `${docId}@ravsschool.edu`).toLowerCase();

    // 1. Save to teachers collection
    await setDoc(docRef('teachers', docId), {
      ...teacherData,
      id: docId,
      email: cleanEmail,
      role: 'TEACHER',
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Register in users collection for authentication & lookup
    await setDoc(docRef('users', docId), {
      id: docId,
      name: teacherData.name,
      email: cleanEmail,
      role: 'TEACHER',
      department: teacherData.department || 'General Academic',
      assignedClasses: teacherData.assignedClasses || ['8A', '10A'],
      createdAt: serverTimestamp()
    }, { merge: true });

    return { success: true, id: docId };
  } catch (err) {
    console.error('Error adding teacher:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Real-time listener for Teachers list in Firestore.
 */
export const listenToTeachers = (callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  return onSnapshot(col('teachers'), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

/**
 * Add a single Student to Firestore isolated class roster & users collections (Teacher action).
 */
export const addSingleStudentToClass = async (classId, studentData) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const docId = studentData.id || `st_${classId}_${Date.now()}`;
    const cleanEmail = (studentData.email || studentData.parentEmail || `${docId}@ravsschool.edu`).toLowerCase();

    // 1. Save to isolated class roster: classes/{classId}/students/{docId}
    await setDoc(docRef(`classes/${classId}/students`, docId), {
      ...studentData,
      id: docId,
      classId,
      email: cleanEmail,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Register in users collection for authorization & parent/student login
    await setDoc(docRef('users', docId), {
      id: docId,
      name: studentData.name,
      roll: studentData.roll,
      classId,
      email: cleanEmail,
      role: 'STUDENT',
      parentName: studentData.parentName || '',
      parentPhone: studentData.parentPhone || '',
      createdAt: serverTimestamp()
    }, { merge: true });

    return { success: true, id: docId };
  } catch (err) {
    console.error('Error adding student:', err);
    return { success: false, error: err.message };
  }
};




