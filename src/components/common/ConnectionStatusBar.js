import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button } from '@mui/material';
import { connectionHandler } from '../../firebase/config';

/**
 * ConnectionStatusBar Component
 * Displays Firebase connection status and provides retry functionality
 */
const ConnectionStatusBar = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for online/offline status
    const handleOnline = () => {
      setIsOffline(false);
      setMessage('Connection restored. Syncing data...');
      setShowSnackbar(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => setShowSnackbar(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setMessage('You are offline. Some features may be limited.');
      setShowSnackbar(true);
    };

    // Listen for Firebase-specific online/offline events
    const handleFirebaseOffline = (event) => {
      setIsOffline(true);
      setMessage(event.detail.message || 'Firebase connection lost. Working in offline mode.');
      setShowSnackbar(true);
    };

    const handleFirebaseOnline = (event) => {
      setIsOffline(false);
      setMessage(event.detail.message || 'Firebase connection restored.');
      setShowSnackbar(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => setShowSnackbar(false), 3000);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('firebaseOffline', handleFirebaseOffline);
    window.addEventListener('firebaseOnline', handleFirebaseOnline);

    // Check initial status
    setIsOffline(!navigator.onLine);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('firebaseOffline', handleFirebaseOffline);
      window.removeEventListener('firebaseOnline', handleFirebaseOnline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      // Attempt to reconnect to Firebase
      connectionHandler.reconnectToFirebase();
      setMessage('Attempting to reconnect...');
    } else {
      setMessage('Still offline. Please check your internet connection.');
    }
  };

  const handleClose = () => {
    setShowSnackbar(false);
  };

  return (
    <Snackbar 
      open={showSnackbar} 
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 90, sm: 0 } }} // Adjust for mobile navigation
    >
      <Alert 
        severity={isOffline ? 'warning' : 'success'}
        action={
          isOffline && (
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          )
        }
        onClose={handleClose}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ConnectionStatusBar;