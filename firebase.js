// firebase.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';


const firebase = {
  apiKey: 'AIzaSyDQXwz-AJxCLoTsjgIz3u98pZ88bv7RlqU',
  authDomain: 'myapp-23553.firebaseapp.com',
  projectId: 'myapp-23553',
  storageBucket: 'myapp-23553.appspot.com',
  messagingSenderId: '672923150479',
  appId: '1:672923150479:web:3d89ecd8f176d7958fa8fa',
};

const app = initializeApp(firebase);

// 👇 Persist auth state using AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { auth, db };