import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs, onSnapshot } from "firebase/firestore";

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

// Utility functions (Optional)
export const fetchDocumentById = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(FIREBASE_DB, collectionName, docId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

export const fetchCollection = async (collectionName: string) => {
  try {
    const colRef = collection(FIREBASE_DB, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching collection:", error);
    throw error;
  }
};
