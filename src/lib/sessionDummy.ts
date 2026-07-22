import { missions } from "../data/missions";
import type { Mission } from "../types";

/**
 * 세션 코드 검증 결과 타입
 */
export interface ValidationResult {
  valid: boolean;
  missionId?: string;
  sessionName?: string;
}

/**
 * 입력된 세션 코드의 유효성을 검증합니다.
 * (임시로 하드코딩된 로직 사용)
 */
export const validateCode = async (code: string): Promise<ValidationResult> => {
  // 실제 API 호출을 흉내내기 위한 약간의 딜레이
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (code.toUpperCase() === "TEST123") {
    return {
      valid: true,
      missionId: "mission_tasting",
      sessionName: "한울든든죽 1차",
    };
  }

  return { valid: false };
};

/**
 * 주어진 ID에 해당하는 미션 데이터를 반환합니다.
 */
export const getMission = (missionId: string): Mission | undefined => {
  return missions[missionId];
};
