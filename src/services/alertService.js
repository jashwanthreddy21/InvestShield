import { db } from '../Firebase/config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

// Get all alerts for a user
export const getUserAlerts = async (userId) => {
  try {
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const q = query(alertsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const alerts = [];
    querySnapshot.forEach((doc) => {
      alerts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return alerts;
  } catch (error) {
    throw error;
  }
};

// Add a new alert
export const addAlert = async (userId, alertData) => {
  try {
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const docRef = await addDoc(alertsRef, {
      ...alertData,
      read: false,
      createdAt: new Date()
    });
    
    return {
      id: docRef.id,
      ...alertData,
      read: false
    };
  } catch (error) {
    throw error;
  }
};

// Mark alert as read
export const markAlertAsRead = async (userId, alertId) => {
  try {
    const alertRef = doc(db, 'users', userId, 'alerts', alertId);
    await updateDoc(alertRef, {
      read: true,
      readAt: new Date()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Delete an alert
export const deleteAlert = async (userId, alertId) => {
  try {
    const alertRef = doc(db, 'users', userId, 'alerts', alertId);
    await deleteDoc(alertRef);
    return alertId;
  } catch (error) {
    throw error;
  }
};

// Get unread alerts count
export const getUnreadAlertsCount = async (userId) => {
  try {
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const q = query(alertsRef, where('read', '==', false));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    throw error;
  }
};

// Clear all alerts
export const clearAllAlerts = async (userId) => {
  try {
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const querySnapshot = await getDocs(alertsRef);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    throw error;
  }
};

// Generate investment alert (simulated)
export const generateInvestmentAlert = async (userId, investmentId, type) => {
  try {
    // In a real application, this would be triggered by external events or monitoring systems
    // For demo purposes, we'll simulate alert generation
    
    // Get investment details
    const investmentRef = doc(db, 'users', userId, 'investments', investmentId);
    const investmentDoc = await getDoc(investmentRef);
    
    if (!investmentDoc.exists()) {
      throw new Error('Investment not found');
    }
    
    const investment = investmentDoc.data();
    
    // Create alert based on type
    let alertData = {
      investmentId,
      investmentName: investment.name,
      type: type || 'price_change', // Default to price change
      read: false,
      createdAt: new Date()
    };
    
    switch (alertData.type) {
      case 'price_change':
        alertData.title = `Price Alert: ${investment.name}`;
        alertData.message = `The price of ${investment.name} has changed significantly.`;
        alertData.severity = 'medium';
        break;
      case 'fraud_warning':
        alertData.title = `Fraud Warning: ${investment.name}`;
        alertData.message = `Potential fraudulent activity detected with ${investment.name}.`;
        alertData.severity = 'high';
        break;
      case 'news':
        alertData.title = `News Alert: ${investment.name}`;
        alertData.message = `Important news related to ${investment.name} has been published.`;
        alertData.severity = 'low';
        break;
      default:
        alertData.title = `Alert: ${investment.name}`;
        alertData.message = `New alert for ${investment.name}.`;
        alertData.severity = 'medium';
    }
    
    // Add alert to database
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const docRef = await addDoc(alertsRef, alertData);
    
    return {
      id: docRef.id,
      ...alertData
    };
  } catch (error) {
    throw error;
  }
};