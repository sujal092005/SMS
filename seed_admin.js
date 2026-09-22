import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function seedAdmin() {
  const loginId = 'ADMIN-0924';
  const email = 'admin-0924@ravs.school';
  const password = 'Admin@12345';

  console.log(`⚡ Connecting to Firebase project: ${firebaseConfig.projectId}...`);

  let user = null;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    user = cred.user;
    console.log(`✅ Admin account already exists in Firebase Auth (UID: ${user.uid}).`);
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        user = cred.user;
        console.log(`🎉 Successfully created Admin in Firebase Auth (UID: ${user.uid}).`);
      } catch (createErr) {
        console.error('❌ Failed to create Auth user:', createErr.message);
        process.exit(1);
      }
    } else {
      console.error('❌ Sign in check error:', err.message);
      process.exit(1);
    }
  }

  // Write users/{uid} document
  console.log('Writing Admin profile to Firestore: users/' + user.uid);
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    loginId: loginId,
    email: email,
    name: 'Dr. Arvind Sharma (Principal & Admin)',
    role: 'admin',
    phone: '+91 98765 43210',
    department: 'Central Administration',
    active: true,
    mustChangePassword: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // Write school/config
  console.log('Writing school configuration: school/config');
  await setDoc(doc(db, 'school', 'config'), {
    name: 'RAVS Smart School',
    maxUsers: 500,
    currentUserCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  // Write default classes
  const classes = ['5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'];
  for (const c of classes) {
    await setDoc(doc(db, 'classes', c), {
      classId: c,
      className: `Class ${c.slice(0, -1)}`,
      section: c.slice(-1),
      studentCount: 0,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  console.log('✨ All classes (5A through 12A) seeded successfully in Firestore.');
  console.log('\n=============================================');
  console.log('👑 ADMIN CREDENTIALS FOR TESTING:');
  console.log(`Login ID: ${loginId}`);
  console.log(`Password: ${password}`);
  console.log(`Email in Firebase Auth: ${email}`);
  console.log('=============================================\n');
}

seedAdmin().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
