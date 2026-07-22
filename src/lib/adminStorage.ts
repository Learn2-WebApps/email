import { db } from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";

export interface SessionCodeItem {
  code: string;
  isActive: boolean;
  description: string;
  createdAt: any;
  learnerCount: number;
}

export interface LearnerSessionItem {
  id: string;
  sessionCode: string;
  learnerName: string;
  createdAt: any;
  lastAccessedAt: any;
  completedMissions: string[];
}

export interface SubmissionItem {
  id: string;
  sessionCode: string;
  learnerName: string;
  missionId: string;
  submittedAt: any;
  formData: any;
  scoreResult: any;
}

const ADMIN_AUTH_KEY = "admin_auth";

/**
 * 브라우저 sessionStorage 기반 관리자 인증 상태 확인
 * // 브라우저 sessionStorage - 우리 sessionStorage.ts 모듈과 무관
 */
export const isAdminAuthenticated = (): boolean => {
  try {
    return window.sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  } catch {
    return false;
  }
};

/**
 * 관리자 로그인 인증 상태 기록 및 제거
 * // 브라우저 sessionStorage - 우리 sessionStorage.ts 모듈과 무관
 */
export const setAdminAuthenticated = (auth: boolean): void => {
  try {
    if (auth) {
      window.sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    } else {
      window.sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch (e) {
    console.error("관리자 인증 상태 변경 실패:", e);
  }
};

/**
 * 4자리 숫자 세션 코드를 생성합니다.
 * manualCode가 없으면 1000~9999 사이 중복되지 않는 번호를 최대 10회 재시도하여 생성합니다.
 */
export const createSessionCode = async (
  manualCode?: string,
  description?: string
): Promise<string> => {
  if (!db) {
    throw new Error("Firebase DB가 연결되어 있지 않습니다. .env.local 설정을 확인해주세요.");
  }

  let codeToSave = "";

  if (manualCode && manualCode.trim()) {
    const code = manualCode.trim();
    if (!/^\d{4}$/.test(code)) {
      throw new Error("세션 코드는 4자리 숫자여야 합니다.");
    }
    const snap = await getDoc(doc(db, "sessionCodes", code));
    if (snap.exists()) {
      throw new Error("이미 존재하는 세션 코드입니다.");
    }
    codeToSave = code;
  } else {
    // 1000 ~ 9999 사이 4자리 숫자 자동 생성 (최대 10회 재시도)
    let attempts = 0;
    let foundUnique = false;

    while (attempts < 10 && !foundUnique) {
      attempts++;
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      const snap = await getDoc(doc(db, "sessionCodes", randomCode));
      if (!snap.exists()) {
        codeToSave = randomCode;
        foundUnique = true;
      }
    }

    if (!foundUnique || !codeToSave) {
      throw new Error("발급 실패, 다시 시도해 주세요.");
    }
  }

  await setDoc(doc(db, "sessionCodes", codeToSave), {
    isActive: true,
    description: description?.trim() || "",
    createdAt: serverTimestamp(),
  });

  return codeToSave;
};

/**
 * 세션 코드 목록을 조회합니다 (최대 100개, 생성일 내림차순).
 * 각 세션별 등록된 학습자 수(sessions 필드 세션코드 기준)를 집계하여 함께 반환합니다.
 */
export const listSessionCodes = async (): Promise<SessionCodeItem[]> => {
  if (!db) return [];

  try {
    const codesQuery = query(collection(db, "sessionCodes"), limit(100));
    const codesSnap = await getDocs(codesQuery);

    const sessionsSnap = await getDocs(collection(db, "sessions"));
    const learnerCountMap: Record<string, number> = {};
    
    sessionsSnap.docs.forEach((d) => {
      const data = d.data();
      const code = data.sessionCode;
      if (code) {
        learnerCountMap[code] = (learnerCountMap[code] || 0) + 1;
      }
    });

    const items: SessionCodeItem[] = codesSnap.docs.map((d) => {
      const data = d.data();
      return {
        code: d.id,
        isActive: data.isActive !== false,
        description: data.description || "",
        createdAt: data.createdAt,
        learnerCount: learnerCountMap[d.id] || 0,
      };
    });

    items.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return tB - tA;
    });

    return items;
  } catch (e) {
    console.error("세션 코드 목록 조회 실패:", e);
    return [];
  }
};

/**
 * 세션 코드 활성/비활성화 상태를 변경합니다.
 */
export const toggleSessionCodeActive = async (
  code: string,
  isActive: boolean
): Promise<void> => {
  if (!db) return;
  const ref = doc(db, "sessionCodes", code.trim());
  await updateDoc(ref, { isActive });
};

/**
 * 특정 세션 코드를 공유하는 모든 학습자 목록(sessions)을 조회합니다.
 */
export const listSessionsByCode = async (sessionCode: string): Promise<LearnerSessionItem[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "sessions"),
      where("sessionCode", "==", sessionCode.trim()),
      limit(100)
    );
    const snap = await getDocs(q);

    const items: LearnerSessionItem[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        sessionCode: data.sessionCode,
        learnerName: data.learnerName || "알 수 없음",
        createdAt: data.createdAt,
        lastAccessedAt: data.lastAccessedAt,
        completedMissions: data.completedMissions || [],
      };
    });

    items.sort((a, b) => {
      const tA = a.lastAccessedAt?.toMillis ? a.lastAccessedAt.toMillis() : 0;
      const tB = b.lastAccessedAt?.toMillis ? b.lastAccessedAt.toMillis() : 0;
      return tB - tA;
    });

    return items;
  } catch (e) {
    console.error("학습자 세션 조회 실패:", e);
    return [];
  }
};

/**
 * 특정 세션 코드의 제출 이력 목록(submissions)을 조회합니다.
 */
export const listSubmissionsBySessionCode = async (
  sessionCode: string,
  learnerName?: string
): Promise<SubmissionItem[]> => {
  if (!db) return [];
  try {
    let q = query(
      collection(db, "submissions"),
      where("sessionCode", "==", sessionCode.trim()),
      limit(100)
    );
    if (learnerName && learnerName.trim()) {
      q = query(
        collection(db, "submissions"),
        where("sessionCode", "==", sessionCode.trim()),
        where("learnerName", "==", learnerName.trim()),
        limit(100)
      );
    }
    const snap = await getDocs(q);

    const items: SubmissionItem[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        sessionCode: data.sessionCode,
        learnerName: data.learnerName || "알 수 없음",
        missionId: data.missionId,
        submittedAt: data.submittedAt,
        formData: data.formData || {},
        scoreResult: data.scoreResult || {},
      };
    });

    items.sort((a, b) => {
      const tA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : (a.submittedAt?.seconds ? a.submittedAt.seconds * 1000 : 0);
      const tB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : (b.submittedAt?.seconds ? b.submittedAt.seconds * 1000 : 0);
      return tB - tA;
    });

    return items;
  } catch (e) {
    console.error("제출 이력 조회 실패:", e);
    return [];
  }
};
