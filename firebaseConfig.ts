import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";

// ==================================================================
// == IMPORTANT: Colle ici la configuration de ton projet Firebase ==
// ==================================================================
// Tu peux trouver cet objet dans la console Firebase:
// Paramètres du projet (roue crantée) > Général > Vos applications > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXTj0LUCaeScqo9M8N9RIVieWRhcOdFJ8",
  authDomain: "apex-ai-chat.firebaseapp.com",
  projectId: "apex-ai-chat",
  storageBucket: "apex-ai-chat.firebasestorage.app",
  messagingSenderId: "432418722265",
  appId: "1:432418722265:web:438696f20646012eb3c9c8",
  measurementId: "G-C95C5NZ2HY"
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = firebaseAuth.getAuth(app);