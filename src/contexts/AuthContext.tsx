import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { UserProfile, UserRole } from '../types';
import { auth, isFirebaseConfigured, signInWithFirebase, signOutFirebase } from '../services/firebase';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; shippingAddress?: string }) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userRole: UserRole = firebaseUser.email?.includes('admin') ? 'admin' : 'customer';
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
      const userRole: UserRole = firebaseUser.email?.includes('admin') ? 'admin' : 'customer';
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
    () => ({ user, loading, role, signIn, signOut, updateUserProfile }),
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
