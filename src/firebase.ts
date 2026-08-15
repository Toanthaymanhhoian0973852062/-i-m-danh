import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANRD3Pu0qRe2DC4e-T27TmQ7VvJn4thVU",
  authDomain: "gen-lang-client-0345331187.firebaseapp.com",
  projectId: "gen-lang-client-0345331187",
  storageBucket: "gen-lang-client-0345331187.firebasestorage.app",
  messagingSenderId: "1051151138870",
  appId: "1:1051151138870:web:e4938072113242d5eb1897"
};

import { initializeFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, "ai-studio-tonthymnhhian-e8c8e17c-2e30-46cd-b7ff-713c6ce617ad");


// Keep track of active listeners
const unsubscribes = new Map<string, () => void>();

/**
 * Syncs a localStorage key with a Firestore document.
 * @param key The local storage key (also used as document ID).
 * @param onUpdate Callback triggered when data from Firestore updates.
 */
export const syncWithFirestore = (key: string, onUpdate: (data: any) => void, onMissing?: () => void) => {
  const docRef = doc(db, 'appState', key);
  
  if (unsubscribes.has(key)) {
    return; // Already syncing
  }

  let isFirstLoad = true;

  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data().data;
      onUpdate(data);
    } else if (isFirstLoad && onMissing) {
      onMissing();
    }
    isFirstLoad = false;
  });

  unsubscribes.set(key, unsubscribe);
};

export const pushToFirestore = async (key: string, data: any) => {
  const docRef = doc(db, 'appState', key);
  try {
    await setDoc(docRef, { data });
  } catch (err) {
    console.error("Error pushing to Firestore for key", key, err);
  }
};
