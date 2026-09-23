// Firebase SDK Configuration & Services Integration
// Full Cloud Firebase Architecture with Functions, Firestore, Auth, Storage

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  collectionGroup,
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
  onAuthStateChanged,
  updatePassword
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import {
  getFunctions,
  httpsCallable
} from 'firebase/functions';

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
let functionsInstance = null;
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
    try {
      functionsInstance = getFunctions(app);
    } catch (fErr) {
      console.info('Firebase Functions optional init warning:', fErr.message);
    }
    isFirebaseConnected = true;
    console.log('⚡ Firebase connected — RAVS Smart School');
  } else {
    console.info('ℹ️ Firebase offline / local mode');
  }
} catch (err) {
  console.warn('Firebase init error:', err.message);
}

export { app, db, auth, storage, functionsInstance };

// ─── LOGIN ID TO EMAIL CONVERSION ──────────────────────────────────────────
export const loginIdToAuthEmail = (loginId) => {
  const clean = loginId.trim();
  if (clean.includes('@')) return clean.toLowerCase();
  const sanitized = clean.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${sanitized}@ravs.school`;
};

// ─── HELPERS ───────────────────────────────────────────────────────────────
// Parse classId from student loginId. Format: RAVS-{CLASS}-{ROLL} e.g. RAVS-10A-001 → '10A'
const parseClassFromLoginId = (loginId) => {
  const parts = (loginId || '').split('-');
  // RAVS-10A-001 has 3 parts; handle e.g. RAVS-10A-001
  if (parts.length >= 3 && parts[0].toUpperCase() === 'RAVS') {
    return parts[1].toUpperCase(); // '10A'
  }
  return null;
};

// ─── AUTHENTICATION HELPERS ────────────────────────────────────────────────
export const firebaseSignInWithId = async (loginId, password) => {
  if (!isFirebaseConnected) {
    return { success: false, error: 'Database is not connected.' };
  }

  const cleanId = (loginId || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Please enter both Institutional Login ID and Password.' };
  }

  // 1. Try Firebase Auth first (for admin bootstrapped via createUserWithEmailAndPassword)
  if (auth) {
    try {
      const email = loginIdToAuthEmail(cleanId);
      const cred = await signInWithEmailAndPassword(auth, email, cleanPass);
      const idTokenResult = await cred.user.getIdTokenResult();
      const userDocSnap = await getDoc(doc(db, 'users', cred.user.uid));
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;
      if (userData && userData.active === false) {
        await signOut(auth);
        return { success: false, error: 'This account has been deactivated. Please contact administration.' };
      }
      return { success: true, user: cred.user, claims: idTokenResult.claims, userData };
    } catch (authErr) {
      console.info('Firebase Auth sign-in fallback to Firestore lookup:', authErr.code);
    }
  }

  if (!db) return { success: false, error: 'Invalid Login ID or Password.' };

  try {
    // ── 2. ADMIN / DRIVER / STAFF → users collection ──────────────────────
    const usersSnap = await getDocs(query(collection(db, 'users'), where('loginId', '==', cleanId)));
    if (!usersSnap.empty) {
      const userDoc = usersSnap.docs[0].data();
      const docId = usersSnap.docs[0].id;
      if (userDoc.active === false)
        return { success: false, error: 'This account has been deactivated. Please contact administration.' };
      const validPass = userDoc.password || (userDoc.role === 'admin' ? 'Admin@123456' : null);
      if (validPass && cleanPass !== validPass)
        return { success: false, error: 'Invalid Password. Please check your credentials.' };
      let uiRole = 'STUDENT';
      if (userDoc.role === 'admin') uiRole = 'ADMIN';
      else if (['classTeacher','subjectTeacher','teacher'].includes(userDoc.role)) uiRole = 'TEACHER';
      else if (userDoc.role === 'parent') uiRole = 'PARENT';
      else if (userDoc.role === 'driver') uiRole = 'DRIVER';
      return {
        success: true,
        userData: {
          uid: docId, loginId: userDoc.loginId || cleanId,
          name: userDoc.name || 'User', role: userDoc.role || 'admin', uiRole,
          classId: userDoc.classId || '8A',
          sections: userDoc.sections || (userDoc.classId ? [userDoc.classId] : ['8A']),
          active: true, mustChangePassword: !!userDoc.mustChangePassword
        },
        claims: { role: userDoc.role }
      };
    }

    // ── 3. TEACHER → teachers flat collection (login_id field) ────────────
    let teachersSnap = await getDocs(query(collection(db, 'teachers'), where('loginId', '==', cleanId)));
    if (teachersSnap.empty) {
      teachersSnap = await getDocs(query(collection(db, 'teachers'), where('login_id', '==', cleanId)));
    }
    if (!teachersSnap.empty) {
      const userDoc = teachersSnap.docs[0].data();
      const docId = teachersSnap.docs[0].id;
      if (userDoc.active === false)
        return { success: false, error: 'This account has been deactivated. Please contact administration.' };
      const validPass = userDoc.password || 'Teacher@123';
      if (validPass && cleanPass !== validPass)
        return { success: false, error: 'Invalid Password. Please check your credentials.' };
      const resolvedClassId = userDoc.classId || userDoc.assignedClass || (userDoc.sections && userDoc.sections[0]) || '10A';
      return {
        success: true,
        userData: {
          uid: docId, loginId: userDoc.loginId || userDoc.login_id || cleanId,
          name: userDoc.name || 'Faculty Member',
          role: userDoc.role || 'classTeacher', uiRole: 'TEACHER',
          classId: resolvedClassId,
          sections: userDoc.sections || [resolvedClassId],
          active: true, mustChangePassword: !!userDoc.mustChangePassword
        },
        claims: { role: userDoc.role || 'classTeacher' }
      };
    }

    // ── 4. STUDENT → NEW: direct O(1) lookup via classes/{classId}/class_student/{loginId} ──
    //    loginId format: RAVS-10A-001 — parse class from it, then getDoc directly
    const parsedClass = parseClassFromLoginId(cleanId);
    if (parsedClass) {
      const studentDocSnap = await getDoc(doc(db, 'classes', parsedClass, 'class_student', cleanId));
      if (studentDocSnap.exists()) {
        const sd = studentDocSnap.data();
        const validPass = sd.password || sd.dob || '15082012';
        if (validPass && cleanPass !== validPass)
          return { success: false, error: 'Invalid Password. Your login password is your Date of Birth (DDMMYYYY).' };
        return {
          success: true,
          userData: {
            uid: cleanId, loginId: sd.login_id || cleanId,
            name: sd.name || 'Student', role: 'student', uiRole: 'STUDENT',
            classId: sd.classId || parsedClass,
            sections: [sd.classId || parsedClass],
            rollNo: sd.rollNo || '001', roll: sd.rollNo || '01',
            active: sd.active !== false, mustChangePassword: false
          },
          claims: { role: 'student' }
        };
      }
    }

    // ── 4b. STUDENT fallback → old flat students collection ───────────────
    const studentsSnap = await getDocs(query(collection(db, 'students'), where('loginId', '==', cleanId)));
    if (!studentsSnap.empty) {
      const sd = studentsSnap.docs[0].data();
      const docId = studentsSnap.docs[0].id;
      const validPass = sd.password || sd.dob || '15082012';
      if (validPass && cleanPass !== validPass)
        return { success: false, error: 'Invalid Password. Your login password is your Date of Birth (DDMMYYYY).' };
      return {
        success: true,
        userData: {
          uid: docId, loginId: sd.loginId || cleanId,
          name: sd.name || 'Student', role: 'student', uiRole: 'STUDENT',
          classId: sd.classId || '8A', sections: [sd.classId || '8A'],
          rollNo: sd.rollNo || sd.roll || '001', roll: sd.rollNo || sd.roll || '01',
          active: sd.active !== false, mustChangePassword: false
        },
        claims: { role: 'student' }
      };
    }

    // ── 5. PARENT → collectionGroup query on class_student.parent_number ──
    //    Parent logs in with their 10-digit mobile number (or PAR-XXXXXXXXXX)
    const rawPhone = cleanId.startsWith('PAR-') ? cleanId.slice(4) : cleanId;
    if (/^\d{10}$/.test(rawPhone)) {
      try {
        const parentSnap = await getDocs(
          query(collectionGroup(db, 'class_student'), where('parent_number', '==', rawPhone))
        );
        if (!parentSnap.empty) {
          const pd = parentSnap.docs[0].data();
          if (cleanPass !== rawPhone) {
            return { success: false, error: 'Invalid Password. Your login password is your registered mobile number.' };
          }
          return {
            success: true,
            userData: {
              uid: `par_${rawPhone}`,
              loginId: `PAR-${rawPhone}`,
              name: pd.parent_name || `Parent (${rawPhone})`,
              role: 'parent', uiRole: 'PARENT',
              classId: pd.classId || '8A',
              phone: rawPhone,
              studentName: pd.name,
              active: true
            },
            claims: { role: 'parent' }
          };
        }
        // Also try old students collection for backward compat
        const oldParentSnap = await getDocs(
          query(collection(db, 'students'), where('parentPhone', '==', rawPhone))
        );
        if (!oldParentSnap.empty) {
          const pd = oldParentSnap.docs[0].data();
          return {
            success: true,
            userData: {
              uid: `par_${rawPhone}`, loginId: `PAR-${rawPhone}`,
              name: pd.parentName || `Parent (${rawPhone})`,
              role: 'parent', uiRole: 'PARENT',
              classId: pd.classId || '8A', phone: rawPhone,
              studentName: pd.name, active: true
            },
            claims: { role: 'parent' }
          };
        }
      } catch (parentErr) {
        console.warn('Parent collectionGroup query failed (index may be building):', parentErr.message);
      }
    }

    return { success: false, error: 'Login ID not found. Please check your ID or contact administration.' };
  } catch (dbErr) {
    console.error('Firestore login query error:', dbErr);
    return { success: false, error: 'Database authentication error: ' + dbErr.message };
  }
}

export const updateUserAccountPassword = async (newPassword, currentUser = null) => {
  // If the user is logged in via Firebase Auth (e.g., Admin bootstrap)
  if (auth && auth.currentUser) {
    try {
      await updatePassword(auth.currentUser, newPassword);
      if (db) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          password: newPassword,
          mustChangePassword: false,
          updatedAt: serverTimestamp()
        });
        // Also update in students collection if student
        const studentSnap = await getDoc(doc(db, 'students', auth.currentUser.uid));
        if (studentSnap.exists()) {
          await updateDoc(doc(db, 'students', auth.currentUser.uid), {
            password: newPassword,
            mustChangePassword: false
          });
        }
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // If the user is logged in via Firestore direct lookup (Teachers, Students, Parents)
  if (currentUser && currentUser.uid && db) {
    try {
      // Determine collection based on role
      const collectionName = currentUser.role === 'student' ? 'students' : 'users';
      
      await updateDoc(doc(db, collectionName, currentUser.uid), {
        password: newPassword,
        mustChangePassword: false,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to update password in database: ' + err.message };
    }
  }

  return { success: false, error: 'No authenticated user found.' };
};

/**
 * Bootstrap / Seed the First Institutional Admin Account if it doesn't exist yet
 */
export const bootstrapAdminAccount = async (loginId = 'ADMIN-0924', password = 'Admin@12345') => {
  if (!isFirebaseConnected || !auth || !db) {
    return { success: false, error: 'Firebase is not connected.' };
  }
  const email = loginIdToAuthEmail(loginId);

  // 1. Try regular sign in first
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const tokenRes = await cred.user.getIdTokenResult();
    
    // Ensure admin document exists in Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      loginId,
      email,
      name: 'Institutional Administrator',
      role: 'admin',
      active: true,
      mustChangePassword: false,
      createdAt: serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      user: cred.user,
      claims: tokenRes.claims,
      isNew: false
    };
  } catch (err) {
    // If user does not exist in Auth, create it directly
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      try {
        const createRes = await createUserWithEmailAndPassword(auth, email, password);
        
        // Write users doc
        await setDoc(doc(db, 'users', createRes.user.uid), {
          uid: createRes.user.uid,
          loginId,
          email,
          name: 'Institutional Administrator',
          role: 'admin',
          active: true,
          mustChangePassword: false,
          createdAt: serverTimestamp()
        }, { merge: true });

        // Seed school config
        await setDoc(doc(db, 'school', 'config'), {
          name: 'RAVS Smart School',
          maxUsers: 500,
          currentUserCount: 1,
          createdAt: serverTimestamp()
        }, { merge: true });

        return {
          success: true,
          user: createRes.user,
          isNew: true
        };
      } catch (createErr) {
        return { success: false, error: createErr.message };
      }
    }
    return { success: false, error: err.message };
  }
};

export const firebaseSignOut = async () => {
  if (!isFirebaseConnected || !auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase sign-out error:', err.message);
  }
};

export const listenToAuthState = (callback) => {
  if (!isFirebaseConnected || !auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// ─── CALLABLE CLOUD FUNCTIONS ──────────────────────────────────────────────
export const createTeacherCallable = async (teacherData) => {
  if (!functionsInstance) {
    return { success: false, error: 'Firebase Functions not initialized' };
  }
  try {
    const fn = httpsCallable(functionsInstance, 'createTeacher');
    const result = await fn(teacherData);
    return result.data;
  } catch (err) {
    console.error('Error calling createTeacher:', err);
    return { success: false, error: err.message };
  }
};

export const createStudentCallable = async (studentData) => {
  if (!functionsInstance) {
    return { success: false, error: 'Firebase Functions not initialized' };
  }
  try {
    const fn = httpsCallable(functionsInstance, 'createStudent');
    const result = await fn(studentData);
    return result.data;
  } catch (err) {
    console.error('Error calling createStudent:', err);
    return { success: false, error: err.message };
  }
};

export const createStudentsBulkCallable = async (classId, students) => {
  if (!functionsInstance) {
    return { success: false, error: 'Firebase Functions not initialized' };
  }
  try {
    const fn = httpsCallable(functionsInstance, 'createStudentsBulk');
    const result = await fn({ classId, students });
    return result.data;
  } catch (err) {
    console.error('Error calling createStudentsBulk:', err);
    return { success: false, error: err.message };
  }
};

export const resetUserPasswordCallable = async (targetUid) => {
  if (!functionsInstance) {
    return { success: false, error: 'Firebase Functions not initialized' };
  }
  try {
    const fn = httpsCallable(functionsInstance, 'resetUserPassword');
    const result = await fn({ targetUid });
    return result.data;
  } catch (err) {
    console.error('Error calling resetUserPassword:', err);
    return { success: false, error: err.message };
  }
};

export const setUserActiveStatusCallable = async (targetUid, active) => {
  if (!functionsInstance) {
    return { success: false, error: 'Firebase Functions not initialized' };
  }
  try {
    const fn = httpsCallable(functionsInstance, 'setUserActiveStatus');
    const result = await fn({ targetUid, active });
    return result.data;
  } catch (err) {
    console.error('Error calling setUserActiveStatus:', err);
    return { success: false, error: err.message };
  }
};

export const askAIDoubtCallable = async (question, classId, subject) => {
  if (!functionsInstance) {
    return { success: false, error: 'Firebase Functions not initialized' };
  }
  try {
    const fn = httpsCallable(functionsInstance, 'askAIDoubtAssistant');
    const result = await fn({ question, classId, subject });
    return result.data;
  } catch (err) {
    console.error('Error calling askAIDoubtAssistant:', err);
    return { success: false, error: err.message };
  }
};

export const seedSchoolConfigCallable = async () => {
  if (!functionsInstance) return { success: false };
  try {
    const fn = httpsCallable(functionsInstance, 'seedSchoolConfig');
    const result = await fn({});
    return result.data;
  } catch (err) {
    console.error('Error seeding config:', err);
    return { success: false, error: err.message };
  }
};

// ─── REALTIME FIRESTORE LISTENERS ──────────────────────────────────────────
const col = (path) => collection(db, path);
const docRef = (path, id) => doc(db, path, id);

export const listenToUserProfile = (uid, callback) => {
  if (!isFirebaseConnected || !db || !uid) return () => {};
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (err) => console.warn('User profile listener error:', err.message));
};

export const listenToSchoolConfig = (callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  return onSnapshot(doc(db, 'school', 'config'), (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback({ name: 'RAVS Smart School', maxUsers: 500, currentUserCount: 0 });
    }
  }, (err) => console.warn('School config listener error:', err.message));
};

export const listenToTeachersList = (callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  // Primary: dedicated teachers flat collection (always written on addTeacher)
  return onSnapshot(col('teachers'), (snap) => {
    const teachers = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      // Normalize field names: support both old (loginId) and new (login_id) formats
      loginId: d.data().loginId || d.data().login_id,
      login_id: d.data().login_id || d.data().loginId
    }));
    callback(teachers.length > 0 ? teachers : []);
  }, (err) => {
    console.warn('Teachers list listener error:', err.message);
    // Fallback: users collection filtered by teacher roles
    const q = query(col('users'), where('role', 'in', ['classTeacher', 'subjectTeacher', 'teacher']));
    return onSnapshot(q, (uSnap) => {
      callback(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  });
};

export const listenToStudentsList = (classId, callback) => {
  if (!isFirebaseConnected || !db) return () => {};

  const normalizeStudent = (d, fallbackClass = classId) => ({
    id: d.id,
    uid: d.id,
    classId: d.data().classId || d.data().class_id || fallbackClass,
    ...d.data(),
    // Normalize field names: support both old snake_case and camelCase
    loginId: d.data().login_id || d.data().loginId || d.id,
    login_id: d.data().login_id || d.data().loginId || d.id,
    parentPhone: d.data().parent_number || d.data().parentPhone || '',
    parent_number: d.data().parent_number || d.data().parentPhone || '',
    parentName: d.data().parent_name || d.data().parentName || '',
    parent_name: d.data().parent_name || d.data().parentName || ''
  });

  if (classId && classId !== 'ALL') {
    // Primary: new class_student subcollection
    const newSubCol = collection(db, 'classes', classId, 'class_student');
    const unsubNew = onSnapshot(newSubCol, (snap) => {
      const fromNew = snap.docs.map(d => normalizeStudent(d, classId))
        .sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''));
      if (fromNew.length > 0) {
        callback(fromNew);
      } else {
        // Fallback: flat students collection
        const simpleQ = query(col('students'), where('classId', '==', classId));
        getDocs(simpleQ).then((s) => {
          callback(s.docs.map(d => normalizeStudent(d, classId))
            .sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '')));
        }).catch(() => callback([]));
      }
    }, (err) => {
      console.warn('class_student listener warning:', err.message);
      const simpleQ = query(col('students'), where('classId', '==', classId));
      onSnapshot(simpleQ, (s) => {
        callback(s.docs.map(d => normalizeStudent(d, classId))
          .sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '')));
      });
    });
    return unsubNew;
  } else {
    // ALL classes: listen to flat students collection (used by admin)
    const q = query(col('students'), orderBy('rollNo', 'asc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => normalizeStudent(d, '10A')));
    }, () => {
      return onSnapshot(col('students'), (s) => {
        callback(s.docs.map(d => normalizeStudent(d, '10A')));
      });
    });
  }
};

export const listenToClassesList = (callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  return onSnapshot(col('classes'), (snap) => {
    const classes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(classes);
  }, (err) => console.warn('Classes listener error:', err.message));
};

// ─── STORAGE UPLOAD ────────────────────────────────────────────────────────
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
    return { success: false, error: err.message, mode: 'local' };
  }
};

// ─── NOTICES ───────────────────────────────────────────────────────────────
export const addNoticeToCloud = async (notice) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const ref = await addDoc(col('notices'), { ...notice, createdAt: serverTimestamp() });
    return { success: true, id: ref.id };
  } catch (e) { console.error('Notice sync:', e); return { success: false, error: e.message }; }
};

export const listenToNotices = (callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  const q = query(col('notices'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => console.warn('Notices listener error:', err.message));
};

export const deleteNoticeFromCloud = async (id) => {
  if (!isFirebaseConnected || !db) return;
  try { await deleteDoc(docRef('notices', id)); } catch (e) { console.error(e); }
};

// ─── TEACHER ATTENDANCE (Campus Gate Check-In) ─────────────────────────────
export const syncAttendanceToCloud = async (record) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const id = record.id || `log_${Date.now()}`;
    await setDoc(docRef('teacherAttendance', id), { ...record, savedAt: serverTimestamp() }, { merge: true });
    return { success: true, id };
  } catch (e) { console.error('Attendance sync:', e); return { success: false, error: e.message }; }
};

export const listenToTeacherAttendance = (callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  const q = query(col('teacherAttendance'), orderBy('savedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => console.warn('Teacher attendance listener error:', err.message));
};

// ─── CLASS NOTES ───────────────────────────────────────────────────────────
export const syncNotesToCloud = async (note) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const id = note.id || `cn_${Date.now()}`;
    const sanitizedNote = {};
    Object.keys(note).forEach((key) => {
      const val = note[key];
      if (val !== undefined && val !== null) {
        // Exclude huge base64 data and blob URLs to avoid 1MB Firestore document limit
        if (key === 'fileData' && typeof val === 'string' && (val.length > 300000 || val.startsWith('blob:'))) {
          return;
        }
        // Skip blob: URLs for fileUrl — only store cloud storage URLs
        if (key === 'fileUrl' && typeof val === 'string' && val.startsWith('blob:')) {
          return;
        }
        sanitizedNote[key] = val;
      }
    });

    await setDoc(docRef('classNotes', id), { ...sanitizedNote, createdAt: serverTimestamp() }, { merge: true });
    return { success: true, id };
  } catch (e) { console.error('Note sync:', e); return { success: false, error: e.message }; }
};

export const listenToClassNotes = (classId, callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  try {
    const q = query(
      col('classNotes'),
      where('targetClassId', 'in', [classId, 'ALL']),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.warn('Class notes listener fallback:', err.message);
      return onSnapshot(col('classNotes'), (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(d => !d.targetClassId || d.targetClassId === classId || d.targetClassId === 'ALL');
        callback(docs);
      });
    });
  } catch {
    return onSnapshot(col('classNotes'), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(docs);
    });
  }
};

// ─── FACULTY CHAT ──────────────────────────────────────────────────────────
export const sendFacultyChatMessage = async (channelId = 'general', message) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const ref = await addDoc(col('facultyChats'), {
      ...message,
      channelId,
      timestamp: serverTimestamp()
    });
    return { success: true, id: ref.id };
  } catch (e) { console.error('Faculty chat sync:', e); return { success: false, error: e.message }; }
};

export const listenToFacultyChat = (channelId = 'general', callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  const q = query(col('facultyChats'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.warn('Faculty chat listener fallback:', err.message);
    return onSnapshot(col('facultyChats'), (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  });
};

// ─── CLASS CHAT (Teacher ↔ Student) ────────────────────────────────────────
export const sendClassChatToCloud = async (classId, message) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const ref = await addDoc(col(`chats/${classId}/messages`), {
      ...message,
      timestamp: serverTimestamp()
    });
    return { success: true, id: ref.id };
  } catch (e) { console.error('Class chat sync:', e); return { success: false, error: e.message }; }
};

export const listenToClassChat = (classId, callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  const q = query(col(`chats/${classId}/messages`), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.warn('Class chat listener fallback:', err.message);
    return onSnapshot(col(`chats/${classId}/messages`), (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  });
};

// ─── BUS GPS LOCATION ──────────────────────────────────────────────────────
export const updateBusLocationInCloud = async (busId, coords, driverInfo = {}) => {
  if (!isFirebaseConnected || !db) return;
  try {
    await setDoc(docRef('buses', busId), {
      busId,
      lat: coords.lat,
      lng: coords.lng,
      ...driverInfo,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) { console.error('Bus location sync:', e); }
};

export const listenToBusLocations = (callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  return onSnapshot(col('buses'), (snap) => {
    const coords = {};
    snap.docs.forEach((d) => { coords[d.id] = d.data(); });
    callback(coords);
  }, (err) => console.warn('Bus locations listener error:', err.message));
};

// ─── STUDENT ATTENDANCE ────────────────────────────────────────────────────
export const submitStudentAttendanceToCloud = async (classId, students, teacherId, photoUrl = null) => {
  if (!isFirebaseConnected || !db) return { success: false, mode: 'local' };
  try {
    const sessionId = `att_${classId}_${new Date().toISOString().slice(0, 10)}`;
    await setDoc(docRef('attendance', sessionId), {
      classId,
      students,
      teacherId,
      photoUrl: photoUrl || null,
      submittedAt: serverTimestamp(),
      date: new Date().toLocaleDateString('en-IN')
    }, { merge: true });
    return { success: true, id: sessionId };
  } catch (e) { console.error('Student attendance sync:', e); return { success: false, error: e.message }; }
};

export const listenToStudentAttendance = (callback) => {
  if (!isFirebaseConnected || !db) return () => {};
  return onSnapshot(col('attendance'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => console.warn('Student attendance listener error:', err.message));
};

export const getBackendStatus = () => ({
  status: isFirebaseConnected ? 'CLOUD' : 'LOCAL',
  label: isFirebaseConnected ? '☁️ Firebase Live' : '💾 Local Storage',
  lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
});
