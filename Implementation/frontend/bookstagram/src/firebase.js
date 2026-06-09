import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXLFhsnpkQ9-0m1tHgZde1yrBAe7NSgC4",
  authDomain: "bookstagram-27ca2.firebaseapp.com",
  projectId: "bookstagram-27ca2",
  storageBucket: "bookstagram-27ca2.firebasestorage.app",
  messagingSenderId: "962462789288",
  appId: "1:962462789288:web:66ab40e94570c599c55c9d",
  measurementId: "G-MPWR00ELH6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();