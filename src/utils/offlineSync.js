import { db } from '../firebase/config';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

/**
 * Offline Synchronization Utility
 * Manages data synchronization between offline and online states
 */
class OfflineSyncManager {
  constructor() {
    this.pendingOperations = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Initialize from localStorage
    this.loadPendingOperations();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for online/offline status
   */
  setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    window.addEventListener('firebaseOnline', this.handleOnline.bind(this));
    window.addEventListener('firebaseOffline', this.handleOffline.bind(this));
  }
  
  /**
   * Handle online status
   */
  async handleOnline() {
    this.isOnline = true;
    console.log('OfflineSyncManager: Device is online');
    
    try {
      await enableNetwork(db);
      this.syncPendingOperations();
    } catch (error) {
      console.error('OfflineSyncManager: Error enabling network:', error);
    }
  }
  
  /**
   * Handle offline status
   */
  async handleOffline() {
    this.isOnline = false;
    console.log('OfflineSyncManager: Device is offline');
    
    try {
      await disableNetwork(db);
    } catch (error) {
      console.error('OfflineSyncManager: Error disabling network:', error);
    }
  }
  
  /**
   * Add operation to pending queue
   * @param {Object} operation - Operation to queue
   */
  queueOperation(operation) {
    this.pendingOperations.push({
      ...operation,
      timestamp: Date.now(),
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    this.savePendingOperations();
    console.log(`OfflineSyncManager: Operation queued (${this.pendingOperations.length} pending)`);
    
    // If we're online, try to sync immediately
    if (this.isOnline && !this.syncInProgress) {
      this.syncPendingOperations();
    }
  }
  
  /**
   * Save pending operations to localStorage
   */
  savePendingOperations() {
    try {
      localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('OfflineSyncManager: Error saving pending operations:', error);
    }
  }
  
  /**
   * Load pending operations from localStorage
   */
  loadPendingOperations() {
    try {
      const saved = localStorage.getItem('pendingOperations');
      this.pendingOperations = saved ? JSON.parse(saved) : [];
      console.log(`OfflineSyncManager: Loaded ${this.pendingOperations.length} pending operations`);
    } catch (error) {
      console.error('OfflineSyncManager: Error loading pending operations:', error);
      this.pendingOperations = [];
    }
  }
  
  /**
   * Sync pending operations when online
   */
  async syncPendingOperations() {
    if (!this.isOnline || this.syncInProgress || this.pendingOperations.length === 0) {
      return;
    }
    
    this.syncInProgress = true;
    console.log(`OfflineSyncManager: Syncing ${this.pendingOperations.length} pending operations`);
    
    // Process operations in order (FIFO)
    const operationsToProcess = [...this.pendingOperations];
    
    for (const operation of operationsToProcess) {
      try {
        await this.processOperation(operation);
        
        // Remove from pending queue
        this.pendingOperations = this.pendingOperations.filter(op => op.id !== operation.id);
        this.savePendingOperations();
      } catch (error) {
        console.error(`OfflineSyncManager: Error processing operation ${operation.id}:`, error);
        
        // If we're offline again, stop processing
        if (!this.isOnline) {
          break;
        }
      }
    }
    
    this.syncInProgress = false;
    console.log(`OfflineSyncManager: Sync complete. ${this.pendingOperations.length} operations remaining`);
    
    // Dispatch event for UI to update
    if (operationsToProcess.length > 0 && this.pendingOperations.length === 0) {
      window.dispatchEvent(new CustomEvent('offlineSyncComplete', { 
        detail: { message: 'All pending changes have been synchronized.' } 
      }));
    }
  }
  
  /**
   * Process a single operation
   * @param {Object} operation - Operation to process
   */
  async processOperation(operation) {
    const { type, path, data } = operation;
    
    switch (type) {
      case 'create':
        // Implementation depends on your Firebase structure
        console.log(`OfflineSyncManager: Processing create operation for ${path}`);
        // Example: await addDoc(collection(db, path), data);
        break;
        
      case 'update':
        console.log(`OfflineSyncManager: Processing update operation for ${path}`);
        // Example: await updateDoc(doc(db, path), data);
        break;
        
      case 'delete':
        console.log(`OfflineSyncManager: Processing delete operation for ${path}`);
        // Example: await deleteDoc(doc(db, path));
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }
  
  /**
   * Get all pending operations
   * @returns {Array} - List of pending operations
   */
  getPendingOperations() {
    return [...this.pendingOperations];
  }
  
  /**
   * Get count of pending operations
   * @returns {Number} - Number of pending operations
   */
  getPendingOperationCount() {
    return this.pendingOperations.length;
  }
}

// Create singleton instance
const offlineSyncManager = new OfflineSyncManager();

export default offlineSyncManager;