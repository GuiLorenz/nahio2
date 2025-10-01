import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Suas credenciais de configuração do Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyB6JrDEO1vdXnAEOeYwU0V-BKLjBzM1Tf4",
    authDomain: "nahio-7fcac.firebaseapp.com",
    databaseURL: "https://nahio-7fcac-default-rtdb.firebaseio.com",
    projectId: "nahio-7fcac",
    storageBucket: "nahio-7fcac.firebasestorage.app",
    messagingSenderId: "986461062867",
    appId: "1:986461062867:web:cc2b152f951e94a5057626",
    measurementId: "G-TMXRNXQ0TX"
  };

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços do Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

