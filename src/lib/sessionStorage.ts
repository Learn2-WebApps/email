import { db } from "./firebase";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  where,
  addDoc, 
  arrayUnion, 
  serverTimestamp 
} from "firebase/firestore";

const COMPLETED_MISSIONS_KEY = "completed_missions_";

export interface SessionData {
  sessionDocId?: string;
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
 * 세션 코드를 검증하고 (sessionCode + learnerName) 조합으로 세션을 조회하거나 없으면 신규 생성합니다.
 */
export const getOrCreateSession = async (
  sessionCode: string, 
  learnerName: string
): Promise<SessionData> => {
  const code = sessionCode.trim();
  const name = learnerName.trim();

  // 1. 형식 유효성 검사
  if (!isValidSessionCode(code)) {
    throw new Error("세션 코드는 4자리 숫자여야 합니다.");
  }

  if (!db) {
    throw new Error("Firebase DB가 연결되어 있지 않습니다. .env.local 설정을 확인해주세요.");
  }

  // 2. sessionCodes 컬렉션 유효성 검증
  const codeRef = doc(db, "sessionCodes", code);
  const codeSnap = await getDoc(codeRef);

  if (!codeSnap.exists() || codeSnap.data()?.isActive === false) {
    throw new Error("유효하지 않은 세션 코드입니다. 관리자에게 문의하세요.");
  }

  // 3. sessions 컬렉션에서 (sessionCode + learnerName) 조회/생성
  try {
    const q = query(
      collection(db, "sessions"),
      where("sessionCode", "==", code),
      where("learnerName", "==", name)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const data = docSnap.data();
      await updateDoc(docSnap.ref, { lastAccessedAt: serverTimestamp() });
      return {
        sessionDocId: docSnap.id,
        sessionCode: code,
        learnerName: name,
        completedMissions: data.completedMissions || [],
      };
    } else {
      const newSessionRef = await addDoc(collection(db, "sessions"), {
        sessionCode: code,
        learnerName: name,
        createdAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        completedMissions: [],
      });
      return {
        sessionDocId: newSessionRef.id,
        sessionCode: code,
        learnerName: name,
        completedMissions: [],
      };
    }
  } catch (e: any) {
    console.error("Firestore 세션 처리 실패:", e);
    throw new Error(e.message || "세션 진입 중 오류가 발생했습니다.");
  }
};

/**
 * 완료된 미션 ID 목록을 반환합니다.
 */
export const getCompletedMissions = async (sessionCode: string, learnerName?: string): Promise<string[]> => {
  const code = sessionCode.trim();
  const name = learnerName?.trim();

  if (db && name) {
    try {
      const q = query(
        collection(db, "sessions"),
        where("sessionCode", "==", code),
        where("learnerName", "==", name)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data().completedMissions || [];
      }
    } catch (e) {
      console.error("Firestore 완료 미션 조회 실패:", e);
    }
  }

  // Fallback: localStorage
  try {
    const key = name ? `${COMPLETED_MISSIONS_KEY}${code}_${name}` : `${COMPLETED_MISSIONS_KEY}${code}`;
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data) as string[];
  } catch (e) {
    console.error("localStorage 완료 미션 조회 실패:", e);
  }
  return [];
};

/**
 * 특정 미션을 완료 상태로 표시합니다.
 */
export const markMissionCompleted = async (
  sessionCode: string, 
  learnerName: string, 
  missionId: string
): Promise<void> => {
  const code = sessionCode.trim();
  const name = learnerName.trim();

  // localStorage 캐시 업데이트
  try {
    const key = `${COMPLETED_MISSIONS_KEY}${code}_${name}`;
    const completed = await getCompletedMissions(code, name);
    if (!completed.includes(missionId)) {
      completed.push(missionId);
      localStorage.setItem(key, JSON.stringify(completed));
    }
  } catch (e) {
    console.error("localStorage 저장 실패:", e);
  }

  // Firestore 업데이트
  if (db) {
    try {
      const q = query(
        collection(db, "sessions"),
        where("sessionCode", "==", code),
        where("learnerName", "==", name)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          completedMissions: arrayUnion(missionId),
          lastAccessedAt: serverTimestamp(),
        });
      }
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
  learnerName: string,
  missionId: string,
  formData: any,
  scoreResult: any
): Promise<void> => {
  const code = sessionCode.trim();
  const name = learnerName.trim();

  if (db) {
    try {
      await addDoc(collection(db, "submissions"), {
        sessionCode: code,
        learnerName: name,
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
  await markMissionCompleted(code, name, missionId);
};
