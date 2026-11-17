import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// إعدادات Firebase الخاصة بمنصة SEFT Lab
const firebaseConfig = {
  apiKey: "AIzaSyBa_B71uvrjeNOOrR0o7oZ7zgfmcENZJ8o",
  authDomain: "seftlab.firebaseapp.com",
  projectId: "seftlab",
  storageBucket: "seftlab.firebasestorage.app",
  messagingSenderId: "974517930241",
  appId: "1:974517930241:web:c5fa65ead74bf8eb567300",
  measurementId: "G-NWJ8N9RQK7",
};

// تهيئة Firebase بأمان
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// تهيئة Google Provider مع إظهار نافذة اختيار الحساب دائماً
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;
