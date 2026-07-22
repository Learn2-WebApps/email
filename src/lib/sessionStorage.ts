const COMPLETED_MISSIONS_KEY = "completed_missions_";

/**
 * 완료된 미션 ID 목록을 반환합니다.
 * 향후 Firebase 연동 시 내부 구현을 교체할 수 있습니다.
 */
export const getCompletedMissions = async (sessionCode: string): Promise<string[]> => {
  try {
    const data = localStorage.getItem(`${COMPLETED_MISSIONS_KEY}${sessionCode}`);
    if (data) {
      return JSON.parse(data) as string[];
    }
  } catch (e) {
    console.error("완료된 미션 정보를 불러오는 중 오류 발생:", e);
  }
  return [];
};

/**
 * 특정 미션을 완료 상태로 표시합니다.
 */
export const markMissionCompleted = async (sessionCode: string, missionId: string): Promise<void> => {
  try {
    const completed = await getCompletedMissions(sessionCode);
    if (!completed.includes(missionId)) {
      completed.push(missionId);
      localStorage.setItem(`${COMPLETED_MISSIONS_KEY}${sessionCode}`, JSON.stringify(completed));
    }
  } catch (e) {
    console.error("미션 완료 상태 저장 중 오류 발생:", e);
  }
};
