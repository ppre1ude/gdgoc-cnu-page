import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const firebaseAdminAppName = 'gdgoc-cnu-admin';

export function getFirebaseAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}

function getFirebaseAdminApp(): App {
  const existingApp = getApps().find((app) => app.name === firebaseAdminAppName);

  if (existingApp) {
    return existingApp;
  }

  return initializeApp(getFirebaseAdminOptions(), firebaseAdminAppName);
}

function getFirebaseAdminOptions() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson) as {
      clientEmail?: string;
      client_email?: string;
      privateKey?: string;
      private_key?: string;
      projectId?: string;
      project_id?: string;
    };
    const serviceAccountProjectId =
      serviceAccount.projectId ?? serviceAccount.project_id ?? projectId;
    const serviceAccountClientEmail =
      serviceAccount.clientEmail ?? serviceAccount.client_email;
    const serviceAccountPrivateKey = (
      serviceAccount.privateKey ?? serviceAccount.private_key
    )?.replace(/\\n/g, '\n');

    if (
      !serviceAccountProjectId ||
      !serviceAccountClientEmail ||
      !serviceAccountPrivateKey
    ) {
      throw new Error('Firebase service account configuration is incomplete.');
    }

    return {
      credential: cert({
        clientEmail: serviceAccountClientEmail,
        privateKey: serviceAccountPrivateKey,
        projectId: serviceAccountProjectId,
      }),
      projectId: serviceAccountProjectId,
    };
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (clientEmail && privateKey && projectId) {
    return {
      credential: cert({
        clientEmail,
        privateKey,
        projectId,
      }),
      projectId,
    };
  }

  return {
    credential: applicationDefault(),
    projectId,
  };
}
