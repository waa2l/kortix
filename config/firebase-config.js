/**
 * Firebase Configuration
 * استخدم بيانات Firebase Project الخاص بك
 * Replace with your Firebase project credentials
 */


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2yjBGTqLmB2esmV-TeP0lrQT2U2cLRnI",
  authDomain: "kortix-6a282.firebaseapp.com",
  projectId: "kortix-6a282",
  storageBucket: "kortix-6a282.firebasestorage.app",
  messagingSenderId: "905150109250",
  appId: "1:905150109250:web:c44648f1424bcfda723fdb",
  measurementId: "G-XMLQ4DXPRV"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const realtimeDb = firebase.database();

// Export for use in other modules
window.firebaseServices = {
  auth,
  db,
  realtimeDb,
  firebase
};
