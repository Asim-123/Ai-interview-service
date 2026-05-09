import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

export function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Initialize with environment variables or service account
  // For development, you can use the Firebase config from .env
  // For production, use a service account JSON file
  
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ghost-interviewer',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    // Fallback for development without service account
    adminApp = initializeApp({
      projectId: 'ghost-interviewer',
    });
  }

  return adminApp;
}

export async function verifyToken(token: string) {
  try {
    const decodedToken = await getAuth(getAdminApp()).verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
