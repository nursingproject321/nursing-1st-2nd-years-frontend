import firebase from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

import 'firebase/firestore';

// Import the necessary Firebase services you plan to use
import 'firebase/auth';
import 'firebase/database';
// Add other necessary Firebase service imports

const firebaseConfig = {
  apiKey: 'AIzaSyDBnWTrhFl54jez1BjO5m9MtiCp67riRPs',
  authDomain: 'nursing-project-66060.firebaseapp.com',
  projectId: 'nursing-project-66060',
  storageBucket: 'nursing-project-66060.appspot.com',
  messagingSenderId: '559737199455',
  appId: '1:559737199455:web:d67155335fa92879ae74ea',
  measurementId: "G-0TS6FW5G5S"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const firestore = firebase.firestore();

