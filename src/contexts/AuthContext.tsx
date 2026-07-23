import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile, UserRole, AddressDetails } from '../types';
import {
  auth,
  db,
  isFirebaseConfigured,
  signInWithFirebase,
  signUpWithFirebase,
  signInWithGooglePopup,
  signOutFirebase,
} from '../services/firebase';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; shippingAddress?: string; addressDetails?: AddressDetails }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Crea o actualiza el documento del usuario en Firestore si no existe.
 */
async function ensureUserDocument(uid: string, email: string, displayName: string, role: UserRole) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, { email, displayName, role });
    }
  } catch (error) {
    console.error('Error al crear documento de usuario en Firestore:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('ecommerce_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole | null>(user?.role || null);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('ecommerce_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('ecommerce_user');
      }
    } catch (e) {
      console.error('Error al guardar el perfil en almacenamiento local', e);
    }
  }, [user]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData: any = {};
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            userData = userDoc.data();
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }

        const userRole = userData.role === 'admin' ? 'admin' : 'customer';
        
        setUser((prev) => ({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || prev?.displayName || firebaseUser.email?.split('@')[0],
          role: userRole,
          shippingAddress: userData.shippingAddress || prev?.shippingAddress,
          addressDetails: userData.addressDetails || prev?.addressDetails,
        }));
        setRole(userRole);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithFirebase(email, password);
      const firebaseUser = result.user;
      
      let userData: any = {};
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) userData = userDoc.data();
      
      const userRole = userData.role === 'admin' ? 'admin' : 'customer';
      const nextUser: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || email.split('@')[0],
        role: userRole,
        shippingAddress: userData.shippingAddress,
        addressDetails: userData.addressDetails,
      };
      setUser(nextUser);
      setRole(nextUser.role);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nameInput?: string) => {
    setLoading(true);
    try {
      const result = await signUpWithFirebase(email, password);
      const firebaseUser = result.user;
      const displayName = nameInput || email.split('@')[0];
      const userRole: UserRole = 'customer';
      
      await ensureUserDocument(firebaseUser.uid, firebaseUser.email || email, displayName, userRole);
      const nextUser: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        displayName,
        role: userRole,
      };
      setUser(nextUser);
      setRole(nextUser.role);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithGooglePopup();
      const firebaseUser = result.user;
      const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario Google';
      
      let userData: any = {};
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userRole: UserRole = 'customer';
      
      if (userDoc.exists()) {
        userData = userDoc.data();
        userRole = userData.role === 'admin' ? 'admin' : 'customer';
      } else {
        await ensureUserDocument(firebaseUser.uid, firebaseUser.email || '', displayName, userRole);
      }

      const nextUser: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName,
        role: userRole,
        shippingAddress: userData.shippingAddress,
        addressDetails: userData.addressDetails,
      };
      setUser(nextUser);
      setRole(nextUser.role);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await signOutFirebase();
    setUser(null);
    setRole(null);
    localStorage.removeItem('ecommerce_user');
  };

  const updateUserProfile = async (data: { displayName?: string; shippingAddress?: string; addressDetails?: AddressDetails }) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, data);
      } catch (e) {
        console.error('Error updating user document in Firestore', e);
      }
    }
  };

  const value = useMemo(
    () => ({ user, loading, role, signIn, signUp, signInWithGoogle, signOut, updateUserProfile }),
    [user, loading, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de AuthProvider');
  }
  return context;
}
