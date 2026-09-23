import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';

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

async function cleanUpLegacyFields() {
  console.log('🧹 Cleaning up legacy fields from class_student...');
  const snap = await getDocs(collectionGroup(db, 'class_student'));
  let cleaned = 0;
  
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const hasLegacy = data.loginId || data.parentName || data.parentPhone || data.dob || data.uid || data.id;
    
    if (hasLegacy) {
      const docRef = docSnap.ref;
      await updateDoc(docRef, {
        loginId: deleteField(),
        parentName: deleteField(),
        parentPhone: deleteField(),
        dob: deleteField(),
        uid: deleteField(),
        id: deleteField()
      });
      cleaned++;
    }
  }
  
  console.log(`✅ Cleaned up ${cleaned} student documents.`);
  process.exit(0);
}

cleanUpLegacyFields().catch(console.error);
