/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { firebaseConfig };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Server responded (e.g. permission-denied by catch-all rule), confirming connectivity
    return true;
  }
}

void testConnection();

export function subscribeFirebaseAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function signInWithGoogleFirebase(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export interface FirebaseMemberWorkspace {
  uid: string;
  email: string;
  fullName: string;
  phoneWhatsApp?: string;
  role: 'member' | 'admin';
  subscriptionStatus: 'free' | 'active';
  subscriptionPlan?: string | null;
  subscriptionCurrency?: string | null;
  dietPreference: string;
  lifestyleGoal: string;
  dailyCalorieGoal: number;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm?: number;
  age?: number;
  gender?: string;
  savedPlanSummary?: string;
  favoriteRecipes: string[];
  workoutLogs: {
    id: string;
    title: string;
    minutes: number;
    estimatedCalories: number;
    completedAt: string;
  }[];
  latestDietPlan?: any | null;
}

function clampStr(val: unknown, maxLen: number, fallback = ''): string {
  const s = String(val ?? fallback).trim();
  return s.slice(0, maxLen);
}

function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(val));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
}

export async function ensureAndLoadMemberProfile(
  fbUser: User,
  defaults?: {
    dietPreference?: string;
    lifestyleGoal?: string;
    dailyCalorieGoal?: number;
    currentWeightKg?: number;
    targetWeightKg?: number;
    heightCm?: number;
    age?: number;
    gender?: string;
  }
): Promise<FirebaseMemberWorkspace> {
  const userPath = `users/${fbUser.uid}`;
  const userRef = doc(db, 'users', fbUser.uid);

  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  let profileData: any;
  if (!snap.exists()) {
    const newProfile = {
      uid: fbUser.uid,
      email: clampStr(fbUser.email || '', 200),
      fullName: clampStr(fbUser.displayName || fbUser.email?.split('@')[0] || 'Lifestyle Spark Member', 120),
      phoneWhatsApp: '',
      role: 'member',
      subscriptionStatus: 'free',
      subscriptionPlan: null,
      subscriptionCurrency: null,
      dietPreference: clampStr(defaults?.dietPreference || 'high_protein', 50, 'high_protein'),
      lifestyleGoal: clampStr(defaults?.lifestyleGoal || 'weight_loss', 50, 'weight_loss'),
      dailyCalorieGoal: clampInt(defaults?.dailyCalorieGoal, 1000, 4500, 1650),
      currentWeightKg: clampNum(defaults?.currentWeightKg, 25, 300, 74),
      targetWeightKg: clampNum(defaults?.targetWeightKg, 25, 300, 63),
      heightCm: clampNum(defaults?.heightCm, 100, 250, 168),
      age: clampInt(defaults?.age, 16, 110, 29),
      gender: clampStr(defaults?.gender || 'female', 20, 'female'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(userRef, newProfile);
      profileData = newProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  } else {
    profileData = snap.data();
  }

  // Load saved workouts, favorite recipes, and latest diet plan using rule-safe UID filters
  let favoriteRecipes: string[] = [];
  let workoutLogs: FirebaseMemberWorkspace['workoutLogs'] = [];
  let latestDietPlan: any | null = null;

  const favPath = `users/${fbUser.uid}/favoriteRecipes`;
  try {
    const favSnap = await getDocs(
      query(collection(db, 'users', fbUser.uid, 'favoriteRecipes'), where('userId', '==', fbUser.uid), limit(50))
    );
    favoriteRecipes = favSnap.docs.map((d) => String(d.data().recipeId || d.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, favPath);
  }

  const woPath = `users/${fbUser.uid}/workoutLogs`;
  try {
    const woSnap = await getDocs(
      query(
        collection(db, 'users', fbUser.uid, 'workoutLogs'),
        where('userId', '==', fbUser.uid),
        orderBy('completedAt', 'desc'),
        limit(30)
      )
    );
    workoutLogs = woSnap.docs.map((d) => {
      const data = d.data();
      const ts = data.completedAt?.toDate ? data.completedAt.toDate().toISOString() : new Date().toISOString();
      return {
        id: d.id,
        title: String(data.title || 'Workout'),
        minutes: Number(data.minutes || 20),
        estimatedCalories: Number(data.estimatedCalories || 150),
        completedAt: ts,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, woPath);
  }

  const dpPath = `users/${fbUser.uid}/dietPlans`;
  try {
    const dpSnap = await getDocs(
      query(
        collection(db, 'users', fbUser.uid, 'dietPlans'),
        where('userId', '==', fbUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      )
    );
    if (!dpSnap.empty) {
      const d = dpSnap.docs[0].data();
      latestDietPlan = {
        subscriberName: profileData.fullName,
        dietName: d.dietName,
        dailyCalories: d.dailyCalories,
        macros: {
          proteinGrams: d.proteinGrams,
          carbsGrams: d.carbsGrams,
          fatGrams: d.fatGrams,
        },
        waterIntake: '3.0 to 3.5 Liters Daily + Morning Warm Lemon Water',
        breakfast: d.breakfast,
        lunch: d.lunch,
        snack: d.snack,
        dinner: d.dinner,
        cookTip: d.cookTip || '',
        exerciseFocus: d.exerciseFocus || '',
        aiCoachNote: d.aiCoachNote || '',
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, dpPath);
  }

  return {
    uid: fbUser.uid,
    email: String(profileData.email || fbUser.email || ''),
    fullName: String(profileData.fullName || fbUser.displayName || 'Member'),
    phoneWhatsApp: String(profileData.phoneWhatsApp || ''),
    role: profileData.role === 'admin' ? 'admin' : 'member',
    subscriptionStatus: profileData.subscriptionStatus === 'active' ? 'active' : 'free',
    subscriptionPlan: profileData.subscriptionPlan || null,
    subscriptionCurrency: profileData.subscriptionCurrency || null,
    dietPreference: String(profileData.dietPreference || 'high_protein'),
    lifestyleGoal: String(profileData.lifestyleGoal || 'weight_loss'),
    dailyCalorieGoal: Number(profileData.dailyCalorieGoal || 1650),
    currentWeightKg: Number(profileData.currentWeightKg || 74),
    targetWeightKg: Number(profileData.targetWeightKg || 63),
    heightCm: Number(profileData.heightCm || 168),
    age: Number(profileData.age || 29),
    gender: String(profileData.gender || 'female'),
    favoriteRecipes,
    workoutLogs,
    latestDietPlan,
  };
}

export async function saveDietPlanAndMetricsToFirestore(
  fbUser: User,
  metrics: {
    fullName: string;
    phoneWhatsApp: string;
    dietPreference: string;
    lifestyleGoal: string;
    dailyCalorieGoal: number;
    currentWeightKg: number;
    targetWeightKg: number;
    heightCm: number;
    age: number;
    gender: string;
  },
  plan: {
    dietName: string;
    dailyCalories: string;
    macros: { proteinGrams: number; carbsGrams: number; fatGrams: number };
    breakfast: string;
    lunch: string;
    snack: string;
    dinner: string;
    cookTip?: string;
    exerciseFocus?: string;
    aiCoachNote?: string;
  }
) {
  const userPath = `users/${fbUser.uid}`;
  try {
    await updateDoc(doc(db, 'users', fbUser.uid), {
      fullName: clampStr(metrics.fullName || fbUser.displayName || 'Member', 120, 'Member'),
      phoneWhatsApp: clampStr(metrics.phoneWhatsApp, 32),
      dietPreference: clampStr(metrics.dietPreference, 50, 'high_protein'),
      lifestyleGoal: clampStr(metrics.lifestyleGoal, 50, 'weight_loss'),
      dailyCalorieGoal: clampInt(metrics.dailyCalorieGoal, 1000, 4500, 1650),
      currentWeightKg: clampNum(metrics.currentWeightKg, 25, 300, 74),
      targetWeightKg: clampNum(metrics.targetWeightKg, 25, 300, 63),
      heightCm: clampNum(metrics.heightCm, 100, 250, 168),
      age: clampInt(metrics.age, 16, 110, 29),
      gender: clampStr(metrics.gender, 20, 'female'),
      savedPlanSummary: clampStr(`${plan.dietName} (${plan.dailyCalories})`, 2000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }

  const planId = `plan_${Date.now()}`;
  const planPath = `users/${fbUser.uid}/dietPlans/${planId}`;
  try {
    await setDoc(doc(db, 'users', fbUser.uid, 'dietPlans', planId), {
      userId: fbUser.uid,
      dietName: clampStr(plan.dietName, 150, 'Custom Plan'),
      dailyCalories: clampStr(plan.dailyCalories, 40, '1650 kcal'),
      proteinGrams: clampInt(plan.macros?.proteinGrams, 10, 500, 130),
      carbsGrams: clampInt(plan.macros?.carbsGrams, 0, 800, 145),
      fatGrams: clampInt(plan.macros?.fatGrams, 5, 400, 50),
      breakfast: clampStr(plan.breakfast, 400, 'Balanced Breakfast'),
      lunch: clampStr(plan.lunch, 400, 'Balanced Lunch'),
      snack: clampStr(plan.snack, 400, 'Healthy Snack'),
      dinner: clampStr(plan.dinner, 400, 'Light Dinner'),
      cookTip: clampStr(plan.cookTip, 500),
      exerciseFocus: clampStr(plan.exerciseFocus, 400),
      aiCoachNote: clampStr(plan.aiCoachNote, 600),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, planPath);
  }
}

export async function logWorkoutToFirestore(
  fbUser: User,
  workout: { title: string; minutes: number; estimatedCalories: number }
) {
  const logId = `wo_${Date.now()}`;
  const path = `users/${fbUser.uid}/workoutLogs/${logId}`;
  try {
    await setDoc(doc(db, 'users', fbUser.uid, 'workoutLogs', logId), {
      userId: fbUser.uid,
      title: clampStr(workout.title, 140, 'Workout Session'),
      minutes: clampInt(workout.minutes, 1, 360, 20),
      estimatedCalories: clampInt(workout.estimatedCalories, 5, 3000, 150),
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleFavoriteRecipeInFirestore(
  fbUser: User,
  recipeId: string,
  recipeTitle: string,
  currentlySaved: boolean
): Promise<boolean> {
  const safeId = recipeId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 100);
  const path = `users/${fbUser.uid}/favoriteRecipes/${safeId}`;
  const ref = doc(db, 'users', fbUser.uid, 'favoriteRecipes', safeId);

  if (currentlySaved) {
    try {
      await deleteDoc(ref);
      return false;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  } else {
    try {
      await setDoc(ref, {
        userId: fbUser.uid,
        recipeId: safeId,
        title: clampStr(recipeTitle, 160, 'Saved Recipe'),
        savedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}
