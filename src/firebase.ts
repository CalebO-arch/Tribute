import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the provisioned database ID from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
