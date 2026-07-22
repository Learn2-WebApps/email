import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Vite 환경 변수에서 Firebase 설정 로드
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 필수 환경 변수 체크
const isFirebaseConfigured = !!firebaseConfig.apiKey;

if (!isFirebaseConfigured) {
  console.warn("Firebase API Key가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
}

// Firebase 앱 초기화 (이미 초기화된 경우 기존 앱 사용)
const app = isFirebaseConfigured 
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

// Firestore 및 Auth 인스턴스 익스포트 (초기화되지 않은 경우 null 처리될 수 있으므로 주의 필요)
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

/**
 * 익명 로그인을 위한 헬퍼 함수
 */
export const loginAnonymously = async () => {
  if (!auth) {
    throw new Error("Firebase Auth가 초기화되지 않았습니다. API Key를 확인해주세요.");
  }
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("익명 로그인 실패:", error);
    throw error;
  }
};
