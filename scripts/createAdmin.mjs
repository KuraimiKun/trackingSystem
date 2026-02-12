/**
 * Firebase Setup Script
 * 
 * This script helps you create the initial admin user.
 * Run it once after setting up Firebase.
 * 
 * Usage:
 * 1. Update the firebase config in src/config/firebase.js
 * 2. Run: node scripts/createAdmin.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Copy your Firebase config here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Admin user details
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_NAME = 'المدير العام';

async function createAdminUser() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('Creating admin user...');

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    const uid = userCredential.user.uid;
    console.log('Auth user created with UID:', uid);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', uid), {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'admin',
      phone: '',
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('User document created in Firestore');
    console.log('\n✅ Admin user created successfully!');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
