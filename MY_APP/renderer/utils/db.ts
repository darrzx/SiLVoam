// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2zG8NUoa0PGhrebZ5B-3SDdZbjdwhVEE",
  authDomain: "silvoam-62833.firebaseapp.com",
  projectId: "silvoam-62833",
  storageBucket: "silvoam-62833.appspot.com",
  messagingSenderId: "266869818600",
  appId: "1:266869818600:web:fb7814c53eb2398bd7f55d",
  measurementId: "G-2YGY4DCMPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
