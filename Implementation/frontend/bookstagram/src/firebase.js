import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTLUkrFB_f0gndyfhhh2MmXnNyGszzodk",
  authDomain: "bookstagram-351c4.firebaseapp.com",
  projectId: "bookstagram-351c4",
  storageBucket: "bookstagram-351c4.firebasestorage.app",
  messagingSenderId: "248004802352",
  appId: "1:248004802352:web:a21a9470673a5d0091baf5",
  measurementId: "G-1JL9EWGT52"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();