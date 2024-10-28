// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1eEwD61mJ-DZyGZHWXzUXEmlU5egm0qk",
  authDomain: "smarttrack-37edd.firebaseapp.com",
  projectId: "smarttrack-37edd",
  storageBucket: "smarttrack-37edd.appspot.com",
  messagingSenderId: "503324368944",
  appId: "1:503324368944:web:358d59028b9021a254cdf5"
};

// Initialize Firebase
export const FIREBASE_App = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_App);
export const FIREBASE_DB = getFirestore(FIREBASE_App);

export { FIREBASE_App as app, FIREBASE_AUTH as auth, FIREBASE_DB as db };