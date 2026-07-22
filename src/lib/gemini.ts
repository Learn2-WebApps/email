import { GoogleGenerativeAI } from "@google/generative-ai";

// 모델명 상수 분리 (환경 변수로 오버라이드 가능)
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
}

// API 키가 있을 때만 인스턴스 생성
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Gemini 모델을 호출하여 응답을 반환합니다.
 */
export const callGemini = async (prompt: string): Promise<string> => {
  if (!genAI) {
    throw new Error("Gemini API Key가 설정되지 않아 AI 기능을 사용할 수 없습니다.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini로부터 빈 응답을 받았습니다.");
    }

    return text;
  } catch (error) {
    console.error("Gemini API 호출 에러:", error);
    throw new Error("AI 응답을 생성하는 중 문제가 발생했습니다. 다시 시도해주세요.");
  }
};
