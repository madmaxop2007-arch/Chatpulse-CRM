import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId: string;
  appId: string;
  enableStorage?: boolean;
}

const LOCAL_STORAGE_KEY = 'chatpulse_custom_firebase_config';

export function getActiveFirebaseConfig(): FirebaseConfigOptions {
  // Check local storage override first
  try {
    const custom = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse custom firebase config from localStorage', e);
  }

  // Fallback to Vite environment variables
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    enableStorage: import.meta.env.VITE_FIREBASE_STORAGE_ENABLED === 'true',
  };
}

export function saveCustomFirebaseConfig(config: FirebaseConfigOptions): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
}

export function clearCustomFirebaseConfig(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.location.reload();
}

export const activeConfig = getActiveFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  activeConfig.apiKey &&
  activeConfig.projectId &&
  activeConfig.apiKey !== 'your_api_key_here' &&
  !activeConfig.apiKey.includes('your_')
);

// Firebase Storage is optional. Disabled by default on Spark plan unless explicitly enabled.
export const isStorageAvailable = Boolean(
  isFirebaseConfigured &&
  (activeConfig.enableStorage === true || import.meta.env.VITE_FIREBASE_STORAGE_ENABLED === 'true') &&
  activeConfig.storageBucket &&
  !activeConfig.storageBucket.includes('dummy') &&
  !activeConfig.storageBucket.includes('placeholder')
);

let appInstance: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    
    // Only initialize Storage if explicitly enabled and configured
    if (isStorageAvailable && activeConfig.storageBucket) {
      try {
        storageInstance = getStorage(appInstance);
      } catch (storageErr) {
        console.warn('Firebase Storage not initialized (optional on Spark plan):', storageErr);
        storageInstance = null;
      }
    }
  } catch (err) {
    console.error('Error initializing Firebase services:', err);
    // Provide safe fallbacks so app won't hard-crash on module import
    appInstance = getApps().length > 0 ? getApp() : initializeApp({
      apiKey: 'dummy-key',
      authDomain: 'dummy.firebaseapp.com',
      projectId: 'dummy-project',
      storageBucket: 'dummy.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef',
    });
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = null;
  }
} else {
  // Placeholder app to allow typing and prevent top-level module crash
  appInstance = getApps().length > 0 ? getApp() : initializeApp({
    apiKey: 'dummy-key-placeholder',
    authDomain: 'placeholder.firebaseapp.com',
    projectId: 'placeholder-project',
    storageBucket: 'placeholder.appspot.com',
    messagingSenderId: '1234567890',
    appId: '1:1234567890:web:dummy',
  });
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
  storageInstance = null;
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

/**
 * Validates connection to Firestore as per Firebase Integration Skill guidelines
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  if (!isFirebaseConfigured) {
    return { success: false, message: 'Firebase configuration credentials not set in environment or local settings.' };
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { success: true, message: 'Connected to Firestore server successfully.' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { success: false, message: 'Firebase client is offline or network unreachable.' };
    }
    // If permission-denied, it means server was reached and rules evaluated
    if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
      return { success: true, message: 'Reached Firestore server (security rules active).' };
    }
    return { success: false, message: error instanceof Error ? error.message : 'Unknown connection error' };
  }
}
