/**
 * 인트로 텍스트에서 이름 플레이스홀더를 실제 이름으로 치환하는 유틸리티
 */
export const replaceName = (text: string, name: string): string => {
  if (!text) return text;
  
  const targetName = name || "신입";
  return text.replace(/{이름}/g, targetName);
};
