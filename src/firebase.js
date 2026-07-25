import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAuR6DivZQECydKWmiUXaOgrozlxHbXJos',
  authDomain: 'krangya-ab91a.firebaseapp.com',
  projectId: 'krangya-ab91a',
  storageBucket: 'krangya-ab91a.firebasestorage.app',
  messagingSenderId: '214107667887',
  appId: '1:214107667887:web:9914211f531c057bad835a',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
