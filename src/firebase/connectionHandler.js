import { getFirestore, enableIndexedDbPersistence, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

/**
 * Firebase Connection Handler
 * Manages Firebase connection state, offline capabilities, and timeout handling
 */
class FirebaseConnectionHandler {
  constructor(app) {
    this.app = app;
    this.db = getFirestore(app);
    this.auth = getAuth(app);
    this.isOnline = navigator.onLine;
    this.connectionTimeout = 15000; // 15 seconds timeout
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
    this.offlineMode = false;
    
    // Initialize listeners
    this.initNetworkListeners();
    this.initOfflineCapabilities();
  }

  /**
   * Initialize network status listeners
   */
  initNetworkListeners() {
    // Listen for online status changes
    window.addEventListener('online', () => {
      console.log('Device is online');
      this.isOnline = true;
      this.reconnectToFirebase();
    });

    window.addEventListener('offline', () => {
      console.log('Device is offline');
      this.isOnline = false;
      this.handleOfflineMode();
    });
  }

  /**
   * Initialize offline capabilities
   */
  async initOfflineCapabilities() {
    try {
      // Enable IndexedDB persistence for Firestore
      await enableIndexedDbPersistence(this.db);
      
      // Set local persistence for authentication
      await setPersistence(this.auth, browserLocalPersistence);
      
      console.log('Offline persistence enabled');
    } catch (error) {
      console.error('Error enabling offline persistence:', error);
      
      // If persistence fails due to multiple tabs, it's not critical
      if (error.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence only enabled in one tab');
      } else {
        console.error('Offline persistence failed:', error);
      }
    }
  }

  /**
   * Create a timeout promise that rejects after the specified time
   * @param {number} [timeout] - Optional custom timeout in milliseconds
   * @returns {Object} - Object containing the timeout promise and clear function
   */
  createTimeoutPromise(timeout = this.connectionTimeout) {
    let timeoutId;
    let isTimedOut = false;
    
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        isTimedOut = true;
        this.connectionAttempts++;
        console.warn(`Firebase connection timed out (Attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})`);
        
        if (this.connectionAttempts >= this.maxConnectionAttempts) {
          this.handleOfflineMode();
          reject(new Error('Firebase operation timed out after multiple attempts'));
        } else {
          reject(new Error('Firebase operation timed out'));
        }
      }, timeout);
    });
    
    const clearTimeout = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
    
    return { timeoutPromise, clearTimeout, isTimedOut };
  }

  /**
   * Handle offline mode
   */
  async handleOfflineMode() {
    if (!this.offlineMode) {
      this.offlineMode = true;
      console.log('Switching to offline mode');
      await disableNetwork(this.db);
      
      // Dispatch custom event for app components to react
      window.dispatchEvent(new CustomEvent('firebaseOffline', { 
        detail: { message: 'Firebase is offline. Working in local mode.' } 
      }));
    }
  }

  /**
   * Reconnect to Firebase
   */
  async reconnectToFirebase() {
    if (this.isOnline && this.offlineMode) {
      try {
        console.log('Attempting to reconnect to Firebase...');
        await enableNetwork(this.db);
        this.offlineMode = false;
        this.connectionAttempts = 0;
        
        // Dispatch custom event for app components to react
        window.dispatchEvent(new CustomEvent('firebaseOnline', { 
          detail: { message: 'Firebase connection restored.' } 
        }));
        
        console.log('Successfully reconnected to Firebase');
      } catch (error) {
        console.error('Failed to reconnect to Firebase:', error);
      }
    }
  }

  /**
   * Execute a Firebase operation with timeout handling
   * @param {Function} operation - The Firebase operation to execute
   * @param {Object} [offlineOptions] - Options for offline handling
   * @param {number} [customTimeout] - Optional custom timeout in milliseconds
   * @returns {Promise} - Result of the operation
   */
  async executeWithTimeout(operation, offlineOptions = {}, customTimeout) {
    // If we're already in offline mode, handle accordingly
    if (this.offlineMode) {
      console.log('Executing operation in offline mode');
      try {
        // Try to execute the operation using local persistence
        return await operation();
      } catch (error) {
        console.log('Operation failed in offline mode:', error);
        
        // Handle offline operations with provided options
        if (offlineOptions && offlineOptions.operationType) {
          console.log('Handling offline operation:', offlineOptions.operationType);
          // Store operation details for later sync
          if (offlineOptions.data) {
            try {
              // Store in localStorage as fallback
              const offlineOps = JSON.parse(localStorage.getItem('offlineOperations') || '[]');
              offlineOps.push({
                ...offlineOptions,
                timestamp: new Date().toISOString()
              });
              localStorage.setItem('offlineOperations', JSON.stringify(offlineOps));
              console.log('Operation queued for later sync');
            } catch (storageError) {
              console.error('Failed to store offline operation:', storageError);
            }
          }
        }
        throw error;
      }
    }

    // Online mode with timeout handling
    let operationPromise;
    const { timeoutPromise, clearTimeout, isTimedOut } = this.createTimeoutPromise(customTimeout);
    
    try {
      // Execute the operation with timeout race
      operationPromise = operation();
      const result = await Promise.race([
        operationPromise,
        timeoutPromise
      ]);
      
      // Clear timeout and reset attempts on success
      clearTimeout();
      this.connectionAttempts = 0;
      return result;
    } catch (error) {
      // Always clear the timeout to prevent memory leaks
      clearTimeout();
      
      // Handle timeout errors
      if (error.message.includes('timed out')) {
        console.warn('Firebase operation timed out');
        
        // If we haven't reached max attempts, retry
        if (this.connectionAttempts < this.maxConnectionAttempts) {
          console.log(`Retrying operation (Attempt ${this.connectionAttempts + 1}/${this.maxConnectionAttempts})`);
          // Exponential backoff for retries
          const backoffDelay = Math.min(1000 * (2 ** this.connectionAttempts), 10000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.executeWithTimeout(operation, offlineOptions, customTimeout);
        } else {
          // Switch to offline mode after max attempts
          await this.handleOfflineMode();
          
          // Store operation for later if offline options provided
          if (offlineOptions && offlineOptions.data) {
            try {
              const offlineOps = JSON.parse(localStorage.getItem('offlineOperations') || '[]');
              offlineOps.push({
                ...offlineOptions,
                timestamp: new Date().toISOString()
              });
              localStorage.setItem('offlineOperations', JSON.stringify(offlineOps));
              console.log('Operation queued for later sync');
            } catch (storageError) {
              console.error('Failed to store offline operation:', storageError);
            }
          }
          
          throw new Error('Firebase operation timed out. Working in offline mode now.');
        }
      }
      
      // For non-timeout errors, just throw the original error
      throw error;
    }
  }
}

export default FirebaseConnectionHandler;