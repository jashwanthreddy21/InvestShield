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

// Get all investments for a user
export const getUserInvestments = async (userId) => {
  try {
    const investmentsRef = collection(db, 'users', userId, 'investments');
    const querySnapshot = await getDocs(investmentsRef);
    
    const investments = [];
    querySnapshot.forEach((doc) => {
      investments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return investments;
  } catch (error) {
    throw error;
  }
};

// Add a new investment
export const addInvestment = async (userId, investmentData) => {
  try {
    const investmentsRef = collection(db, 'users', userId, 'investments');
    const docRef = await addDoc(investmentsRef, {
      ...investmentData,
      createdAt: new Date()
    });
    
    return {
      id: docRef.id,
      ...investmentData
    };
  } catch (error) {
    throw error;
  }
};

// Update an investment
export const updateInvestment = async (userId, investmentId, investmentData) => {
  try {
    const investmentRef = doc(db, 'users', userId, 'investments', investmentId);
    await updateDoc(investmentRef, {
      ...investmentData,
      updatedAt: new Date()
    });
    
    return {
      id: investmentId,
      ...investmentData
    };
  } catch (error) {
    throw error;
  }
};

// Delete an investment
export const deleteInvestment = async (userId, investmentId) => {
  try {
    const investmentRef = doc(db, 'users', userId, 'investments', investmentId);
    await deleteDoc(investmentRef);
    return investmentId;
  } catch (error) {
    throw error;
  }
};

// Get monitored investments
export const getMonitoredInvestments = async (userId) => {
  try {
    const investmentsRef = collection(db, 'users', userId, 'investments');
    const q = query(investmentsRef, where('isMonitored', '==', true));
    const querySnapshot = await getDocs(q);
    
    const monitoredInvestments = [];
    querySnapshot.forEach((doc) => {
      monitoredInvestments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return monitoredInvestments;
  } catch (error) {
    throw error;
  }
};

// Add investment to monitoring
export const addToMonitoring = async (userId, investmentId) => {
  try {
    const investmentRef = doc(db, 'users', userId, 'investments', investmentId);
    await updateDoc(investmentRef, {
      isMonitored: true,
      monitoringStartDate: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Remove investment from monitoring
export const removeFromMonitoring = async (userId, investmentId) => {
  try {
    const investmentRef = doc(db, 'users', userId, 'investments', investmentId);
    await updateDoc(investmentRef, {
      isMonitored: false,
      monitoringEndDate: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Verify an investment
export const verifyInvestment = async (investmentData) => {
  try {
    // In a real application, this would connect to external APIs or databases
    // to verify the investment's legitimacy
    
    // For demo purposes, we'll simulate a verification process
    const verificationResult = {
      isVerified: Math.random() > 0.3, // 70% chance of being verified
      verificationDate: new Date(),
      verificationDetails: {
        regulatoryCheck: true,
        legalStatusCheck: true,
        companyBackgroundCheck: true,
        financialPerformanceCheck: true
      }
    };
    
    // In a real app, we would save this to Firestore
    return verificationResult;
  } catch (error) {
    throw error;
  }
};

// Get verified investments
export const getVerifiedInvestments = async (userId) => {
  try {
    const verifiedRef = collection(db, 'users', userId, 'verifiedInvestments');
    const q = query(verifiedRef, orderBy('verificationDate', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    
    const verifiedInvestments = [];
    querySnapshot.forEach((doc) => {
      verifiedInvestments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return verifiedInvestments;
  } catch (error) {
    throw error;
  }
};