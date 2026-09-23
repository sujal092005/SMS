import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

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

const csvData = `login_id,name,password,parent_name,parent_number,class,section,roll
RAVS-10A-001,Rahul Sharma,2010-05-14,Suresh Sharma,9876543210,10,A,1
RAVS-10A-002,Priya Patil,2010-08-22,Anil Patil,9876543211,10,A,2
RAVS-10A-003,Aman Verma,2010-01-30,Rakesh Verma,9876543212,10,A,3
RAVS-10A-004,Sneha Joshi,2010-11-09,Mahesh Joshi,9876543213,10,A,4
RAVS-10A-005,Karan Deshmukh,2010-03-17,Vijay Deshmukh,9876543214,10,A,5
RAVS-10A-006,Isha Kulkarni,2010-06-25,Sanjay Kulkarni,9876543215,10,A,6
RAVS-10A-007,Rohan Pawar,2010-09-12,Ramesh Pawar,9876543216,10,A,7
RAVS-10A-008,Neha Shinde,2010-02-28,Prakash Shinde,9876543217,10,A,8
RAVS-10A-009,Aditya More,2010-07-04,Dilip More,9876543218,10,A,9
RAVS-10A-010,Pooja Bhosale,2010-12-19,Sunil Bhosale,9876543219,10,A,10`;

async function importData() {
  const lines = csvData.trim().split('\n').slice(1);
  const batch = writeBatch(db);
  let count = 0;

  for (const line of lines) {
    const [login_id_raw, name, password_raw, parent_name, parent_number, classNum, section, roll] = line.split(',');
    
    // Clean data
    const classId = `${classNum}${section}`; // '10A'
    const rollNo = roll.padStart(3, '0'); // '001'
    const login_id = `RAVS-${classId}-${rollNo}`; // standard format
    
    // Parse password from YYYY-MM-DD to DDMMYYYY
    const [yy, mm, dd] = password_raw.split('-');
    const password = `${dd}${mm}${yy}`;

    const studentDoc = {
      name,
      login_id: login_id,
      password: password,
      parent_name: parent_name,
      parent_number: parent_number,
      rollNo: rollNo,
      classId: classId,
      // Legacy compat fields
      loginId: login_id,
      parentName: parent_name,
      parentPhone: parent_number,
      dob: password,
      uid: login_id,
      id: login_id,
      active: true,
      mustChangePassword: false,
      createdAt: serverTimestamp()
    };

    // 1. Primary: class_student subcollection
    const destRef = doc(db, 'classes', classId, 'class_student', login_id);
    batch.set(destRef, studentDoc, { merge: true });

    // 2. Compat: flat students collection
    const compatRef = doc(db, 'students', login_id);
    batch.set(compatRef, studentDoc, { merge: true });
    
    count++;
  }

  await batch.commit();
  console.log(`✅ Successfully imported ${count} students to 10A.`);
  process.exit(0);
}

importData().catch(console.error);
