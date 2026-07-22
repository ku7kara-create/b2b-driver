import admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? (() => {
      try { return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch { return undefined; }
    })()
  : undefined;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let app: admin.app.App | null = null;

function initFirebaseAdmin() {
  if (app) return app;
  if (serviceAccount) {
    app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) });
  } else if (projectId && clientEmail && privateKey) {
    app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }
  return app;
}

export function getMessaging() {
  const a = initFirebaseAdmin();
  if (!a) return null;
  try { return admin.messaging(a); } catch { return null; }
}
