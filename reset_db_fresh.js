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

  // 4. Seed clean Drivers & Fleet
  const initialDrivers = [
    {
      id: 'drv_01',
      loginId: 'DRV-RAJESH4',
      name: 'Rajesh Kumar',
      driverName: 'Rajesh Kumar',
      phone: '9876543210',
      driverPhone: '+91 98765 43210',
      password: 'Driver@123',
      busId: 'BUS-01',
      assignedBus: 'BUS-01',
      licenseNumber: 'MH-04-2018-0098765',
      role: 'driver',
      active: true
    },
    {
      id: 'drv_02',
      loginId: 'DRV-SURESH2',
      name: 'Suresh Patil',
      driverName: 'Suresh Patil',
      phone: '9876543211',
      driverPhone: '+91 98765 43211',
      password: 'Driver@123',
      busId: 'BUS-02',
      assignedBus: 'BUS-02',
      licenseNumber: 'MH-04-2019-0012345',
      role: 'driver',
      active: true
    }
  ];

  for (const drv of initialDrivers) {
    await setDoc(doc(db, 'drivers', drv.id), { ...drv, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    await setDoc(doc(db, 'users', drv.id), { ...drv, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }

  const initialBuses = [
    {
      id: 'BUS-01',
      busId: 'BUS-01',
      busNumber: 'Bus 01 - North Campus Route',
      plateNumber: 'MH-04-AB-1234',
      route: 'City Center ➔ West Hills ➔ Main Campus',
      driverName: 'Rajesh Kumar',
      driverPhone: '+91 98765 43210',
      driverId: 'drv_01',
      capacity: '40 Seats',
      status: 'STANDBY',
      lat: 18.5204,
      lng: 73.8567,
      speed: 0
    },
    {
      id: 'BUS-02',
      busId: 'BUS-02',
      busNumber: 'Bus 02 - South Suburb Express',
      plateNumber: 'MH-04-CD-5678',
      route: 'Railway Station ➔ South Extension ➔ Main Campus',
      driverName: 'Suresh Patil',
      driverPhone: '+91 98765 43211',
      driverId: 'drv_02',
      capacity: '45 Seats',
      status: 'STANDBY',
      lat: 18.5304,
      lng: 73.8667,
      speed: 0
    }
  ];

  for (const bus of initialBuses) {
    await setDoc(doc(db, 'buses', bus.id), { ...bus, updatedAt: serverTimestamp() });
  }

  console.log('✨ Clean database structure initialized successfully!');
  console.log('\n=============================================');
  console.log('🔑 FRESH ADMIN & DRIVER CREDENTIALS:');
  console.log(`Admin: ID = ${adminLoginId} | Pass = ${adminPassword}`);
  console.log('Driver 1: ID = DRV-RAJESH4 | Pass = Driver@123 (Bus 01)');
  console.log('Driver 2: ID = DRV-SURESH2 | Pass = Driver@123 (Bus 02)');
  console.log('=============================================\n');
}

resetDatabaseFresh().then(() => process.exit(0)).catch(err => {
  console.error('Reset error:', err);
  process.exit(1);
});
