import { db } from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  arrayUnion, 
  serverTimestamp 
} from "firebase/firestore";

const COMPLETED_MISSIONS_KEY = "completed_missions_";

export interface SessionData {
  sessionCode: string;
  learnerName: string;
  completedMissions: string[];
}

/**
 * 4자리 숫자 세션 코드 형식 유효성 검사 헬퍼
 */
export const isValidSessionCode = (code: string): boolean => {
  return /^\d{4}$/.test(code.trim());
};

/**
 * 세션 코드를 검증하고 세션을 조회하거나 없으면 신규 생성합니다.
 */
export const getOrCreateSession = async (
  sessionCode: string, 
  learnerName: string
): Promise<SessionData> => {
  const code = sessionCode.trim();

  // 1. 형식 유효성 검사 (Firestore 조회 전 선행 검사)
  if (!isValidSessionCode(code)) {
    throw new Error("세션 코드는 4자리 숫자여야 합니다.");
  }

  if (!db) {
    throw new Error("Firebase DB가 연결되어 있지 않습니다. .env.local 설정을 확인해주세요.");
  }

  // 2. sessionCodes 컬렉션에서 세션 코드 유효성 검증
  const codeRef = doc(db, "sessionCodes", code);
  const codeSnap = await getDoc(codeRef);

  if (!codeSnap.exists() || codeSnap.data()?.isActive === false) {
    throw new Error("유효하지 않은 세션 코드입니다. 관리자에게 문의하세요.");
  }

  // 3. sessions 컬렉션에서 세션 문서 조회/생성
  try {
    const sessionRef = doc(db, "sessions", code);
    const snap = await getDoc(sessionRef);

    if (snap.exists()) {
      const data = snap.data();
      await updateDoc(sessionRef, { lastAccessedAt: serverTimestamp() });
      return {
        sessionCode: code,
        learnerName: data.learnerName || learnerName,
        completedMissions: data.completedMissions || [],
      };
    } else {
      const newSession = {
        learnerName,
        createdAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        completedMissions: [],
      };
      await setDoc(sessionRef, newSession);
      return { sessionCode: code, learnerName, completedMissions: [] };
    }
  } catch (e: any) {
    console.error("Firestore 세션 처리 실패:", e);
    throw new Error(e.message || "세션 진입 중 오류가 발생했습니다.");
  }
};

/**
 * 완료된 미션 ID 목록을 반환합니다.
 */
export const getCompletedMissions = async (sessionCode: string): Promise<string[]> => {
  const code = sessionCode.trim();
  if (db) {
    try {
      const sessionRef = doc(db, "sessions", code);
      const snap = await getDoc(sessionRef);
      if (snap.exists()) {
        return snap.data().completedMissions || [];
      }
    } catch (e) {
      console.error("Firestore 완료 미션 조회 실패:", e);
    }
  }

  // Fallback: localStorage
  try {
    const data = localStorage.getItem(`${COMPLETED_MISSIONS_KEY}${code}`);
    if (data) return JSON.parse(data) as string[];
  } catch (e) {
    console.error("localStorage 완료 미션 조회 실패:", e);
  }
  return [];
};

/**
 * 특정 미션을 완료 상태로 표시합니다.
 */
export const markMissionCompleted = async (sessionCode: string, missionId: string): Promise<void> => {
  const code = sessionCode.trim();

  // localStorage 캐시 업데이트
  try {
    const completed = await getCompletedMissions(code);
    if (!completed.includes(missionId)) {
      completed.push(missionId);
      localStorage.setItem(`${COMPLETED_MISSIONS_KEY}${code}`, JSON.stringify(completed));
    }
  } catch (e) {
    console.error("localStorage 저장 실패:", e);
  }

  // Firestore 업데이트
  if (db) {
    try {
      const sessionRef = doc(db, "sessions", code);
      await updateDoc(sessionRef, {
        completedMissions: arrayUnion(missionId),
        lastAccessedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Firestore 미션 완료 업데이트 실패:", e);
    }
  }
};

/**
 * 제출 기록을 submissions 컬렉션에 추가하고 미션을 완료 처리합니다.
 */
export const saveSubmission = async (
  sessionCode: string,
  missionId: string,
  formData: any,
  scoreResult: any
): Promise<void> => {
  const code = sessionCode.trim();

  if (db) {
    try {
      await addDoc(collection(db, "submissions"), {
        sessionCode: code,
        missionId,
        submittedAt: serverTimestamp(),
        formData,
        scoreResult,
      });
    } catch (e) {
      console.error("Firestore 제출 이력 저장 실패:", e);
    }
  }

  // 미션 완료 상태 업데이트
  await markMissionCompleted(code, missionId);
};
