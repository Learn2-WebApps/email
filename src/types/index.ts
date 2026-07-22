/**
 * 인물 정보 (주소록용)
 */
export interface Person {
  id: string;
  name: string;
  position: string;
  team: string;
  company?: string;
  isExternal: boolean;
}

/**
 * 미션 내 수신된 이메일 정보
 */
export interface MissionEmail {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: string[];
  timestamp: string;
}

/**
 * 드라이브 파일 정보
 */
export interface DriveFile {
  name: string;
  isConfidential?: boolean;
  note?: string;
}

/**
 * 미션 상세 정보
 */
export interface Mission {
  id: string;
  title: string;
  intro: string;
  briefInfo?: string;
  unlockCondition?: string;
  addressBook: Person[];
  inbox: MissionEmail[];
  driveFiles: DriveFile[];
  modelAnswer: ModelAnswer;
  objectiveRules: ObjectiveRules;
  subjectiveRules: SubjectiveRules;
}

/**
 * 모범 답안 구성
 */
export interface ModelAnswer {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  attachments: string[];
}

/**
 * 수신인 규칙 (To, CC, BCC 공통)
 */
export interface RecipientRule {
  maxScore: number;
  required: string[];
  allowed: string[];
  forbidden: string[];
  forbiddenPenaltyPerItem?: number; // 기본값 3
}

/**
 * 첨부파일 규칙
 */
export interface AttachmentRule {
  maxScore: number;
  required?: { match: string; score: number }[];
  forbidden?: { match: string; penalty: number; reason: string }[];
  forbiddenPenaltyPerItem?: number; // 기본값 3
  noAttachmentsAllowed?: boolean;
}

/**
 * 제목 규칙
 */
export interface SubjectRule {
  maxScore: number;
  requiredKeywords: { match: string; score: number }[];
  bonusKeywords?: { match: string; score: number }[];
}

/**
 * 액션 채점 규칙 (답장/전체답장/전달)
 */
export interface ActionRule {
  recommendedAction: 'compose' | 'reply' | 'reply_all' | 'forward';
  allowedActions?: Array<'compose' | 'reply' | 'reply_all' | 'forward'>;
  forbiddenActions?: Array<'compose' | 'reply' | 'reply_all' | 'forward'>;
  wrongActionPenalty: number;
  actionFeedback: Record<string, string>;
}

/**
 * 객관식 채점 규칙
 */
export interface ObjectiveRules {
  actionRule?: ActionRule;
  to: RecipientRule;
  cc: RecipientRule;
  bcc: RecipientRule;
  subject: SubjectRule;
  attachments: AttachmentRule;
}

/**
 * AI(Gemini) 주관식 채점 규칙
 */
export interface SubjectiveRules {
  requiredContentElements?: string[];
  items: {
    id: string;
    label: string;
    maxScore: number;
    description: string;
  }[];
}

/**
 * 제출 정보
 */
export interface Submission {
  id: string;
  code: string; // 세션 코드
  participantName: string;
  missionId: string;
  email: SubmittedEmail;
  score?: ScoreResult;
  submittedAt: number;
  status: "in_progress" | "submitted" | "evaluated";
}

/**
 * 제출된 이메일 내용
 */
export interface SubmittedEmail {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  attachments: string[];
  actionType?: 'compose' | 'reply' | 'reply_all' | 'forward';
}

/**
 * 메일 작성 폼 데이터 구조
 */
export interface ComposeFormData {
  to: Person[];
  cc: Person[];
  bcc: Person[];
  subject: string;
  body: string;
  attachments: { originalName: string; currentName: string }[];
  actionType?: 'compose' | 'reply' | 'reply_all' | 'forward';
}

/**
 * 평가 결과
 */
export interface ScoreResult {
  totalScore: number;
  breakdown: {
    category: string;
    score: number;
    maxScore: number;
    comment: string;
  }[];
  penalties: { reason: string; points: number }[];
  overallFeedback: string;
  actionFeedback?: string;
  actionStatus?: "allowed" | "forbidden"; // 액션 피드백 색상 구분을 위함
}

/**
 * 교육 세션 정보
 */
export interface Session {
  code: string; // 접속 코드
  missionId: string;
  status: "active" | "ended";
  createdAt: number;
  endedAt?: number;
}

/**
 * 참가자 정보
 */
export interface Participant {
  name: string;
  code: string; // 세션 코드
  joinedAt: number;
  status: "waiting" | "in_progress" | "submitted";
}
