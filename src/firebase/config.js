// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import FirebaseConnectionHandler from './connectionHandler';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCD2SzkfSDh0vUlY9QK1_j4nh_lhJEam4",
  authDomain: "investshield-35123.firebaseapp.com",
  projectId: "investshield-35123",
  storageBucket: "investshield-35123.appspot.com",
  messagingSenderId: "965100376372",
  appId: "1:965100376372:web:accfc1158045e3161b1561",
  measurementId: "G-JFS33JQQJG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize connection handler for offline support and timeout handling
const connectionHandler = new FirebaseConnectionHandler(app);

export { auth, db, storage, connectionHandler };