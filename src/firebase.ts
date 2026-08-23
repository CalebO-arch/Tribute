import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Ensure single app instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with the exact provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
