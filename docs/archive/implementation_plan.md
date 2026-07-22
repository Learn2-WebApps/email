# [mission_cc_reply 신규 미션 추가 및 액션 룰 확장]

마케팅팀 신입사원으로서 선배가 휴가 간 사이 판촉물(텀블러) 발주 건을 이어받아, 거래처(굿즈메이커)에 납기일과 로고 시안을 확정하여 새 메일로 회신하는 신규 미션을 추가합니다. 또한 액션 채점 로직(ActionRule)을 확장하여 허용 액션(allowed)과 금지 액션(forbidden)을 세분화하여 평가합니다.

## 결정된 사항 (User Review 반영)

1. **메일 쓰기 버튼 위치**: 받은편지함/자료함 탭 상단에 "새 메일 쓰기" 버튼 배치. 클릭 시 폼 리셋 후 `actionType='compose'` 상태가 됩니다.
2. **인용 히스토리 표시 방식**: `missions.ts`의 메일 `body` 텍스트 내에 4건의 원본 히스토리를 구분선(`----- 원본 메일 -----`)과 From/To/CC/첨부파일 헤더를 텍스트로 가독성 있게 포맷팅하여 삽입합니다.
3. **allowedActions 팁 피드백 노출 위치**: 기존 ResultPage의 "액션 평가" 섹션에 동일하게 노출하되, CSS 색상을 분리합니다 (감점은 기존처럼 빨강, 팁 피드백은 파랑/회색 톤).
4. **배점 스케일**: 총점에 얽매이지 않고 기존 미션들과 동일한 척도를 유지합니다. (To 10, CC 10, BCC 5, Subject 15, Attachments 10, Subjective 50).
5. **첨부 금지(forbidden) 파일 감점 로직**:
    - 다른 수신인 항목처럼 `forbiddenPenaltyPerItem` 룰(기본 -3점)을 `attachments` 규칙에도 명시적으로 적용.
    - 예컨대 구버전 시안 + 견적서 2건을 첨부한 경우, 건당 3점씩 총 6점이 깎이며 최대 `attachments` 항목의 maxScore(10)를 넘어서 감점되진 않도록 상한선을 적용합니다.

## Proposed Changes

### Types & Grading Logic

#### [MODIFY] src/types/index.ts
- `ActionRule` 인터페이스 구조 확장
  - `recommendedAction`: 감점 없음, 피드백 최소화.
  - `allowedActions`: 감점 없음, 팁 형태의 피드백 제공.
  - `forbiddenActions`: 감점 발생 (`wrongActionPenalty`), 피드백 제공.
- `AttachmentRule`에 `forbiddenPenaltyPerItem` 추가 지원 (기본 3점).

#### [MODIFY] src/lib/grading.ts
- **액션 채점 로직**: `forbiddenActions` 해당 시 점수 차감(-wrongActionPenalty) + 코멘트 세팅. `allowedActions` 해당 시 차감 없이 팁 코멘트만 반환하도록 수정.
- **첨부 금지 로직**: 첨부된 파일들 중 forbidden 목록(match 등)에 걸리는 수만큼 건당 `forbiddenPenaltyPerItem` 점수 차감. 감점 총합은 해당 항목 maxScore 내로 제한.

### Mission Data

#### [MODIFY] src/data/missions.ts
- **addressBook 업데이트**: 김선영 대리(마케팅팀), 박지훈 사원(마케팅팀), 김런투 대리(굿즈메이커), 최영수 팀장(굿즈메이커) 추가 (`isExternal: true` 반영).
- **mission_forward_summary 액션 룰 마이그레이션**: `recommendedAction: 'forward'`, `forbiddenActions: ['reply', 'reply_all']`.
- **신규 미션 추가 (`mission_cc_reply`)**:
  - `intro`: 선배 휴가 인수인계 상황.
  - `briefInfo`: 거래처 회신 상황 (힌트 없는 담백한 안내).
  - `inbox`: 텀블러 발주 포워딩(히스토리 4건 텍스트), 로고 시안 포워딩(히스토리 4건 텍스트), 회의록 등 3건.
  - `objectiveRules`:
    - `actionRule`: `recommended: 'compose'`, `allowed: ['reply', 'reply_all']`, `forbidden: ['forward']`.
    - `to`: 김런투 (forbidden: 김선영, 이수진, 최영수).
    - `cc`: 이수진, 최영수, 김선영 (forbidden: 김런투).
    - `attachments`: 로고시안_20250518.png 필수. 구버전 및 견적서 3건은 forbidden 등록.
  - `subjectiveRules`: `bodyStructure(15)`, `replyCompleteness(20)`, `contextAwareness(15)` 항목 지정. 필수 포함 요소 3종 설정.

### UI Updates

#### [MODIFY] src/components/compose/InboxPanel.tsx (or ComposePage.tsx)
- 인박스/자료함 탭 영역에 "✏️ 새 메일 쓰기" 버튼 렌더링. 클릭 핸들러에서 폼 리셋 로직 연동.

#### [MODIFY] src/pages/player/ResultPage.tsx
- Action Feedback 노출 시 팁(allowedAction)인지 감점(forbiddenAction)인지 상태를 구분하여 텍스트 색상(회색 vs 적색) 변경 적용.

## Verification Plan

### Automated Tests
- `test_cc_reply.ts` 스크립트를 작성하여 아래 3종 통합 테스트 실행 및 **Gemini 원시 응답을 그대로 공유**:
  - **Case R1 (모범)**: `compose` 액션, To 김런투, CC 3명, 최신 시안 첨부, 본문 완벽 작성. (만점 혹은 -2점 이내).
  - **Case R2 (액션 허용)**: `reply_all` 액션, 자동 세팅된 To/CC 수정하여 완벽 제출. (감점 없이 Result 액션 평가 항목에서 "파란색/회색" 팁 텍스트만 렌더링되는지 확인).
  - **Case R3 (첨부 실수)**: `compose` 액션, To/CC 완벽. 단, 구버전 시안 + 견적서 첨부. (`attachments` 항목에서 2건의 forbidden 첨부에 대해 6점이 차감되고, 3요소를 갖춘 구체적 피드백이 나오는지 검증).

위 내용 기반으로 승인이 나면 코드 수정 작업을 시작합니다.
