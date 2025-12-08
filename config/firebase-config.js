/**
 * Firebase Configuration
 * استخدم بيانات Firebase Project الخاص بك
 * Replace with your Firebase project credentials
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
