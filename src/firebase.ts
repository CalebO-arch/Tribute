import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Ensure single app instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with ignoreUndefinedProperties to prevent undefined crashes on Firestore writes
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    ignoreUndefinedProperties: true
  }, firebaseConfig.firestoreDatabaseId || '(default)');
} catch (e) {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
}

export const db = firestoreDb;
