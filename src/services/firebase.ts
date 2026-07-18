import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mock-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithFirebase(email: string, pass: string) {
  if (!isFirebaseConfigured) {
    return {
      user: {
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
      },
    };
  }
  return signInWithEmailAndPassword(auth, email, pass);
}

export async function signUpWithFirebase(email: string, pass: string) {
  if (!isFirebaseConfigured) {
    return {
      user: {
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
      },
    };
  }
  return createUserWithEmailAndPassword(auth, email, pass);
}

export async function signInWithGooglePopup() {
  if (!isFirebaseConfigured) {
    return {
      user: {
        uid: `user-google-${Date.now()}`,
        email: 'usuario.google@ejemplo.com',
        displayName: 'Usuario Google',
      },
    };
  }
  return signInWithPopup(auth, googleProvider);
}

export async function signOutFirebase() {
  if (!isFirebaseConfigured) return;
  return firebaseSignOut(auth);
}
