import type { Mission, ComposeFormData } from "../types";

export const extractJsonFromText = (text: string): any => {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON 파싱 에러:", error, text);
    throw new Error("AI 응답을 파싱하는 중 문제가 발생했습니다.");
  }
};

export const buildGradingPrompt = (submission: ComposeFormData, mission: Mission): string => {
  const criteriaList = mission.subjectiveRules.items
    .map((item, index) => `${index + 1}. ${item.label} (최대 ${item.maxScore}점): ${item.description}`)
    .join('\n');

  const jsonFields = mission.subjectiveRules.items
    .map(item => `  "${item.id}Score": 0부터 ${item.maxScore} 사이의 정수,
  "${item.id}Comment": "반드시 단일 문자열(String)로 작성할 것. (예: 감점 사유...\\\\n원칙 설명...\\\\n개선 방향...)"`)
    .join(',\n');

  const requiredElementsText = mission.subjectiveRules.requiredContentElements 
    ? `\n[필수 포함 요소]\n다음 항목이 모두 포함되었는지 확인하세요:\n- ${mission.subjectiveRules.requiredContentElements.join('\n- ')}\n`
    : '';

  return `
당신은 신입사원 비즈니스 이메일 작성 교육의 실무 평가 전문가입니다.
아래 주어진 미션 정보, 필수 포함 요소, 참고용 모범답안, 그리고 학습자가 작성한 메일 본문을 바탕으로 평가해주세요.

[미션 정보]
- 제목: ${mission.title}
- 배경 설명:
${mission.intro}
- 전달해야 할 핵심 정보:
${mission.briefInfo}
${requiredElementsText}
[참고용 모범답안]
${mission.modelAnswer.body}

[학습자가 작성한 메일 본문]
${submission.body}

[평가 기준]
${criteriaList}

[명시적 채점 규칙 - 엄격 준수]
1. 의미 동등성 우선 (유연한 채점): 모범답안은 참고용일 뿐 정답이 아닙니다. 학습자의 표현이 모범답안과 다르더라도, 의미가 통하고 위 [필수 포함 요소]가 빠짐없이 포함되어 있다면 절대 감점하지 말고 만점 처리하세요.
   * 의미 동등성 허용 예시 (감점 금지):
     - "관련 부서원분들께" ≈ "각 부서 담당자분들께" ≈ "관련 부서 실무자분들께"
     - "회신 부탁드립니다" ≈ "답변 주시면 감사하겠습니다"
     - "안녕하세요" ≈ "안녕하십니까"
2. 구조 요소(인사말/맺음말/서명): 
   - 메일 전체(인사말, 본문, 서명 통합)에서 발신자의 '이름', '직급', '소속(부서/팀)' 3가지 정보가 최소 1회 이상 명시되어 있는지 확인하세요.
   - 인사말(예: "안녕하십니까, 마케팅팀 조아현 사원입니다.")이나 본문에서 이미 소속과 직급을 명확히 밝혔다면, 서명에는 "조아현 드림" 또는 "조아현 올림"과 같이 이름만 적어도 절대 감점하지 말고 만점 처리하세요. (서명에 소속/직급을 반복 작성하지 않았다는 이유로 감점하는 것은 금지됩니다.)
   - 발신자의 신원 정보(이름, 직급, 소속) 중 어느 하나라도 메일 전체에서 아예 누락된 경우에만 감점하세요.
3. 어투 및 톤앤매너 감점 조건: 학습자의 원문에서 문제가 되는 문장을 구체적으로 인용할 수 있고, 명확한 대안을 제시할 수 있을 때만 감점하세요. 명확한 근거(인용) 없이 "비즈니스 맥락에 맞지 않는", "어투가 부적절한" 같은 모호한 사유로는 절대 감점할 수 없습니다.
4. 필수 요소 외 항목 처리: [필수 포함 요소]에 명시되지 않은 항목(예: 첨부 파일 안내 문구, 서명 양식, 볼드체 강조 등)의 누락은 감점 사유가 될 수 없습니다. 이런 항목은 "실무 팁" 또는 "완성도를 높이는 팁"으로만 코멘트에 가볍게 언급하고 절대 감점하지 마세요.

[감점 폭 가이드]
- 필수 요소 누락: 누락된 항목 1개당 해당 평가 기준 배점의 20~30% 이내 감점
- 어투/표현 문제: 문제 1건당 2~3점 이내 감점
- 심각한 누락이 아닌 이상, 한 항목에서 배점의 절반 이상을 감점하지 마세요.

[피드백 작성 지침]
각 항목의 Comment는 감점 여부에 따라 아래 지침에 맞게 단일 문자열(String)로 작성하세요. 하위 객체(Object)로 나누지 말고 줄바꿈(\\n)으로 구분하세요.

■ 만점을 받은 경우: 
잘한 점을 구체적으로 칭찬하고, 완성도를 더 높일 수 있는 실무 팁을 제공하세요.

■ 감점이 있는 경우 (반드시 아래 3요소 포함):
① 문제 지점: 학습자 원문의 문제 문장을 직접 인용하거나, 누락된 필수 요소를 정확히 명시
② 원칙: 왜 비즈니스 메일에서 이것이 문제인지 실무적 이유 설명
③ 개선 방향: 구체적인 예시 문장을 포함하여 어떻게 고쳐야 하는지 안내

아래 JSON 형식으로만 평가 결과를 출력하세요. 다른 텍스트는 절대 포함하지 마세요.

{
${jsonFields},
  "overallFeedback": "신입사원에게 주는 실무 선배의 종합 피드백. 과도한 공손이나 칭찬을 피하고 담백하게 작성하세요. '잘한 점 1개 + 다음에 신경 쓸 포인트 1개' 구조로 3~4문장 분량을 유지하세요."
}
`;
};
