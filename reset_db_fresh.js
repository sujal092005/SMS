import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAO7s3WIhIT_zlTxLmZmE4ZjYOgHXO5-Ow",
  authDomain: "ravssms-a5c7b.firebaseapp.com",
  projectId: "ravssms-a5c7b",
  storageBucket: "ravssms-a5c7b.firebasestorage.app",
  messagingSenderId: "418513625094",
  appId: "1:418513625094:web:333089421df897174ba387"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function purgeCollection(colName) {
  try {
    const snap = await getDocs(collection(db, colName));
    console.log(`🧹 Clearing ${snap.docs.length} documents from '${colName}'...`);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, colName, d.id));
    }
  } catch (err) {
    console.warn(`Warning clearing ${colName}:`, err.message);
  }
}

async function resetDatabaseFresh() {
  console.log('⚡ Purging all existing past data from Cloud Firestore...');

  await purgeCollection('users');
  await purgeCollection('students');
  await purgeCollection('studentPrivate');
  await purgeCollection('classNotes');
  await purgeCollection('notices');
  await purgeCollection('facultyChats');
  await purgeCollection('attendance');
  await purgeCollection('teacherAttendance');

  const adminLoginId = 'ADMIN-0924';
  const adminEmail = 'admin-0924@ravs.school';
  const adminPassword = 'Admin@12345';

  console.log('\n👑 Seeding fresh Admin credentials into Firebase Auth & Firestore...');

  let user = null;
  try {
    const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    user = cred.user;
    console.log(`✅ Admin authenticated in Auth (UID: ${user.uid})`);
  } catch {
    try {
      const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      user = cred.user;
      console.log(`🎉 Admin created in Auth (UID: ${user.uid})`);
    } catch (cErr) {
      console.error('Failed auth creation:', cErr.message);
      user = { uid: 'usr_admin_0924' };
    }
  }

  // 1. Write Fresh Admin user
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    loginId: adminLoginId,
    email: adminEmail,
    password: adminPassword,
    name: 'Institutional Administrator',
    role: 'admin',
    phone: '+91 98765 43210',
    department: 'Central Administration',
    active: true,
    mustChangePassword: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 2. Seed clean school configuration
  await setDoc(doc(db, 'school', 'config'), {
    name: 'RAVS Smart School',
    maxUsers: 500,
    currentUserCount: 1,
    updatedAt: serverTimestamp()
  });

  // 3. Seed clean class structures (5A to 12A)
  const classesList = [
    { classId: '5A', className: 'Class 5-A', section: 'A' },
    { classId: '6A', className: 'Class 6-A', section: 'A' },
    { classId: '7A', className: 'Class 7-A', section: 'A' },
    { classId: '8A', className: 'Class 8-A', section: 'A' },
    { classId: '9A', className: 'Class 9-A', section: 'A' },
    { classId: '10A', className: 'Class 10-A', section: 'A' },
    { classId: '11A', className: 'Class 11-A', section: 'A' },
    { classId: '12A', className: 'Class 12-A', section: 'A' }
  ];

  for (const c of classesList) {
    await setDoc(doc(db, 'classes', c.classId), {
      ...c,
      studentCount: 0,
      classTeacherUid: null,
      classTeacherName: 'Unassigned',
      updatedAt: serverTimestamp()
    });
  }

  console.log('✨ Clean database structure initialized successfully!');
  console.log('\n=============================================');
  console.log('🔑 FRESH ADMIN CREDENTIALS:');
  console.log(`Login ID: ${adminLoginId}`);
  console.log(`Password: ${adminPassword}`);
  console.log('=============================================\n');
}

resetDatabaseFresh().then(() => process.exit(0)).catch(err => {
  console.error('Reset error:', err);
  process.exit(1);
});
