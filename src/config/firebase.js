// Firebase configuration
// Replace these values with your actual Firebase project configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAFdPyUrVGojI9ZA6FghrmzdBVF2b3DPMg",
  authDomain: "trackingsystem-dd091.firebaseapp.com",
  projectId: "trackingsystem-dd091",
  storageBucket: "trackingsystem-dd091.firebasestorage.app",
  messagingSenderId: "889050990928",
  appId: "1:889050990928:web:0e3f43a060cdfa6ed00455",
  measurementId: "G-C2PNTXLHKV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
