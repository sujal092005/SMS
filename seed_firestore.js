import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAO7s3WIhIT_zlTxLmZmE4ZjYOgHXO5-Ow",
  authDomain: "ravssms-a5c7b.firebaseapp.com",
  projectId: "ravssms-a5c7b",
  storageBucket: "ravssms-a5c7b.firebasestorage.app",
  messagingSenderId: "418513625094",
  appId: "1:418513625094:web:333089421df897174ba387"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestoreDirectly() {
  console.log('⚡ Initializing Firestore Database for RAVS Smart School...');

  // 1. Seed Admin Document
  const adminUid = 'usr_admin_01';
  console.log('Writing users/' + adminUid);
  await setDoc(doc(db, 'users', adminUid), {
    uid: adminUid,
    loginId: 'ADMIN-0924',
    email: 'admin-0924@ravs.school',
    name: 'Dr. Arvind Sharma (Principal & Admin)',
    role: 'admin',
    phone: '+91 98765 43210',
    department: 'Administration',
    active: true,
    mustChangePassword: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 2. Seed Default Teacher
  const teacherUid = 'usr_teacher_01';
  console.log('Writing users/' + teacherUid);
  await setDoc(doc(db, 'users', teacherUid), {
    uid: teacherUid,
    loginId: 'TCH-PRIYA8A',
    email: 'tch-priya8a@ravs.school',
    name: 'Priya Sharma',
    role: 'classTeacher',
    classId: '8A',
    sections: ['8A'],
    phone: '+91 98123 45678',
    department: 'Mathematics',
    active: true,
    mustChangePassword: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 3. Seed Default Student
  const studentUid = 'usr_student_01';
  console.log('Writing students/' + studentUid);
  await setDoc(doc(db, 'students', studentUid), {
    id: studentUid,
    uid: studentUid,
    loginId: 'RAVS-8A-014',
    name: 'Aarav Sharma',
    rollNo: '014',
    classId: '8A',
    parentName: 'Sunita Sharma',
    parentPhone: '9876543210',
    active: true,
    mustChangePassword: false,
    createdAt: serverTimestamp()
  }, { merge: true });

  // 4. Seed school config
  console.log('Writing school/config');
  await setDoc(doc(db, 'school', 'config'), {
    name: 'RAVS Smart School',
    maxUsers: 500,
    currentUserCount: 3,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 5. Seed classes
  const classes = [
    { classId: '5A', className: 'Class 5', section: 'A' },
    { classId: '6A', className: 'Class 6', section: 'A' },
    { classId: '7A', className: 'Class 7', section: 'A' },
    { classId: '8A', className: 'Class 8', section: 'A', classTeacherUid: teacherUid, classTeacherName: 'Priya Sharma', studentCount: 1 },
    { classId: '9A', className: 'Class 9', section: 'A' },
    { classId: '10A', className: 'Class 10', section: 'A' },
    { classId: '11A', className: 'Class 11', section: 'A' },
    { classId: '12A', className: 'Class 12', section: 'A' }
  ];

  for (const c of classes) {
    console.log('Writing classes/' + c.classId);
    await setDoc(doc(db, 'classes', c.classId), {
      ...c,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  console.log('\n✅ Firestore Database is fully seeded and LIVE!');
}

seedFirestoreDirectly().then(() => process.exit(0)).catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
