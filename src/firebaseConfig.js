import { initializeApp } from "firebase/app";
 import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD_RkaIJflll0sp7plagrwADtPj2BJZ9S8",
  authDomain: "powersheets-app.firebaseapp.com",
  databaseURL: "https://powersheets-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "powersheets-app",
  storageBucket: "powersheets-app.firebasestorage.app",
  messagingSenderId: "852542634232",
  appId: "1:852542634232:web:6cb11cab464c352df3230d",
  measurementId: "G-FVXTY3HZS2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };