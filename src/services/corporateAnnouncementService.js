import { db } from '../firebase/config';
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
  serverTimestamp 
} from 'firebase/firestore';

// Collection references
const announcementsRef = collection(db, 'corporateAnnouncements');

/**
 * Get corporate announcements with optional filtering
 * @param {Object} filters - Optional filters (company, date range, etc.)
 * @param {number} limitCount - Number of announcements to retrieve
 * @returns {Promise<Array>} - Array of announcement objects
 */
export const getAnnouncements = async (filters = {}, limitCount = 50) => {
  try {
    let q = query(announcementsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    // Apply filters if provided
    if (filters.company) {
      q = query(q, where('companyId', '==', filters.company));
    }
    
    if (filters.startDate && filters.endDate) {
      q = query(q, 
        where('timestamp', '>=', filters.startDate),
        where('timestamp', '<=', filters.endDate)
      );
    }
    
    if (filters.verificationStatus) {
      q = query(q, where('verificationStatus', '==', filters.verificationStatus));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting announcements:', error);
    throw error;
  }
};

/**
 * Cross-verify announcement with counter-party listed company
 * @param {string} announcementId - Announcement ID
 * @param {string} counterPartyCompanyId - Counter-party company ID
 * @param {Object} verificationData - Verification data
 * @returns {Promise<Object>} - Verification result
 */
export const verifyWithCounterParty = async (announcementId, counterPartyCompanyId, verificationData) => {
  try {
    const announcementRef = doc(db, 'corporateAnnouncements', announcementId);
    
    // Add verification event
    const verificationEvent = {
      timestamp: serverTimestamp(),
      counterPartyCompanyId,
      status: verificationData.status,
      notes: verificationData.notes,
      method: 'counter-party-verification'
    };
    
    // Update announcement with counter-party verification
    await updateDoc(announcementRef, {
      counterPartyVerified: verificationData.status === 'confirmed',
      verificationHistory: verificationData.appendToHistory ? 
        [...(verificationData.currentHistory || []), verificationEvent] : 
        [verificationEvent],
      lastVerified: serverTimestamp()
    });
    
    return {
      id: announcementId,
      counterPartyVerified: verificationData.status === 'confirmed',
      verificationEvent
    };
  } catch (error) {
    console.error('Error verifying with counter-party:', error);
    throw error;
  }
};

/**
 * Analyze announcement content for credibility
 * @param {string} announcementId - Announcement ID
 * @param {Object} contentAnalysis - Content analysis data
 * @returns {Promise<Object>} - Analysis result
 */
export const analyzeAnnouncementContent = async (announcementId, contentAnalysis) => {
  try {
    const announcementRef = doc(db, 'corporateAnnouncements', announcementId);
    
    // Update announcement with content analysis
    await updateDoc(announcementRef, {
      contentAnalysis: {
        vague: contentAnalysis.vague || false,
        promotional: contentAnalysis.promotional || false,
        exaggerated: contentAnalysis.exaggerated || false,
        precise: contentAnalysis.precise || false,
        detailed: contentAnalysis.detailed || false,
        analysisTimestamp: serverTimestamp()
      }
    });
    
    return {
      id: announcementId,
      contentAnalysis
    };
  } catch (error) {
    console.error('Error analyzing announcement content:', error);
    throw error;
  }
};

/**
 * Check announcement against historical filings
 * @param {string} announcementId - Announcement ID
 * @param {Object} historicalData - Historical data for comparison
 * @returns {Promise<Object>} - Comparison result
 */
export const checkAgainstHistoricalFilings = async (announcementId, historicalData) => {
  try {
    const announcementRef = doc(db, 'corporateAnnouncements', announcementId);
    
    // Add historical check event
    const historicalCheckEvent = {
      timestamp: serverTimestamp(),
      performanceConsistency: historicalData.performanceConsistency,
      suddenDramaticClaims: historicalData.suddenDramaticClaims,
      notes: historicalData.notes,
      method: 'historical-filing-check'
    };
    
    // Update announcement with historical check
    await updateDoc(announcementRef, {
      historicalCheckResult: {
        performanceConsistency: historicalData.performanceConsistency,
        suddenDramaticClaims: historicalData.suddenDramaticClaims,
        checkTimestamp: serverTimestamp()
      },
      verificationHistory: historicalData.appendToHistory ? 
        [...(historicalData.currentHistory || []), historicalCheckEvent] : 
        [historicalCheckEvent]
    });
    
    return {
      id: announcementId,
      historicalCheckResult: {
        performanceConsistency: historicalData.performanceConsistency,
        suddenDramaticClaims: historicalData.suddenDramaticClaims
      }
    };
  } catch (error) {
    console.error('Error checking against historical filings:', error);
    throw error;
  }
};

/**
 * Check announcement against public domain information
 * @param {string} announcementId - Announcement ID
 * @param {Object} publicDomainData - Public domain data
 * @returns {Promise<Object>} - Check result
 */
export const checkAgainstPublicDomain = async (announcementId, publicDomainData) => {
  try {
    const announcementRef = doc(db, 'corporateAnnouncements', announcementId);
    
    // Add public domain check event
    const publicDomainCheckEvent = {
      timestamp: serverTimestamp(),
      consistentWithPublicInfo: publicDomainData.consistentWithPublicInfo,
      unusualMarketActivityBefore: publicDomainData.unusualMarketActivityBefore,
      sources: publicDomainData.sources || [],
      notes: publicDomainData.notes,
      method: 'public-domain-check'
    };
    
    // Update announcement with public domain check
    await updateDoc(announcementRef, {
      publicDomainCheckResult: {
        consistentWithPublicInfo: publicDomainData.consistentWithPublicInfo,
        unusualMarketActivityBefore: publicDomainData.unusualMarketActivityBefore,
        sources: publicDomainData.sources || [],
        checkTimestamp: serverTimestamp()
      },
      verificationHistory: publicDomainData.appendToHistory ? 
        [...(publicDomainData.currentHistory || []), publicDomainCheckEvent] : 
        [publicDomainCheckEvent]
    });
    
    return {
      id: announcementId,
      publicDomainCheckResult: {
        consistentWithPublicInfo: publicDomainData.consistentWithPublicInfo,
        unusualMarketActivityBefore: publicDomainData.unusualMarketActivityBefore,
        sources: publicDomainData.sources || []
      }
    };
  } catch (error) {
    console.error('Error checking against public domain:', error);
    throw error;
  }
};

/**
 * Alert media houses and investors about fraudulent announcements
 * @param {string} announcementId - Announcement ID
 * @param {Object} alertData - Alert data
 * @returns {Promise<Object>} - Alert result
 */
export const sendFraudulentAnnouncementAlert = async (announcementId, alertData) => {
  try {
    const announcementRef = doc(db, 'corporateAnnouncements', announcementId);
    
    // Add alert event
    const alertEvent = {
      timestamp: serverTimestamp(),
      recipients: alertData.recipients || [],
      alertType: alertData.alertType,
      message: alertData.message,
      evidenceIds: alertData.evidenceIds || []
    };
    
    // Create alert document
    const alertsRef = collection(db, 'fraudAlerts');
    const alertDocRef = await addDoc(alertsRef, {
      announcementId,
      ...alertEvent,
      status: 'sent'
    });
    
    // Update announcement with alert reference
    await updateDoc(announcementRef, {
      alerts: alertData.appendToAlerts ? 
        [...(alertData.currentAlerts || []), {
          id: alertDocRef.id,
          ...alertEvent
        }] : 
        [{
          id: alertDocRef.id,
          ...alertEvent
        }]
    });
    
    return {
      id: alertDocRef.id,
      announcementId,
      ...alertEvent
    };
  } catch (error) {
    console.error('Error sending fraudulent announcement alert:', error);
    throw error;
  }
};


/**
 * Add a new corporate announcement
 * @param {Object} announcement - Announcement data
 * @returns {Promise<Object>} - Added announcement with ID
 */
export const addAnnouncement = async (announcement) => {
  try {
    // Add timestamp and initial verification status
    const announcementWithMeta = {
      ...announcement,
      timestamp: serverTimestamp(),
      verificationStatus: 'pending',
      credibilityScore: null,
      verificationHistory: [],
      crossReferences: []
    };
    
    const docRef = await addDoc(announcementsRef, announcementWithMeta);
    return {
      id: docRef.id,
      ...announcementWithMeta
    };
  } catch (error) {
    console.error('Error adding announcement:', error);
    throw error;
  }
};

/**
 * Update announcement verification status and credibility score
 * @param {string} id - Announcement ID
 * @param {Object} verificationData - Verification data including status and score
 * @returns {Promise<void>}
 */
export const updateAnnouncementVerification = async (id, verificationData) => {
  try {
    const announcementRef = doc(db, 'corporateAnnouncements', id);
    
    // Add verification event to history
    const verificationEvent = {
      timestamp: serverTimestamp(),
      status: verificationData.status,
      score: verificationData.credibilityScore,
      method: verificationData.method,
      notes: verificationData.notes
    };
    
    await updateDoc(announcementRef, {
      verificationStatus: verificationData.status,
      credibilityScore: verificationData.credibilityScore,
      verificationHistory: verificationData.appendToHistory ? 
        [...(verificationData.currentHistory || []), verificationEvent] : 
        [verificationEvent],
      lastVerified: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating announcement verification:', error);
    throw error;
  }
};

/**
 * Add cross-reference to an announcement
 * @param {string} id - Announcement ID
 * @param {Object} reference - Reference data (source, link, etc.)
 * @returns {Promise<void>}
 */
export const addCrossReference = async (id, reference) => {
  try {
    const announcementRef = doc(db, 'corporateAnnouncements', id);
    
    // Add reference with timestamp
    const referenceWithTimestamp = {
      ...reference,
      timestamp: serverTimestamp()
    };
    
    await updateDoc(announcementRef, {
      crossReferences: reference.appendToReferences ? 
        [...(reference.currentReferences || []), referenceWithTimestamp] : 
        [referenceWithTimestamp]
    });
  } catch (error) {
    console.error('Error adding cross-reference:', error);
    throw error;
  }
};

/**
 * Get announcements that need verification
 * @param {number} limitCount - Number of announcements to retrieve
 * @returns {Promise<Array>} - Array of announcement objects
 */
export const getAnnouncementsNeedingVerification = async (limitCount = 20) => {
  try {
    const q = query(
      announcementsRef, 
      where('verificationStatus', '==', 'pending'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting announcements needing verification:', error);
    throw error;
  }
};

/**
 * Calculate credibility score based on various factors
 * @param {Object} announcement - Announcement data
 * @param {Object} historicalData - Historical data for comparison
 * @returns {number} - Credibility score (0-100)
 */
export const calculateCredibilityScore = (announcement, historicalData = {}, publicDomainData = {}) => {
  // Base score starts at 50 (neutral)
  let score = 50;
  
  // Enhanced scoring algorithm that includes:
  // 1. Comparison with historical performance
  // 2. Cross-verification with other sources
  // 3. Analysis of announcement content and claims
  // 4. Checking for unusual timing or circumstances
  // 5. Verification from counter-party listed companies
  // 6. Information consistency with public domain data
  
  // Cross-references increase credibility
  if (announcement.crossReferences && announcement.crossReferences.length > 0) {
    score += Math.min(announcement.crossReferences.length * 5, 20);
    
    // Additional points for high-quality references (official sources)
    const officialSources = announcement.crossReferences.filter(ref => 
      ref.sourceType === 'official' || ref.sourceType === 'regulatory'
    ).length;
    
    score += Math.min(officialSources * 3, 15);
  }
  
  // Historical performance consistency
  if (historicalData.performanceConsistency) {
    score += 15;
  } else if (historicalData.performanceConsistency === false) {
    score -= 20;
  }
  
  // Sudden dramatic claims inconsistent with past performance
  if (historicalData.suddenDramaticClaims) {
    score -= 25;
  }
  
  // Counter-party verification
  if (announcement.counterPartyVerified) {
    score += 20;
  } else if (announcement.counterPartyVerified === false) {
    score -= 30; // Strong negative if counter-party explicitly contradicts
  }
  
  // Public domain information consistency
  if (publicDomainData.consistentWithPublicInfo) {
    score += 10;
  } else if (publicDomainData.consistentWithPublicInfo === false) {
    score -= 15;
  }
  
  // Timing factors
  if (announcement.releasedAfterHours && announcement.containsMaterialInfo) {
    score -= 5; // Slightly suspicious for material info released after hours
  }
  
  // Unusual market activity before announcement (potential leak)
  if (publicDomainData.unusualMarketActivityBefore) {
    score -= 10;
  }
  
  // Language analysis (vague, promotional, or exaggerated language)
  if (announcement.contentAnalysis) {
    if (announcement.contentAnalysis.vague) score -= 5;
    if (announcement.contentAnalysis.promotional) score -= 10;
    if (announcement.contentAnalysis.exaggerated) score -= 15;
    if (announcement.contentAnalysis.precise) score += 10;
    if (announcement.contentAnalysis.detailed) score += 5;
  }
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, score));
};