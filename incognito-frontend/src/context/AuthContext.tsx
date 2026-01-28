import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import type { User, AuthContextType } from '../types';
import { sanitizeInput, isValidEmail, RateLimiter } from '../utils/security';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiters for different operations
const signInLimiter = new RateLimiter(5, 60000); // 5 attempts per minute
const signUpLimiter = new RateLimiter(3, 60000); // 3 attempts per minute

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

  // Convert Firebase User to App User with retry logic
  const convertFirebaseUser = async (firebaseUser: FirebaseUser, retries = 3): Promise<User> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: sanitizeInput(userData.displayName || firebaseUser.displayName || ''),
          publicId: userData.publicId,
          inboxEnabled: userData.inboxEnabled ?? true,
          createdAt: userData.createdAt?.toDate() || new Date(),
        };
      }

      // If user document doesn't exist, create it
      const publicId = generatePublicId();
      const displayName = sanitizeInput(
        firebaseUser.displayName || firebaseUser.email?.split('@')[0] || ''
      );
      
      const newUser: Omit<User, 'uid'> = {
        email: firebaseUser.email || '',
        displayName,
        publicId,
        inboxEnabled: true,
        createdAt: new Date(),
      };

      await setDoc(userDocRef, {
        ...newUser,
        createdAt: serverTimestamp(),
      });

      return { uid: firebaseUser.uid, ...newUser };
    } catch (error: any) {
      // Retry on network errors
      if (retries > 0 && (error.code === 'unavailable' || error.message.includes('offline'))) {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return convertFirebaseUser(firebaseUser, retries - 1);
      }
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const appUser = await convertFirebaseUser(firebaseUser);
          setUser(appUser);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        console.error('Error in auth state change:', error);
        
        // If it's an offline error, create a temporary user object
        if (error.message?.includes('offline') && firebaseUser) {
          const tempUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: sanitizeInput(
              firebaseUser.displayName || firebaseUser.email?.split('@')[0] || ''
            ),
            publicId: 'temp-offline-id',
            inboxEnabled: true,
            createdAt: new Date(),
          };
          setUser(tempUser);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<void> => {
    // Sanitize and validate input
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    if (!isValidEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format.');
    }

    // Rate limiting check
    if (!signUpLimiter.canProceed(sanitizedEmail)) {
      throw new Error('Too many sign up attempts. Please try again later.');
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      const appUser = await convertFirebaseUser(userCredential.user);
      setUser(appUser);
      
      // Reset rate limiter on success
      signUpLimiter.reset(sanitizedEmail);
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific Firebase errors
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
    // Sanitize and validate input
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    if (!isValidEmail(sanitizedEmail)) {
      throw new Error('Invalid email address format.');
    }

    // Rate limiting check
    if (!signInLimiter.canProceed(sanitizedEmail)) {
      throw new Error('Too many sign in attempts. Please try again later.');
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      const appUser = await convertFirebaseUser(userCredential.user);
      setUser(appUser);
      
      // Reset rate limiter on success
      signInLimiter.reset(sanitizedEmail);
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific Firebase errors
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

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Wait a bit for Firestore to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const appUser = await convertFirebaseUser(result.user);
      setUser(appUser);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up blocked by browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign in cancelled.');
      } else if (error.message?.includes('offline')) {
        throw new Error('You are offline. Please check your internet connection.');
      }
      
      throw new Error('Failed to sign in with Google. Please try again.');
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
      
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Sign out error:', error);
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

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};