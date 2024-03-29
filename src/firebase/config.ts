import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_IMAGE_SERVER,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = initializeApp(config);
const fs = getFirestore();
const auth = getAuth();
const storage = getStorage();

if (process.env.NEXT_PUBLIC_MODE === "development") {
  connectFirestoreEmulator(fs, "localhost", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

export { fs, auth, storage };
