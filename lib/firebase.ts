import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCw1RW8T-lakJQb7dZ_eKZ-7c_xIzyT6uI",
  authDomain: "tokmataacademy.firebaseapp.com",
  projectId: "tokmataacademy",
  storageBucket: "tokmataacademy.firebasestorage.app",
  messagingSenderId: "119497342626",
  appId: "1:119497342626:web:31ca5957aefc9cdd321fb",
  measurementId: "G-BT7YTDHBYG",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
