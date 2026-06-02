/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get, child } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAPPZgVrZF9SEaS42xx8RcsnM2i8EpenUQ",
  authDomain: "creadit-loan-5203b.firebaseapp.com",
  databaseURL: "https://creadit-loan-5203b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "creadit-loan-5203b",
  storageBucket: "creadit-loan-5203b.appspot.com",
  messagingSenderId: "95634892627",
  appId: "1:95634892627:web:1500052cb60f3b7e4823a6",
  measurementId: "G-V60FZSL5V1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

// Helper to save complete user data to Realtime Database
export async function saveUserData(
  uid: string,
  data: {
    userProfile: any;
    dailyLogs: any;
    streakCount: number;
    totalPoints: number;
    role?: string;
  }
) {
  try {
    const userRef = ref(database, `users/${uid}`);
    await set(userRef, {
      profile: data.userProfile,
      dailyLogs: data.dailyLogs || {},
      streakCount: data.streakCount || 1,
      totalPoints: data.totalPoints || 50,
      role: data.role || 'user',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving user data to Realtime Database:', error);
    throw error;
  }
}

// Helper to load user data from Realtime Database
export async function loadUserData(uid: string) {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
}
