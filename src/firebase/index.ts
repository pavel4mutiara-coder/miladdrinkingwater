import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const getEnv = (key: string, fallback: string) => {
  const value = import.meta.env[key];
  return value && value.trim() !== '' ? value : fallback;
};

const config = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', firebaseConfig.apiKey),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', firebaseConfig.projectId),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId),
  appId: getEnv('VITE_FIREBASE_APP_ID', firebaseConfig.appId),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', firebaseConfig.measurementId)
};

const databaseId = getEnv('VITE_FIREBASE_DATABASE_ID', firebaseConfig.firestoreDatabaseId);

// Defensive check: Ensure at least the API Key and Project ID are present
let initializationError: Error | null = null;
let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;

const isValidConfig = config.apiKey && config.projectId && config.apiKey !== 'AIza...'; // check for placeholders if any

if (!config.apiKey || !config.projectId) {
  initializationError = new Error('Firebase configuration is incomplete. Please check your setup.');
  console.error('CRITICAL: Firebase configuration missing.');
} else {
  try {
    app = initializeApp(config);
    db = getFirestore(app, databaseId);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully with ' + (import.meta.env.VITE_FIREBASE_API_KEY ? 'Environment Variables' : 'Local Fallback Config'));
  } catch (error: any) {
    initializationError = error;
    console.error('Firebase Initialization Failed:', error);
  }
}

export { db, auth, storage };

// Special function to check for initialization errors inside components
export function checkFirebaseInitialized() {
  if (initializationError) {
    throw initializationError;
  }
}

export const loginAnonymously = () => { /* Not used with local auth */ };
export const logout = () => { /* Not used with local auth */ };

// Test connection and database configuration
async function verifyFirebaseSetup() {
  if (initializationError || !db) return;

  const currentConfig = {
    projectId: config.projectId,
    databaseId: databaseId,
    apiKey: config.apiKey ? 'PRESENT' : 'MISSING'
  };
  
  console.log('Firebase Configuration Check:', currentConfig);

  try {
    // Try to reach the database
    await getDocFromServer(doc(db, '_setup_check', 'ping'));
  } catch (error: any) {
    console.warn("Firebase Setup Warning:", error.message);
    
    if (error.code === 'permission-denied') {
      console.error("CRITICAL: Permission denied. Please check your Firestore security rules.");
    } else if (error.code === 'not-found' && error.message.includes('database')) {
      console.error(`CRITICAL: Database id "${databaseId}" not found in project "${config.projectId}".`);
    } else if (error.message.includes('the client is offline')) {
      console.error("NETWORK: Client is offline or Firebase is unreachable.");
    }
  }
}

verifyFirebaseSetup();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || 'unknown';

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };

  console.group(`🔥 Firestore Error [${operationType}]`);
  console.error('Code:', errorCode);
  console.error('Path:', path);
  console.error('Message:', errorMessage);
  console.error('Full Info:', errInfo);
  console.groupEnd();

  // Provide user-friendly messages for common errors
  let userMessage = 'Something went wrong while saving data.';
  if (errorCode === 'permission-denied') {
    userMessage = 'Permission Denied: You don\'t have access to this action.';
  } else if (errorCode === 'unavailable') {
    userMessage = 'Network Error: Database is currently unreachable.';
  } else if (errorCode === 'not-found') {
    userMessage = 'Data not found.';
  }

  // We throw a standardized error that can be caught by UI
  throw new Error(JSON.stringify({ ...errInfo, userFriendlyMessage: userMessage }));
}
