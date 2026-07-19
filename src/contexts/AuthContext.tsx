import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '../types';
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
  updateUserProfile: (data: { displayName?: string; shippingAddress?: string }) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Lee el rol del usuario desde Firestore (/users/{uid}).
 * Si el documento no existe, retorna 'customer' como rol predeterminado.
 */
async function fetchUserRole(uid: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.role === 'admin') return 'admin';
    }
    return 'customer';
  } catch (error) {
    console.error('Error al consultar rol del usuario en Firestore:', error);
    return 'customer';
  }
}

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
        const userRole = await fetchUserRole(firebaseUser.uid);
        setUser((prev) => ({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || prev?.displayName || firebaseUser.email?.split('@')[0],
          role: userRole,
          shippingAddress: prev?.shippingAddress,
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
      const userRole = await fetchUserRole(firebaseUser.uid);
      const nextUser: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || email.split('@')[0],
        role: userRole,
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
      // Crear documento en Firestore para el nuevo usuario
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
      // Leer rol existente o crear documento como customer
      let userRole = await fetchUserRole(firebaseUser.uid);
      await ensureUserDocument(firebaseUser.uid, firebaseUser.email || '', displayName, userRole);
      const nextUser: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName,
        role: userRole,
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

  const updateUserProfile = (data: { displayName?: string; shippingAddress?: string }) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
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
