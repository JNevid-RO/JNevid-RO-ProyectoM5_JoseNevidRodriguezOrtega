interface ImportMetaEnv {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'firebase/app' {
  export function initializeApp(config: any): any;
}

declare module 'firebase/auth' {
  export function getAuth(app?: any): any;
  export class GoogleAuthProvider {
    constructor();
  }
  export function signInWithEmailAndPassword(auth: any, email: string, pass: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, pass: string): Promise<any>;
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export function signOut(auth: any): Promise<any>;
  export function onAuthStateChanged(auth: any, callback: (user: any) => void): () => void;
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any;
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function jsxDEV(type: any, props: any, key?: any): any;
}

declare module 'react/jsx-dev-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function jsxDEV(type: any, props: any, key?: any): any;
}

declare module 'react-router-dom' {
  export function BrowserRouter(props: any): any;
  export function Routes(props: any): any;
  export function Route(props: any): any;
  export function Link(props: any): any;
  export function NavLink(props: any): any;
  export function Navigate(props: any): any;
  export function useNavigate(): any;
  export function useParams(): any;
}
