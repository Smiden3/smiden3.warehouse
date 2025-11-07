import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBs7XPI7SzxI4__wFmoyufZDhc06u5N4M8",
  authDomain: "sklad-8e5db.firebaseapp.com",
  projectId: "sklad-8e5db",
  storageBucket: "sklad-8e5db.firebasestorage.app",
  messagingSenderId: "775573028322",
  appId: "1:775573028322:web:d2e8022d79e3998e1b4dbb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
