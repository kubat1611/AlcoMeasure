import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {

  apiKey: "AIzaSyAdsGxmT83nHhWwqw-dD1QQOVohb1qnMm8",

  authDomain: "alkoaware.firebaseapp.com",

  projectId: "alkoaware",

storageBucket: "alkoaware.appspot.com",

  messagingSenderId: "527461445764",

  appId: "1:527461445764:web:7f6f1a89c7faaa6b14d2d1",

  measurementId: "G-1S3XHG2K9E"

};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth  };