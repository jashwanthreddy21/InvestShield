import { db, connectionHandler } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import offlineSyncManager from '../utils/offlineSync';

// Collection references
const socialMediaTipsRef = collection(db, 'socialMediaTips');
const marketActivityRef = collection(db, 'marketActivity');
const monitoringConfigRef = collection(db, 'monitoringConfig');

/**
 * Monitor and store social media stock tips
 * @param {Object} tipData - Data about the social media tip
 * @returns {Promise<Object>} - Added tip with ID
 */
export const addSocialMediaTip = async (tipData) => {
  try {
    // Add timestamp and initial analysis status
    const tipWithMeta = {
      ...tipData,
      timestamp: serverTimestamp(),
      analysisStatus: 'pending',
      suspiciousScore: null,
      linkedMarketActivity: [],
      verificationHistory: []
    };
    
    // Use connection handler with timeout and offline support
    const docRef = await connectionHandler.executeWithTimeout(
      () => addDoc(socialMediaTipsRef, tipWithMeta),
      {
        operationType: 'create',
        collectionPath: 'socialMediaTips',
        data: tipWithMeta
      }
    );
    
    return {
      id: docRef.id,
      ...tipWithMeta
    };
  } catch (error) {
    console.error('Error adding social media tip:', error);
    
    // Handle offline scenario
    if (error.message.includes('timed out') || !navigator.onLine) {
      // Queue for later sync
      const tempId = `temp_${Date.now()}`;
      offlineSyncManager.queueOperation({
        type: 'create',
        path: 'socialMediaTips',
        data: tipWithMeta
      });
      
      // Return temporary data for UI
      return {
        id: tempId,
        ...tipWithMeta,
        _isOffline: true,
        timestamp: new Date().toISOString()
      };
    }
    
    throw error;
  }
};

/**
 * Get social media tips with optional filtering
 * @param {Object} filters - Optional filters (platform, date range, etc.)
 * @param {number} limitCount - Number of tips to retrieve
 * @returns {Promise<Array>} - Array of tip objects
 */
export const getSocialMediaTips = async (filters = {}, limitCount = 50) => {
  try {
    let q = query(socialMediaTipsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    // Apply filters if provided
    if (filters.platform) {
      q = query(q, where('platform', '==', filters.platform));
    }
    
    if (filters.startDate && filters.endDate) {
      q = query(q, 
        where('timestamp', '>=', filters.startDate),
        where('timestamp', '<=', filters.endDate)
      );
    }
    
    if (filters.analysisStatus) {
      q = query(q, where('analysisStatus', '==', filters.analysisStatus));
    }

    if (filters.suspiciousScoreMin) {
      q = query(q, where('suspiciousScore', '>=', filters.suspiciousScoreMin));
    }
    
    // Use connection handler with timeout and offline support
    const querySnapshot = await connectionHandler.executeWithTimeout(
      () => getDocs(q),
      { operationType: 'read', collectionPath: 'socialMediaTips' }
    );
    
    // Get results from Firebase
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // If we're offline, add any pending operations
    if (!navigator.onLine || connectionHandler.offlineMode) {
      const pendingTips = offlineSyncManager.getPendingOperations('socialMediaTips', 'create');
      
      // Add pending tips to results
      pendingTips.forEach(op => {
        results.push({
          id: `temp_${op.timestamp}`,
          ...op.data,
          _isOffline: true,
          timestamp: new Date(op.timestamp).toISOString()
        });
      });
      
      // Sort by timestamp (newest first)
      results.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return timeB - timeA;
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error getting social media tips:', error);
    
    // If offline, return cached data if available
    if (error.message.includes('timed out') || !navigator.onLine) {
      console.log('Returning offline data for social media tips');
      return offlineSyncManager.getCachedData('socialMediaTips') || [];
    }
    
    throw error;
  }
};

/**
 * Record unusual market activity
 * @param {Object} activityData - Data about the market activity
 * @returns {Promise<Object>} - Added activity with ID
 */
export const recordMarketActivity = async (activityData) => {
  try {
    // Add timestamp and initial analysis status
    const activityWithMeta = {
      ...activityData,
      timestamp: serverTimestamp(),
      analysisStatus: 'pending',
      linkedTips: [],
      analysisHistory: []
    };
    
    const docRef = await addDoc(marketActivityRef, activityWithMeta);
    return {
      id: docRef.id,
      ...activityWithMeta
    };
  } catch (error) {
    console.error('Error recording market activity:', error);
    throw error;
  }
};

/**
 * Get market activity with optional filtering
 * @param {Object} filters - Optional filters (stock, date range, etc.)
 * @param {number} limitCount - Number of activities to retrieve
 * @returns {Promise<Array>} - Array of activity objects
 */
export const getMarketActivity = async (filters = {}, limitCount = 50) => {
  try {
    let q = query(marketActivityRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    // Apply filters if provided
    if (filters.stock) {
      q = query(q, where('stock', '==', filters.stock));
    }
    
    if (filters.startDate && filters.endDate) {
      q = query(q, 
        where('timestamp', '>=', filters.startDate),
        where('timestamp', '<=', filters.endDate)
      );
    }
    
    if (filters.analysisStatus) {
      q = query(q, where('analysisStatus', '==', filters.analysisStatus));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting market activity:', error);
    throw error;
  }
};

/**
 * Link social media tip to market activity
 * @param {string} tipId - Social media tip ID
 * @param {string} activityId - Market activity ID
 * @returns {Promise<void>}
 */
export const linkTipToActivity = async (tipId, activityId) => {
  try {
    const tipRef = doc(db, 'socialMediaTips', tipId);
    const activityRef = doc(db, 'marketActivity', activityId);
    
    // Get current data
    const tipDoc = await getDocs(tipRef);
    const activityDoc = await getDocs(activityRef);
    
    if (!tipDoc.exists() || !activityDoc.exists()) {
      throw new Error('Tip or activity not found');
    }
    
    const tipData = tipDoc.data();
    const activityData = activityDoc.data();
    
    // Update tip with linked activity
    await updateDoc(tipRef, {
      linkedMarketActivity: [...(tipData.linkedMarketActivity || []), {
        id: activityId,
        timestamp: serverTimestamp(),
        stockSymbol: activityData.stock,
        activityType: activityData.type
      }]
    });
    
    // Update activity with linked tip
    await updateDoc(activityRef, {
      linkedTips: [...(activityData.linkedTips || []), {
        id: tipId,
        timestamp: serverTimestamp(),
        platform: tipData.platform,
        author: tipData.author
      }]
    });
  } catch (error) {
    console.error('Error linking tip to activity:', error);
    throw error;
  }
};

/**
 * Update social media tip analysis
 * @param {string} id - Tip ID
 * @param {Object} analysisData - Analysis data including status and score
 * @returns {Promise<void>}
 */
export const updateTipAnalysis = async (id, analysisData) => {
  try {
    const tipRef = doc(db, 'socialMediaTips', id);
    
    // Add analysis event to history
    const analysisEvent = {
      timestamp: serverTimestamp(),
      status: analysisData.status,
      score: analysisData.suspiciousScore,
      method: analysisData.method,
      notes: analysisData.notes
    };
    
    await updateDoc(tipRef, {
      analysisStatus: analysisData.status,
      suspiciousScore: analysisData.suspiciousScore,
      verificationHistory: analysisData.appendToHistory ? 
        [...(analysisData.currentHistory || []), analysisEvent] : 
        [analysisEvent],
      lastAnalyzed: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating tip analysis:', error);
    throw error;
  }
};

/**
 * Calculate suspicious score for social media tip
 * @param {Object} tipData - Tip data
 * @param {Object} marketData - Related market data
 * @returns {number} - Suspicious score (0-100)
 */
export const calculateSuspiciousScore = (tipData, marketData = {}) => {
  // Base score starts at 30 (somewhat suspicious by default)
  let score = 30;
  
  // This is a placeholder for the actual scoring algorithm
  // In a real implementation, this would include:
  // 1. Analysis of tip content and claims
  // 2. Author credibility and history
  // 3. Timing relative to market movements
  // 4. Correlation with other suspicious tips
  // 5. Unusual trading patterns following the tip
  
  // Example scoring factors:
  
  // Author credibility (verified accounts are less suspicious)
  if (tipData.authorVerified) {
    score -= 15;
  }
  
  // New accounts are more suspicious
  if (tipData.authorAccountAge && tipData.authorAccountAge < 30) { // less than 30 days
    score += 20;
  }
  
  // Unusual market activity following the tip increases suspicion
  if (marketData.unusualVolume) {
    score += 15;
  }
  
  // Extreme claims increase suspicion
  if (tipData.content && (tipData.content.includes('guaranteed') || 
                         tipData.content.includes('100%') ||
                         tipData.content.includes('double your money'))) {
    score += 25;
  }
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, score));
};

/**
 * Setup social media monitoring configuration
 * @param {Object} config - Configuration object with monitoring settings
 * @returns {Promise<Object>} - The saved configuration
 */
export const setupSocialMediaMonitoring = async (config) => {
  try {
    // Validate required fields
    if (!config.platforms || config.platforms.length === 0) {
      throw new Error('At least one social media platform must be selected');
    }
    
    if (!config.duration || config.duration < 1) {
      throw new Error('Monitoring duration must be at least 1 day');
    }
    
    // Add metadata
    const configWithMeta = {
      ...config,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      monitoringEndDate: new Date(Date.now() + (config.duration * 24 * 60 * 60 * 1000)) // Current time + duration in days
    };
    
    // Save to Firestore - use a specific document ID for the current user's config
    // In a real app, you would use the user's ID here
    const configId = 'current-config';
    
    // Add a timeout promise to detect if Firestore operation is taking too long
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Firebase operation timed out. Please check your connection and try again.'));
      }, 8000); // 8 seconds timeout - increased for better reliability
    });
    
    // Create a retry mechanism for Firestore operations
    const performFirestoreOperation = async (retries = 2) => {
      try {
        return await setDoc(doc(monitoringConfigRef, configId), configWithMeta);
      } catch (error) {
        if (retries > 0 && (error.code === 'unavailable' || error.code === 'deadline-exceeded')) {
          console.log(`Retrying Firestore operation, ${retries} attempts left`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
          return performFirestoreOperation(retries - 1);
        }
        throw error;
      }
    };
    
    // Race between the actual operation (with retries) and the timeout
    await Promise.race([
      performFirestoreOperation(),
      timeoutPromise
    ]);
    
    // Store configuration in localStorage as a fallback
    try {
      localStorage.setItem('monitoringConfig', JSON.stringify({
        ...configWithMeta,
        // Convert timestamps to strings for localStorage
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Failed to save config to localStorage:', e);
    }
    
    // Generate some initial sample tips for demonstration purposes
    // This would be removed in a production environment where real data is collected
    // Commented out to prevent generating default tips
    // await generateSampleTips(config.platforms, config.keywords);
    
    return {
      id: configId,
      ...configWithMeta
    };
  } catch (error) {
    console.error('Error setting up social media monitoring:', error);
    throw error;
  }
};

/**
 * Get the current monitoring configuration
 * @returns {Promise<Object|null>} - The current configuration or null if not set
 */
export const getMonitoringConfig = async () => {
  try {
    const configId = 'current-config';
    const configDoc = await getDocs(doc(monitoringConfigRef, configId));
    
    if (configDoc.exists()) {
      return {
        id: configDoc.id,
        ...configDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting monitoring configuration:', error);
    throw error;
  }
};

/**
 * Generate sample social media tips for demonstration purposes
 * This function would be removed in a production environment
 * @param {Array} platforms - Platforms to generate tips for
 * @param {Array} keywords - Keywords to include in tips
 * @returns {Promise<void>}
 */
const generateSampleTips = async (platforms, keywords = []) => {
  try {
    const sampleTips = [];
    const stocks = ['AAPL', 'TSLA', 'AMZN', 'MSFT', 'GOOGL', 'META'];
    const authors = ['investor123', 'stockguru', 'marketwhiz', 'tradepro', 'financeexpert'];
    
    // Generate 1-3 tips per platform
    for (const platform of platforms) {
      const tipsCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < tipsCount; i++) {
        const stock = stocks[Math.floor(Math.random() * stocks.length)];
        const author = authors[Math.floor(Math.random() * authors.length)];
        const suspiciousScore = Math.floor(Math.random() * 100);
        const isVerified = Math.random() > 0.7; // 30% chance of being verified
        
        // Create content based on keywords if available
        let content = `Check out ${stock}! I think it's going to move soon.`;
        if (keywords.length > 0) {
          const keyword = keywords[Math.floor(Math.random() * keywords.length)];
          content = `${keyword} alert for ${stock}! This stock is about to make a big move.`;
        }
        
        // Add some variety to the tips
        if (Math.random() > 0.7) {
          content = `INSIDER INFO: ${stock} will announce something big next week! Get in now!`;
        }
        
        const tip = {
          platform,
          author,
          authorVerified: isVerified,
          authorAccountAge: Math.floor(Math.random() * 365) + 1, // 1-365 days
          content,
          stockSymbol: stock,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000), // Random time in last 48 hours
          analysisStatus: ['pending', 'analyzed', 'verified'][Math.floor(Math.random() * 3)],
          suspiciousScore,
          linkedMarketActivity: [],
          verificationHistory: []
        };
        
        sampleTips.push(tip);
      }
    }
    
    // Add the sample tips to Firestore
    for (const tip of sampleTips) {
      await addDoc(socialMediaTipsRef, tip);
    }
    
    console.log(`Generated ${sampleTips.length} sample tips for demonstration`);
  } catch (error) {
    console.error('Error generating sample tips:', error);
    // Don't throw here, as this is just for demonstration
  }
};