import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAO7s3WIhIT_zlTxLmZmE4ZjYOgHXO5-Ow",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "ravssms-a5c7b.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "ravssms-a5c7b",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "ravssms-a5c7b.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "418513625094",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:418513625094:web:333089421df897174ba387"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── MIGRATE STUDENTS ─────────────────────────────────────────────────────────
async function migrateStudents() {
  console.log('\n📦 Migrating students/ → classes/{classId}/class_student/{loginId}...');
  const snap = await getDocs(collection(db, 'students'));
  if (snap.empty) { console.log('   No documents in students/. Skipping.'); return; }

  let moved = 0, skipped = 0;
  const batch = writeBatch(db);

  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const classId = (d.classId || '').trim().toUpperCase();
    const loginId = d.loginId || d.login_id || docSnap.id;

    if (!classId) { console.warn(`   ⚠️  Skipping student ${loginId} — no classId`); skipped++; continue; }

    const newDoc = {
      name: d.name || '',
      login_id: loginId,
      password: d.password || d.dob || '15082012',
      parent_name: d.parentName || d.parent_name || '',
      parent_number: d.parentPhone || d.parent_number || '',
      rollNo: d.rollNo || d.roll || '001',
      classId,
      loginId,
      parentName: d.parentName || d.parent_name || '',
      parentPhone: d.parentPhone || d.parent_number || '',
      dob: d.dob || d.password || '15082012',
      uid: loginId,
      id: loginId,
      active: d.active !== false,
      mustChangePassword: false,
      migratedAt: serverTimestamp()
    };

    const destRef = doc(db, 'classes', classId, 'class_student', loginId);
    batch.set(destRef, newDoc, { merge: true });
    moved++;
  }

  await batch.commit();
  console.log(`   ✅ Migrated ${moved} students | Skipped ${skipped}`);
}

// ─── MIGRATE TEACHERS ─────────────────────────────────────────────────────────
async function migrateTeachers() {
  console.log('\n📦 Migrating teachers/ → classes/{classId}/class_teacher/{docId}...');
  const snap = await getDocs(collection(db, 'teachers'));
  if (snap.empty) { console.log('   No documents in teachers/. Skipping.'); return; }

  let moved = 0, skipped = 0;
  const batch = writeBatch(db);

  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const classId = (d.classId || '').trim().toUpperCase();
    const loginId = d.loginId || d.login_id || '';

    if (!classId) { console.warn(`   ⚠️  Skipping teacher ${loginId} — no classId`); skipped++; continue; }

    const newDoc = {
      name: d.name || '',
      login_id: loginId,
      loginId,
      password: d.password || 'Teacher@123',
      subject: d.subject || d.department || '',
      role: d.role || 'classTeacher',
      classId,
      phone: d.phone || '',
      active: d.active !== false,
      uid: docSnap.id,
      migratedAt: serverTimestamp()
    };

    const destRef = doc(db, 'classes', classId, 'class_teacher', docSnap.id);
    batch.set(destRef, newDoc, { merge: true });

    const classRef = doc(db, 'classes', classId);
    batch.set(classRef, {
      classId,
      classTeacherUid: docSnap.id,
      classTeacherName: d.name,
      updatedAt: serverTimestamp()
    }, { merge: true });

    moved++;
  }

  await batch.commit();
  console.log(`   ✅ Migrated ${moved} teachers | Skipped ${skipped}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 RAVS Smart School — Firestore Migration Script (Client SDK)');
  console.log('================================================');
  try {
    await migrateStudents();
    await migrateTeachers();
    console.log('\n🎉 Migration complete! Original flat collections are untouched.');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
})();
