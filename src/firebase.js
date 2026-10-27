import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBOBAGTc6_eBhyY043U265H0nVbKyr562M",
  authDomain: "cureaid-ai.firebaseapp.com",
  projectId: "cureaid-ai",
  storageBucket: "cureaid-ai.firebasestorage.app",
  messagingSenderId: "918274817680",
  appId: "1:918274817680:web:d4e869d312cc72cab26215"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
