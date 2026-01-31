import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFZ77MaFkPwmqEQDHYbQXv3d8GV1QnklE",
  authDomain: "fisiogestor-45479.firebaseapp.com",
  projectId: "fisiogestor-45479",
  storageBucket: "fisiogestor-45479.appspot.com",
  messagingSenderId: "368790597662",
  appId: "1:368790597662:web:759ed2a4120c9722a33e0f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
