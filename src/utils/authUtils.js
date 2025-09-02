import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { loginSuccess, logoutAction as logout } from '../redux/actions/authActions';

// Initialize auth listener to keep Redux state in sync with Firebase Auth
export const initAuthListener = (store) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      store.dispatch(loginSuccess({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
    } else {
      // User is signed out
      store.dispatch(logout());
    }
  });
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

// Get current user ID
export const getCurrentUserId = () => {
  return auth.currentUser ? auth.currentUser.uid : null;
};

// Check if the user session has expired
export const hasSessionExpired = () => {
  const user = auth.currentUser;
  if (!user) return true;
  
  // Get the last authentication time if available
  const lastAuthTime = user.metadata?.lastSignInTime 
    ? new Date(user.metadata.lastSignInTime).getTime() 
    : null;
  
  if (!lastAuthTime) return false; // Can't determine, assume not expired
  
  const currentTime = new Date().getTime();
  const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return (currentTime - lastAuthTime) > sessionTimeout;
};

// Format Firebase auth error messages
export const formatAuthError = (error) => {
  const errorCode = error.code;
  let errorMessage = 'An unknown error occurred';

  switch (errorCode) {
    case 'auth/email-already-in-use':
      errorMessage = 'This email is already in use';
      break;
    case 'auth/invalid-email':
      errorMessage = 'Invalid email address';
      break;
    case 'auth/user-disabled':
      errorMessage = 'This account has been disabled';
      break;
    case 'auth/user-not-found':
      errorMessage = 'No account found with this email';
      break;
    case 'auth/wrong-password':
      errorMessage = 'Incorrect password';
      break;
    case 'auth/weak-password':
      errorMessage = 'Password is too weak';
      break;
    case 'auth/network-request-failed':
      errorMessage = 'Network error. Please check your connection';
      break;
    case 'auth/too-many-requests':
      errorMessage = 'Too many unsuccessful login attempts. Please try again later';
      break;
    default:
      errorMessage = error.message || 'An unknown error occurred';
  }

  return errorMessage;
};