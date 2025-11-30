import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDi3L2gZ0UhDSODPsEvFXt7QQ6NsJGAars",
  authDomain: "masjid-imam-leave.firebaseapp.com",
  projectId: "masjid-imam-leave",
  storageBucket: "masjid-imam-leave.firebasestorage.app",
  messagingSenderId: "501050992840",
  appId: "1:501050992840:web:e95a801fc724b59b75ddfd",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
