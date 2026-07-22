import type { Mission, ScoreResult, ComposeFormData, RecipientRule, SubjectRule, AttachmentRule } from "../types";
import { callGemini } from "./gemini";
import { buildGradingPrompt, extractJsonFromText } from "./gradingPrompt";

// 1. 수신인 공통 평가 (To, CC, BCC)
const gradeRecipients = (
  submitted: string[],
  rule: RecipientRule,
  categoryName: string
): { score: number; comment: string; penalties: { reason: string; points: number }[] } => {
  const { maxScore, required, forbidden, forbiddenPenaltyPerItem = 3 } = rule;
  
  const correctCount = submitted.filter(id => required.includes(id)).length;
  const missingCount = required.length - correctCount;
  
  const forbiddenCount = submitted.filter(id => forbidden.includes(id)).length;
  
  let score = maxScore;
  if (required.length > 0) {
    score = Math.max(0, Math.round((correctCount / required.length) * maxScore));
  } else if (submitted.length === 0 && maxScore > 0) {
    score = maxScore;
  }
  
  const penalties = [];
  if (forbiddenCount > 0) {
    penalties.push({
      reason: `${categoryName}에 포함되어서는 안 되는 인물 ${forbiddenCount}명 포함`,
      points: -(forbiddenCount * forbiddenPenaltyPerItem)
    });
  }

  let comment = "";
  if (missingCount === 0 && forbiddenCount === 0) {
    if (categoryName === "수신인") {
      comment = `모든 필수 ${categoryName}을 정확히 지정했습니다.\n💡 원칙: 수신인(To)은 메일을 읽고 실제 회신이나 행동을 취해야 하는 담당자로 한정해야 합니다.\n🎯 팁: 완벽하게 이해하셨네요!`;
    } else if (categoryName === "참조") {
      comment = `필수 ${categoryName} 지정이 적절합니다.\n💡 원칙: 참조(CC)는 직접 행동할 필요는 없지만 업무 흐름을 알아야 하는 상사나 유관 부서원에게 씁니다.\n🎯 팁: 진행 상황을 잘 공유하셨네요!`;
    } else {
      comment = `${categoryName} 지정이 적절합니다.\n💡 원칙: 숨은참조는 수신자들에게 서로의 메일 주소를 숨겨야 할 때 등 제한적으로 사용합니다.`;
    }
  } else {
    comment = required.length > 0 && missingCount > 0 ? `필수 ${categoryName} ${required.length}명 중 ${missingCount}명 누락.` : "";
    if (forbiddenCount > 0) comment += (comment ? " " : "") + `원칙에 맞지 않는 ${categoryName} ${forbiddenCount}명 포함.`;
    
    if (categoryName === "수신인") {
      comment += "\n💡 원칙: 수신인은 실제 행동할 담당자로 한정해야 합니다. 상사나 무관한 사람을 수신인에 넣으면 업무 혼선을 줍니다.\n🎯 개선: '누가 이 일을 처리할 것인가'를 먼저 떠올려보세요.";
    } else if (categoryName === "참조") {
      comment += "\n💡 원칙: 내 업무의 지시자나 직속 상사는 진행 상황을 파악할 수 있도록 반드시 참조에 넣어야 합니다.\n🎯 개선: 메일을 보내기 전 내 업무를 누가 알아야 할지 확인해보세요.";
    } else {
      comment += "\n💡 원칙: 특별한 이유가 없다면 숨은참조는 비워두는 것이 일반적입니다.";
    }
  }

  return { score, comment, penalties };
};

// 2. 제목 평가
const gradeSubject = (
  submittedStr: string,
  rule: SubjectRule
): { score: number; comment: string } => {
  let score = 0;
  let missing = 0;
  
  for (const keyword of rule.requiredKeywords) {
    if (submittedStr.includes(keyword.match)) {
      score += keyword.score;
    } else {
      missing++;
    }
  }

  let comment = "";
  if (missing === 0) {
    comment = "제목에 필수 키워드가 모두 포함되었습니다.\n💡 원칙: 비즈니스 메일 제목은 [소속] 목적어+목적(안내, 요청 등) 형태로 한눈에 파악할 수 있어야 합니다.\n🎯 팁: 훌륭합니다. 상대방이 메일함을 열었을 때 바로 의도를 파악할 수 있어요.";
  } else {
    comment = `필수 키워드 ${rule.requiredKeywords.length}개 중 ${missing}개 누락.\n💡 원칙: 수많은 메일 중에서도 본문 내용이 예상되도록 핵심 대상, 목적을 제목에 명시해야 합니다.\n🎯 개선: 제목만 보고도 무슨 메일인지 직관적으로 알 수 있게 작성해보세요.`;
  }
  
  score = Math.min(rule.maxScore, score);
  return { score, comment };
};

// 3. 첨부파일 평가
const gradeAttachments = (
  submittedAttachments: { originalName: string; currentName: string }[],
  rule: AttachmentRule
): { score: number; comment: string; penalties: { reason: string; points: number }[] } => {
  let score = 0;
  let missingCount = 0;
  const penalties = [];
  let forbiddenHits = 0;

  if (rule.noAttachmentsAllowed) {
    if (submittedAttachments.length > 0) {
      return {
        score: 0,
        comment: "첨부파일이 없어야 하는 메일입니다.\n💡 원칙: 오발송 정정 등에서는 불필요한 첨부를 빼고 내용만 전달하는 것이 좋습니다.",
        penalties: [{ reason: "불필요한 파일 첨부", points: -5 }]
      };
    }
    return { score: rule.maxScore, comment: "첨부파일 없이 깔끔하게 보냈습니다.", penalties: [] };
  }

  if (rule.required) {
    for (const req of rule.required) {
      if (submittedAttachments.some(a => a.originalName.includes(req.match))) {
        score += req.score;
      } else {
        missingCount++;
      }
    }
  } else {
    score = rule.maxScore;
  }

  if (rule.forbidden) {
    const penaltyPerItem = rule.forbiddenPenaltyPerItem ?? 3;
    let forbiddenPenaltySum = 0;
    
    for (const fb of rule.forbidden) {
      if (submittedAttachments.some(a => a.originalName.includes(fb.match))) {
        const penalty = fb.penalty ?? penaltyPerItem;
        // 최대 감점 상한선 적용 (maxScore를 넘지 않도록)
        if (forbiddenPenaltySum + penalty <= rule.maxScore) {
          penalties.push({ reason: fb.reason, points: -penalty });
          forbiddenPenaltySum += penalty;
        } else if (forbiddenPenaltySum < rule.maxScore) {
          const remainingPenalty = rule.maxScore - forbiddenPenaltySum;
          penalties.push({ reason: fb.reason, points: -remainingPenalty });
          forbiddenPenaltySum += remainingPenalty;
        }
        forbiddenHits++;
      }
    }
  }

  let comment = "";
  if (missingCount === 0 && forbiddenHits === 0) {
    comment = "첨부파일이 적절히 첨부되었습니다.\n💡 원칙: 언급된 파일이 빠짐없이 들어갔는지 발송 전 확인하는 습관은 필수입니다.\n🎯 팁: 아주 꼼꼼하게 잘 챙기셨네요!";
  } else {
    comment = missingCount > 0 ? "필수 첨부파일 미포함." : "";
    if (forbiddenHits > 0) comment += (comment ? " " : "") + "(원칙에 어긋난 문서 잘못 첨부됨)";
    comment += "\n💡 원칙: 본문에 첨부를 언급했다면 반드시 파일이 있는지 확인해야 합니다. 사내 대외비 문서 유출 등은 큰 사고가 될 수 있습니다.\n🎯 개선: 발송 버튼을 누르기 전에 첨부파일 목록을 다시 확인해보세요.";
  }

  score = Math.min(rule.maxScore, score);
  return { score, comment, penalties };
};

// 4. 액션 평가 함수
const gradeAction = (
  submittedAction: 'compose' | 'reply' | 'reply_all' | 'forward' | undefined,
  rule?: Mission["objectiveRules"]["actionRule"]
): { score: number; comment: string; actionStatus?: "allowed" | "forbidden" } => {
  if (!rule) {
    return { score: 0, comment: "" }; 
  }
  
  const action = submittedAction || 'compose'; 
  let score = 0;
  let comment = "";
  let actionStatus: "allowed" | "forbidden" | undefined = undefined;

  if (action === rule.recommendedAction) {
    comment = rule.actionFeedback[action] || "올바른 액션을 선택했습니다.";
  } else if (rule.allowedActions?.includes(action)) {
    comment = rule.actionFeedback[action] || "허용되는 액션이지만, 더 좋은 방법이 있을 수 있습니다.";
    actionStatus = "allowed";
  } else if (rule.forbiddenActions?.includes(action)) {
    score = -rule.wrongActionPenalty;
    comment = rule.actionFeedback[action] || "잘못된 액션을 선택했습니다.";
    actionStatus = "forbidden";
  } else {
    // 정의되지 않은 경우 (금지로 간주)
    score = -rule.wrongActionPenalty;
    comment = rule.actionFeedback[action] || "잘못된 액션을 선택했습니다.";
    actionStatus = "forbidden";
  }

  return { score, comment, actionStatus };
};

// 5. 메인 평가 함수
export const gradeSubmission = async (
  submission: ComposeFormData,
  mission: Mission
): Promise<ScoreResult> => {
  let totalScore = 0;
  const breakdown: ScoreResult['breakdown'] = [];
  const penalties: ScoreResult['penalties'] = [];
  
  const rules = mission.objectiveRules;

  const toRes = gradeRecipients(submission.to.map(p => p.id), rules.to, "수신인");
  breakdown.push({ category: "수신인", score: toRes.score, maxScore: rules.to.maxScore, comment: toRes.comment });
  totalScore += toRes.score;
  penalties.push(...toRes.penalties);

  const ccRes = gradeRecipients(submission.cc.map(p => p.id), rules.cc, "참조");
  breakdown.push({ category: "참조", score: ccRes.score, maxScore: rules.cc.maxScore, comment: ccRes.comment });
  totalScore += ccRes.score;
  penalties.push(...ccRes.penalties);

  const bccRes = gradeRecipients(submission.bcc.map(p => p.id), rules.bcc, "숨은참조");
  breakdown.push({ category: "숨은참조", score: bccRes.score, maxScore: rules.bcc.maxScore, comment: bccRes.comment });
  totalScore += bccRes.score;
  penalties.push(...bccRes.penalties);

  const subjectRes = gradeSubject(submission.subject, rules.subject);
  breakdown.push({ category: "제목", score: subjectRes.score, maxScore: rules.subject.maxScore, comment: subjectRes.comment });
  totalScore += subjectRes.score;

  const attachRes = gradeAttachments(submission.attachments, rules.attachments);
  breakdown.push({ category: "첨부파일", score: attachRes.score, maxScore: rules.attachments.maxScore, comment: attachRes.comment });
  totalScore += attachRes.score;
  penalties.push(...attachRes.penalties);

  // 액션 채점 추가
  let actionFeedback = undefined;
  let actionStatus = undefined;
  if (rules.actionRule) {
    const actionRes = gradeAction(submission.actionType, rules.actionRule);
    if (actionRes.score < 0) {
      penalties.push({ reason: "부적절한 액션 선택 (답장/전달/쓰기 등)", points: actionRes.score });
    }
    actionFeedback = actionRes.comment;
    actionStatus = actionRes.actionStatus;
  }

  let geminiResult: any;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = buildGradingPrompt(submission, mission);
      const responseText = await callGemini(prompt);
      geminiResult = extractJsonFromText(responseText);
    } catch (error) {
      console.warn("Gemini 채점 실패, 더미 결과 사용:", error);
    }
  } else {
    console.warn("Gemini API Key가 없습니다. 더미 채점 결과를 반환합니다.");
  }

  if (!geminiResult) {
    geminiResult = {};
    for (const item of mission.subjectiveRules.items) {
      geminiResult[item.id + "Score"] = item.maxScore - 2;
      geminiResult[item.id + "Comment"] = `(데모) ${item.label} 피드백입니다.\n💡 원칙: ${item.description}\n🎯 팁: 무난하게 작성되었습니다.`;
    }
    geminiResult.overallFeedback = "(데모 모드) 실제 채점은 API 키 등록 후 가능합니다.";
  }

  const parseComment = (comment: any) => {
    if (typeof comment === "string") return comment;
    if (typeof comment === "object" && comment !== null) {
      return Object.entries(comment).map(([k, v]) => `${k}: ${v}`).join('\n');
    }
    return String(comment || "");
  };

  for (const item of mission.subjectiveRules.items) {
    const s = Math.min(item.maxScore, Math.max(0, geminiResult[item.id + "Score"] || 0));
    breakdown.push({
      category: item.label,
      score: s,
      maxScore: item.maxScore,
      comment: parseComment(geminiResult[item.id + "Comment"])
    });
    totalScore += s;
  }

  let finalTotal = totalScore;
  for (const pen of penalties) {
    finalTotal += pen.points;
  }
  finalTotal = Math.max(0, finalTotal);

  return {
    totalScore: finalTotal,
    breakdown,
    penalties,
    overallFeedback: geminiResult.overallFeedback || "작성하시느라 수고하셨습니다.",
    ...(actionFeedback ? { actionFeedback } : {}),
    ...(actionStatus ? { actionStatus } : {}),
  } as ScoreResult;
};
