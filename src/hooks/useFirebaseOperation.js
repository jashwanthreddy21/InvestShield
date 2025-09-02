import { useState, useCallback } from 'react';
import { connectionHandler } from '../firebase/config';
import offlineSyncManager from '../utils/offlineSync';

/**
 * Custom hook for handling Firebase operations with offline support
 * @returns {Object} Firebase operation utilities
 */
const useFirebaseOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute a Firebase operation with timeout and offline handling
   * @param {Function} operation - The operation to execute
   * @param {Object} options - Options for the operation
   * @returns {Promise<any>} - Result of the operation
   */
  const executeOperation = useCallback(async (operation, options = {}) => {
    const { offlineFallback = true, queueOffline = true, operationMeta = {} } = options;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to execute with timeout handling
      const result = await connectionHandler.executeWithTimeout(operation);
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Firebase operation error:', error);
      
      // Check if it's a timeout or offline error
      const isOfflineError = 
        error.message.includes('timed out') || 
        error.message.includes('network error') ||
        error.code === 'failed-precondition' ||
        !navigator.onLine;
      
      if (isOfflineError && queueOffline && operationMeta.type && operationMeta.path) {
        // Queue operation for later sync
        offlineSyncManager.queueOperation({
          type: operationMeta.type,
          path: operationMeta.path,
          data: operationMeta.data || {}
        });
        
        setError({
          message: 'Operation queued for when you\'re back online',
          isOffline: true
        });
      } else {
        setError({
          message: error.message,
          isOffline: isOfflineError
        });
      }
      
      setLoading(false);
      
      // If offline fallback is provided, return it
      if (offlineFallback && options.fallbackData !== undefined) {
        return options.fallbackData;
      }
      
      throw error;
    }
  }, []);

  return {
    loading,
    error,
    executeOperation,
    isOffline: !navigator.onLine || connectionHandler.offlineMode
  };
};

export default useFirebaseOperation;