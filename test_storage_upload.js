import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAO7s3WIhIT_zlTxLmZmE4ZjYOgHXO5-Ow",
  authDomain: "ravssms-a5c7b.firebaseapp.com",
  projectId: "ravssms-a5c7b",
  storageBucket: "ravssms-a5c7b.appspot.com",
  messagingSenderId: "418513625094",
  appId: "1:418513625094:web:333089421df897174ba387"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testUpload() {
  console.log('Testing upload to bucket:', firebaseConfig.storageBucket);
  try {
    const dummyRef = ref(storage, `test_uploads/test_${Date.now()}.txt`);
    const buffer = Buffer.from('Hello Firebase Storage from test script');
    const snapshot = await uploadBytes(dummyRef, buffer);
    console.log('Upload snapshot success:', snapshot.ref.fullPath);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadUrl);
  } catch (err) {
    console.error('Storage upload failed:', err.code, err.message);
  }
}

testUpload();
