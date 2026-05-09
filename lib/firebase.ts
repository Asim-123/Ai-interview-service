import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC_BOA1bkOCREOvQat0DkLPv48OJBJn89o",
  authDomain: "ghost-interviewer.firebaseapp.com",
  projectId: "ghost-interviewer",
  storageBucket: "ghost-interviewer.firebasestorage.app",
  messagingSenderId: "738963086555",
  appId: "1:738963086555:web:d73e9690d2f3d59ffc80fe",
  measurementId: "G-ST51FGL5NK"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, auth, googleProvider, githubProvider };
