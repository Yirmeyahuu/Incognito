import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User } from '../types';

/**
 * Firestore collection names
 */
const COLLECTIONS = {
  USERS: 'users',
  MESSAGES: 'messages',
  PUBLIC_LINKS: 'publicLinks',
} as const;

/**
 * User Firestore operations
 */
export const userFirestore = {
  /**
   * Get user document from Firestore
   */
  getUser: async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: userDoc.id,
          email: data.email,
          displayName: data.displayName || '',
          publicId: data.publicId,
          inboxEnabled: data.inboxEnabled ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  /**
   * Create or update user document
   */
  setUser: async (uid: string, userData: Partial<User>): Promise<void> => {
    try {
      await setDoc(
        doc(db, COLLECTIONS.USERS, uid),
        {
          ...userData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  },

  /**
   * Update user document
   */
  updateUser: async (uid: string, updates: Partial<User>): Promise<void> => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};

/**
 * Check if Firestore is available
 */
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    await getDoc(doc(db, '_health', 'check'));
    return true;
  } catch (error) {
    console.error('Firestore connection error:', error);
    return false;
  }
};

export default {
  user: userFirestore,
  checkConnection: checkFirestoreConnection,
};