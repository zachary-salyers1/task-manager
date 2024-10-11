import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWPf0QkVpv5FukaCSYp6dgF3lfNO275fc",
  authDomain: "task-manger-ddb40.firebaseapp.com",
  projectId: "task-manger-ddb40",
  storageBucket: "task-manger-ddb40.appspot.com",
  messagingSenderId: "268573970076",
  appId: "1:268573970076:web:8a9dc9bb31fa6962a52759"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);