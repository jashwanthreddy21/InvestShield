import { auth, db, connectionHandler } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Register a new user
export const registerUser = async (email, password, name) => {
  try {
    // Create user in Firebase Auth with timeout handling
    const userCredential = await connectionHandler.executeWithTimeout(() => 
      createUserWithEmailAndPassword(auth, email, password)
    );
    
    // Update profile with name
    await connectionHandler.executeWithTimeout(() => 
      updateProfile(userCredential.user, { displayName: name })
    );
    
    // Create user document in Firestore
    await connectionHandler.executeWithTimeout(() => 
      setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        createdAt: new Date(),
      })
    );
    
    return userCredential.user;
  } catch (error) {
    // Handle offline mode
    if (error.message.includes('timed out')) {
      throw new Error('Firebase operation timed out. Please check your connection and try again.');
    }
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await connectionHandler.executeWithTimeout(() => 
      signInWithEmailAndPassword(auth, email, password)
    );
    return userCredential.user;
  } catch (error) {
    // Handle offline mode
    if (error.message.includes('timed out')) {
      throw new Error('Firebase operation timed out. Please check your connection and try again.');
    }
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await connectionHandler.executeWithTimeout(() => signOut(auth));
    return true;
  } catch (error) {
    // Handle offline mode
    if (error.message.includes('timed out')) {
      throw new Error('Firebase operation timed out. Please check your connection and try again.');
    }
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    throw error;
  }
};

// Auth state observer
export const authStateObserver = (callback) => {
  return onAuthStateChanged(auth, callback);
};