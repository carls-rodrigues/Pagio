import * as admin from "firebase-admin";

// Singleton — Admin SDK initialized once
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

export default admin;
