/**
 * Mukta Child Health Hub - Firebase Cloud Firestore Configuration
 * Enables real-time multi-device cloud synchronization for children profiles,
 * doctor-prescribed vaccines, symptom logs, growth history, and clinical records.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBcDhZgeesABj95Lf6dapXDVjb_iJqHrfA",
  authDomain: "child-care-2005a.firebaseapp.com",
  projectId: "child-care-2005a",
  storageBucket: "child-care-2005a.firebasestorage.app",
  messagingSenderId: "329218948049",
  appId: "1:329218948049:web:5f20f35ffded5f586fbef0"
};

let fbApp = null;
let fbDb = null;
let isFirebaseReady = false;

try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    if (!firebase.apps.length) {
      fbApp = firebase.initializeApp(firebaseConfig);
    } else {
      fbApp = firebase.app();
    }
    fbDb = firebase.firestore();
    isFirebaseReady = true;
    console.log("🔥 Mukta Health Hub: Connected to Firebase Cloud Firestore (child-care-2005a)");
  } else {
    console.warn("Firebase SDK script not loaded yet.");
  }
} catch (err) {
  console.warn("Firebase initialization notice:", err.message);
}

// Expose globally
window.firebaseConfig = firebaseConfig;
window.fbDb = fbDb;
window.isFirebaseReady = isFirebaseReady;

