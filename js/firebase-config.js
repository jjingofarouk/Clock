// Initialize Firebase (Add to script.js)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: "AIzaSyBs_owPRHHRy2fPlbT0nT8zRyOWt1_VF5k",
    authDomain: "kindness-44d5d.firebaseapp.com",
    projectId: "kindness-44d5d",
    storageBucket: "kindness-44d5d.firebasestorage.app",
    messagingSenderId: "664744353279",
    appId: "1:664744353279:web:c17e3c7ac6e4106b931bca",
    measurementId: "G-TSSKVLD23F"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
