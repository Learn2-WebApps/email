/**
 * 한글 조사를 자동으로 붙여주는 유틸리티
 */

/**
 * 주어진 글자의 받침 유무를 확인합니다.
 * @param char 확인할 글자 (한 글자)
 * @returns 받침이 있으면 true, 없으면 false
 */
const hasBatchim = (char: string): boolean => {
  const code = char.charCodeAt(0);
  // 한글 범위를 벗어난 경우 (가~힣: 0xAC00 ~ 0xD7A3)
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
};

/**
 * 이름 뒤에 적절한 조사를 붙여 반환합니다.
 * @param name 대상 문자열
 * @param type 조사 종류 ("은는" | "이가" | "을를" | "와과")
 * @returns 조사가 붙은 문자열
 */
export const attachJosa = (
  name: string,
  type: "은는" | "이가" | "을를" | "와과"
): string => {
  if (!name) return "";

  const lastChar = name.charAt(name.length - 1);
  const isKorean = /[가-힣]/.test(lastChar);

  // 한글이 아닌 경우 "님"을 붙이고 조사 처리
  if (!isKorean) {
    const honorific = `${name}님`;
    switch (type) {
      case "은는": return `${honorific}은`;
      case "이가": return `${honorific}이`;
      case "을를": return `${honorific}을`;
      case "와과": return `${honorific}과`;
      default: return honorific;
    }
  }

  const batchim = hasBatchim(lastChar);

  switch (type) {
    case "은는":
      return batchim ? `${name}은` : `${name}는`;
    case "이가":
      return batchim ? `${name}이` : `${name}가`;
    case "을를":
      return batchim ? `${name}을` : `${name}를`;
    case "와과":
      return batchim ? `${name}과` : `${name}와`;
    default:
      return name;
  }
};

/**
 * 테스트 케이스:
 * console.log(attachJosa("홍길동", "은는")); // 홍길동은
 * console.log(attachJosa("이순신", "이가")); // 이순신이
 * console.log(attachJosa("사과", "를"));    // 사과를
 * console.log(attachJosa("John", "은는"));  // John님은
 */
