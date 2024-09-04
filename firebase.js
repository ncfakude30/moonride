import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAgbsKRZw7--vBktzNrBTeShs8vh2ZoKoQ",
  authDomain: "moonrides-1ab0f.firebaseapp.com",
  projectId: "moonrides-1ab0f",
  storageBucket: "moonrides-1ab0f.appspot.com",
  messagingSenderId: "722310407490",
  appId: "1:722310407490:web:54396cb63870c84e2754db",
  measurementId: "G-D93Q92GKRE"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();

export { app, provider, auth };