/**
 * migrate_to_new_structure.js
 * ----------------------------
 * Moves existing flat students/ and teachers/ data into the new
 * classes/{classId}/class_student/{loginId} and
 * classes/{classId}/class_teacher/{docId} subcollections.
 *
 * Run once from project root:
 *   node migrate_to_new_structure.js
 *
 * Requirements:
 *   - serviceAccountKey.json in project root (download from Firebase Console >
 *     Project Settings > Service Accounts > Generate New Private Key)
 *   - npm install firebase-admin  (only needed if not already installed)
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ravssms-a5c7b'
});

const db = admin.firestore();

// ─── MIGRATE STUDENTS ─────────────────────────────────────────────────────────
async function migrateStudents() {
  console.log('\n📦 Migrating students/ → classes/{classId}/class_student/{loginId}...');
  const snap = await db.collection('students').get();
  if (snap.empty) { console.log('   No documents in students/. Skipping.'); return; }

  let moved = 0, skipped = 0;
  const batch = db.batch();

  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const classId = (d.classId || '').trim().toUpperCase();
    const loginId = d.loginId || d.login_id || docSnap.id;

    if (!classId) { console.warn(`   ⚠️  Skipping student ${loginId} — no classId`); skipped++; continue; }

    const newDoc = {
      // New schema (snake_case)
      name: d.name || '',
      login_id: loginId,
      password: d.password || d.dob || '15082012',
      parent_name: d.parentName || d.parent_name || '',
      parent_number: d.parentPhone || d.parent_number || '',
      rollNo: d.rollNo || d.roll || '001',
      classId,
      // Legacy compat (camelCase)
      loginId,
      parentName: d.parentName || d.parent_name || '',
      parentPhone: d.parentPhone || d.parent_number || '',
      dob: d.dob || d.password || '15082012',
      uid: loginId,
      id: loginId,
      active: d.active !== false,
      mustChangePassword: false,
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const destRef = db.collection('classes').doc(classId)
                      .collection('class_student').doc(loginId);
    batch.set(destRef, newDoc, { merge: true });
    moved++;
  }

  await batch.commit();
  console.log(`   ✅ Migrated ${moved} students | Skipped ${skipped}`);
}

// ─── MIGRATE TEACHERS ─────────────────────────────────────────────────────────
async function migrateTeachers() {
  console.log('\n📦 Migrating teachers/ → classes/{classId}/class_teacher/{docId}...');
  const snap = await db.collection('teachers').get();
  if (snap.empty) { console.log('   No documents in teachers/. Skipping.'); return; }

  let moved = 0, skipped = 0;
  const batch = db.batch();

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
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const destRef = db.collection('classes').doc(classId)
                      .collection('class_teacher').doc(docSnap.id);
    batch.set(destRef, newDoc, { merge: true });

    // Also update classes root doc
    const classRef = db.collection('classes').doc(classId);
    batch.set(classRef, {
      classId,
      classTeacherUid: docSnap.id,
      classTeacherName: d.name,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    moved++;
  }

  await batch.commit();
  console.log(`   ✅ Migrated ${moved} teachers | Skipped ${skipped}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 RAVS Smart School — Firestore Migration Script');
  console.log('================================================');
  try {
    await migrateStudents();
    await migrateTeachers();
    console.log('\n🎉 Migration complete! Original flat collections are untouched (safe to verify before deleting).');
    console.log('\n📝 NOTE: The Firestore index for parent_number queries will be deployed');
    console.log('   automatically via firestore.indexes.json when you run:');
    console.log('   npx firebase deploy --only firestore:indexes\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
})();
