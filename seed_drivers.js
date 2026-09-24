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

const INITIAL_DRIVERS = [
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

const INITIAL_BUSES = [
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

async function seedDrivers() {
  console.log('🚌 Seeding Drivers & Buses to Cloud Firestore (ravssms-a5c7b)...');

  // 1. Seed to 'drivers' and 'users' collections
  for (const driver of INITIAL_DRIVERS) {
    console.log(`👤 Seeding driver: ${driver.name} (${driver.loginId})...`);
    await setDoc(doc(db, 'drivers', driver.id), {
      ...driver,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, 'users', driver.id), {
      ...driver,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // 2. Seed to 'buses' collection
  for (const bus of INITIAL_BUSES) {
    console.log(`🚍 Seeding bus: ${bus.busNumber}...`);
    await setDoc(doc(db, 'buses', bus.id), {
      ...bus,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  console.log('\n✅ Driver data and Buses seeded successfully to Firestore!');
  console.log('=============================================');
  console.log('🔑 DRIVER LOGIN CREDENTIALS:');
  console.log('Driver 1: ID = DRV-RAJESH4 | Pass = Driver@123 (Bus 01)');
  console.log('Driver 2: ID = DRV-SURESH2 | Pass = Driver@123 (Bus 02)');
  console.log('=============================================\n');
}

seedDrivers().then(() => process.exit(0)).catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
