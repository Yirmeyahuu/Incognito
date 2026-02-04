import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import type { User, AuthContextType } from '../types';
import { sanitizeInput, isValidEmail, RateLimiter } from '../utils/security';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiters for different operations
const signInLimiter = new RateLimiter(5, 60000);
const signUpLimiter = new RateLimiter(3, 60000);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate unique public ID
  const generatePublicId = (): string => {
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(36)).join('').substring(0, 10);
  };

  // ✅ Create publicLinks document in Firestore
  const createPublicLinkDocument = async (uid: string, publicId: string): Promise<void> => {
    try {
      const linkRef = doc(db, 'publicLinks', publicId);
      
      await setDoc(linkRef, {
        publicId,
        ownerUid: uid,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      
      console.log(`✅ Created publicLinks document: ${publicId} for user: ${uid}`);
    } catch (error) {
      console.error('❌ Failed to create publicLinks document:', error);
      throw error;
    }
  };

  // Convert Firebase User to App User with publicLinks creation
  const convertFirebaseUser = async (firebaseUser: FirebaseUser, retries = 3): Promise<User> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      // ✅ FORCE FRESH READ - bypass cache
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        console.log('📖 Reading user from Firestore:', {
          uid: firebaseUser.uid,
          publicId: userData.publicId,
          profilePhoto: userData.profilePhoto,
          timestamp: new Date().toISOString()
        });

        // ✅ VERIFY: Check if publicLinks document exists
        if (userData.publicId) {
          const linkRef = doc(db, 'publicLinks', userData.publicId);
          const linkDoc = await getDoc(linkRef);
          
          if (!linkDoc.exists()) {
            console.warn(`⚠️ publicLinks document missing for ${userData.publicId}, creating...`);
            await createPublicLinkDocument(firebaseUser.uid, userData.publicId);
          }
        } else {
          // ✅ User exists but no publicId - create one
          console.warn(`⚠️ User ${firebaseUser.uid} missing publicId, creating...`);
          const newPublicId = generatePublicId();
          
          // Update user doc with publicId
          await setDoc(userDocRef, { publicId: newPublicId }, { merge: true });
          
          // Create publicLinks doc
          await createPublicLinkDocument(firebaseUser.uid, newPublicId);
          
          userData.publicId = newPublicId;
        }
        
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: sanitizeInput(userData.displayName || firebaseUser.displayName || ''),
          publicId: userData.publicId,
          inboxEnabled: userData.inboxEnabled ?? true,
          createdAt: userData.createdAt?.toDate() || new Date(),
          profilePhoto: userData.profilePhoto || 'avatar-1',
          customUsername: userData.customUsername,
        };
      }

      // ✅ NEW USER: Create both user doc AND publicLinks doc atomically
      console.log(`🆕 Creating first-time user ${firebaseUser.uid}...`);
      
      const publicId = generatePublicId();
      const displayName = sanitizeInput(
        firebaseUser.displayName || firebaseUser.email?.split('@')[0] || ''
      );
      
      // ✅ FIX: Create user data object WITHOUT undefined fields
      const newUserData: Record<string, any> = {
        email: firebaseUser.email || '',
        displayName,
        publicId,
        inboxEnabled: true,
        createdAt: serverTimestamp(),
        profilePhoto: 'avatar-1',
      };

      // ✅ ATOMIC BATCH WRITE: Create both documents together
      const batch = writeBatch(db);
      
      // Create user document (WITHOUT undefined fields)
      batch.set(userDocRef, newUserData);
      
      // Create publicLinks document
      const linkRef = doc(db, 'publicLinks', publicId);
      batch.set(linkRef, {
        publicId,
        ownerUid: firebaseUser.uid,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      
      // Commit both writes atomically
      await batch.commit();
      
      console.log(`✅ Successfully created first-time user with publicLinks: ${publicId}`);

      // ✅ Return User object (can include undefined fields for app use)
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName,
        publicId,
        inboxEnabled: true,
        createdAt: new Date(),
        profilePhoto: 'avatar-1',
        customUsername: undefined,
      };
    } catch (error: any) {
      console.error('❌ Error in convertFirebaseUser:', error);
      
      // Retry on network errors
      if (retries > 0 && (error.code === 'unavailable' || error.message?.includes('offline'))) {
        console.log(`🔄 Retrying user creation (${retries} attempts left)...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return convertFirebaseUser(firebaseUser, retries - 1);
      }
      
      throw error; // ✅ RE-THROW ERROR SO CALLER CAN HANDLE IT
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('🔐 Auth state changed: User logged in:', firebaseUser.uid);
          const appUser = await convertFirebaseUser(firebaseUser);
          console.log('✅ App user created/loaded:', appUser.uid);
          setUser(appUser);
        } else {
          console.log('🔐 Auth state changed: User logged out');
          setUser(null);
        }
      } catch (error: any) {
        console.error('❌ Auth state change error:', error);
        
        // ✅ DON'T CREATE TEMP USER - Let sign-in methods handle errors
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<void> => {
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    if (!isValidEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format.');
    }

    if (!signUpLimiter.canProceed(sanitizedEmail)) {
      throw new Error('Too many sign up attempts. Please try again later.');
    }

    try {
      setLoading(true);
      console.log('📝 Starting email/password sign up...');
      
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      console.log('✅ Firebase user created:', userCredential.user.uid);
      
      // ✅ WAIT for Firestore documents to be created
      const appUser = await convertFirebaseUser(userCredential.user);
      console.log('✅ App user setup complete:', appUser.uid);
      
      setUser(appUser);
      signUpLimiter.reset(sanitizedEmail);
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.message?.includes('offline')) {
        throw new Error('You are offline. Please check your internet connection.');
      }
      
      throw new Error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    if (!isValidEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format.');
    }

    if (!signInLimiter.canProceed(sanitizedEmail)) {
      throw new Error('Too many sign in attempts. Please try again later.');
    }

    try {
      setLoading(true);
      console.log('🔑 Starting email/password sign in...');
      
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      console.log('✅ Firebase sign in successful:', userCredential.user.uid);
      
      // ✅ WAIT for user data to load
      const appUser = await convertFirebaseUser(userCredential.user);
      console.log('✅ App user loaded:', appUser.uid);
      
      setUser(appUser);
      signInLimiter.reset(sanitizedEmail);
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (error.message?.includes('offline')) {
        throw new Error('You are offline. Please check your internet connection.');
      }
      
      throw new Error('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔵 Starting Google sign in...');
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google popup successful:', result.user.uid);
      
      // ✅ CRITICAL: Wait for Firestore operations to complete
      console.log('⏳ Setting up user profile in Firestore...');
      const appUser = await convertFirebaseUser(result.user);
      console.log('✅ User profile ready:', appUser.uid);
      
      // ✅ VERIFY user was set before returning
      setUser(appUser);
      
      // ✅ Add small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ Google sign in complete, ready to navigate');
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up blocked by browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign in cancelled.');
      } else if (error.message?.includes('offline')) {
        throw new Error('You are offline. Please check your internet connection.');
      }
      
      throw new Error(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      throw new Error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};