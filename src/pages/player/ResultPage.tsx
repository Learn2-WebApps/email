import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { missions } from '../../data/missions';
import { markMissionCompleted, saveSubmission } from '../../lib/sessionStorage';
import type { Mission } from '../../types';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { replaceName } from "../../utils/intro";

interface LocalScoreResult {
  totalScore: number;
  breakdown: { category: string; score: number; maxScore: number; comment: string; }[];
  penalties: { reason: string; points: number }[];
  overallFeedback: string;
  actionFeedback?: string;
  actionStatus?: "allowed" | "forbidden";
}

const ResultPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { sessionCode, participantName, missionId } = useApp();

  const [mission, setMission] = useState<Mission | null>(null);
  const [result, setResult] = useState<LocalScoreResult | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [showMyAnswer, setShowMyAnswer] = useState(false);
  const [mySubmission, setMySubmission] = useState<any>(null);

  // 새로고침 시 중복 저장 방지 ref
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (!code || code !== sessionCode || !participantName || !missionId) {
      navigate('/', { replace: true });
      return;
    }

    const loadedMission = missions[missionId];
    if (!loadedMission) {
      navigate('/', { replace: true });
      return;
    }
    setMission(loadedMission);

    // 세션 스토리지에서 결과 가져오기
    const storedResult = sessionStorage.getItem(`result_${code}`);
    const storedSubmission = sessionStorage.getItem(`submission_${code}`);

    if (storedResult) {
      const parsedResult: LocalScoreResult = JSON.parse(storedResult);
      setResult(parsedResult);

      let parsedSubmissionData: any = null;
      if (storedSubmission) {
        parsedSubmissionData = JSON.parse(storedSubmission);
        setMySubmission(parsedSubmissionData);
      }

      // 중복 저장 방지 체크 후 1회만 Firebase 저장을 수행합니다.
      if (!hasSavedRef.current) {
        hasSavedRef.current = true;

        if (parsedSubmissionData) {
          const cleanFormData = {
            to: (parsedSubmissionData.to || []).map((p: any) => typeof p === 'string' ? p : p.name || p.id),
            cc: (parsedSubmissionData.cc || []).map((p: any) => typeof p === 'string' ? p : p.name || p.id),
            bcc: (parsedSubmissionData.bcc || []).map((p: any) => typeof p === 'string' ? p : p.name || p.id),
            subject: parsedSubmissionData.subject || '',
            body: parsedSubmissionData.body || '',
            attachments: (parsedSubmissionData.attachments || []).map((a: any) => typeof a === 'string' ? a : a.currentName || a.originalName || ''),
            actionType: parsedSubmissionData.actionType || 'compose',
          };

          // Firebase submissions 컬렉션 저장 및 미션 완료 상태 업데이트
          saveSubmission(code, participantName, missionId, cleanFormData, parsedResult).catch((err) => {
            console.error("Firebase 제출 기록 저장 실패:", err);
          });
        } else {
          // 백업 완료 처리
          markMissionCompleted(code, participantName, missionId).catch((err) => {
            console.error("미션 완료 상태 저장 실패:", err);
          });
        }
      }
    } else {
      navigate(`/play/${code}/lobby`, { replace: true });
    }
  }, [code, sessionCode, participantName, missionId, navigate]);

  if (!mission || !result) return null;

  const handleFinish = () => {
    sessionStorage.removeItem(`result_${code}`);
    sessionStorage.removeItem(`submission_${code}`);
    navigate(`/play/${code}/lobby`);
  };

  const scoreColor = result.totalScore >= 80 ? 'text-primary' : result.totalScore >= 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-12">
      <Header />

      <main className="w-full max-w-4xl mx-auto p-4 md:py-8 flex flex-col gap-6">

        {/* 총점 카드 */}
        <Card className="text-center py-8">
          <h2 className="text-lg font-bold text-textSecondary mb-2">최종 점수</h2>
          <div className={`text-6xl font-bold ${scoreColor} mb-4`}>
            {result.totalScore} <span className="text-2xl text-textSecondary font-medium">/ 100</span>
          </div>
          <p className="text-textPrimary font-medium">
            {result.totalScore >= 80 ? "훌륭합니다! 기본기가 탄탄하시네요." :
              result.totalScore >= 60 ? "조금 더 다듬으면 완벽해질 거예요!" :
                "아쉬운 결과지만, 이번 피드백을 통해 배워갑시다!"}
          </p>
        </Card>

        {/* 페널티 (있는 경우) */}
        {result.penalties && result.penalties.length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
              <span>⚠️</span> 감점 요인
            </h3>
            <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
              {result.penalties.map((pen, idx) => (
                <li key={idx}>
                  {pen.reason} <span className="font-bold">({pen.points}점)</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* 액션 피드백 (있는 경우) */}
        {result.actionFeedback && (
          <Card className={result.actionStatus === 'forbidden' ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}>
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${result.actionStatus === 'forbidden' ? 'text-red-700' : 'text-blue-700'}`}>
              <span>{result.actionStatus === 'forbidden' ? '⚠️' : '💡'}</span> 액션(새 메일/답장/전달) 평가
            </h3>
            <p className="text-sm text-textPrimary leading-relaxed">
              {result.actionFeedback}
            </p>
          </Card>
        )}

        {/* 종합 피드백 */}
        <Card>
          <h3 className="font-bold text-lg text-textPrimary mb-3 flex items-center gap-2">
            <span>💡</span> 종합 피드백 (AI)
          </h3>
          <div className="text-sm leading-relaxed whitespace-pre-wrap bg-blue-50 p-4 rounded text-textPrimary">
            {result.overallFeedback}
          </div>
        </Card>

        {/* 항목별 상세 점수 */}
        <Card>
          <h3 className="font-bold text-lg text-textPrimary mb-4">📊 항목별 상세 점수</h3>
          <div className="flex flex-col gap-4">
            {result.breakdown.map((item, idx) => (
              <div key={idx} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-sm text-textPrimary">{item.category}</span>
                  <span className="text-sm font-bold">{item.score} / {item.maxScore}</span>
                </div>
                {/* 프로그레스 바 */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-textSecondary">{item.comment}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 내 답안 보기 */}
        {mySubmission && (
          <Card>
            <button
              className="w-full flex justify-between items-center font-bold text-textPrimary"
              onClick={() => setShowMyAnswer(!showMyAnswer)}
            >
              <span>📄 내가 작성한 메일 보기</span>
              <span>{showMyAnswer ? '▲' : '▼'}</span>
            </button>
            {showMyAnswer && (
              <div className="mt-4 pt-4 border-t border-border text-sm space-y-2">
                <div><span className="font-bold w-16 inline-block">제목:</span> {mySubmission.subject}</div>
                <div><span className="font-bold w-16 inline-block">받는사람:</span> {mySubmission.to.map((p: any) => p.name).join(", ")}</div>
                {mySubmission.cc.length > 0 && (
                  <div><span className="font-bold w-16 inline-block">참조:</span> {mySubmission.cc.map((p: any) => p.name).join(", ")}</div>
                )}
                {mySubmission.bcc.length > 0 && (
                  <div><span className="font-bold w-16 inline-block">숨은참조:</span> {mySubmission.bcc.map((p: any) => p.name).join(", ")}</div>
                )}
                {mySubmission.attachments.length > 0 && (
                  <div><span className="font-bold w-16 inline-block">첨부파일:</span> {mySubmission.attachments.map((a: any) => a.currentName).join(", ")}</div>
                )}
                <div className="mt-4 p-4 bg-gray-50 rounded whitespace-pre-wrap border border-border">
                  {mySubmission.body}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 모범 답안 보기 */}
        <Card>
          <button
            className="w-full flex justify-between items-center font-bold text-textPrimary"
            onClick={() => setShowModel(!showModel)}
          >
            <span>✨ 모범 답안 보기</span>
            <span>{showModel ? '▲' : '▼'}</span>
          </button>
          {showModel && (
            <div className="mt-4 pt-4 border-t border-border text-sm space-y-2">
              <div><span className="font-bold w-16 inline-block">제목:</span> {mission.modelAnswer.subject}</div>
              {mission.modelAnswer.attachments && mission.modelAnswer.attachments.length > 0 && (
                <div><span className="font-bold w-16 inline-block">첨부파일:</span> {mission.modelAnswer.attachments.join(", ")}</div>
              )}
              <div className="mt-4 p-4 bg-blue-50 rounded whitespace-pre-wrap border border-blue-100">
                {replaceName(mission.modelAnswer.body, participantName || "")}
              </div>
            </div>
          )}
        </Card>

        {/* 하단 액션 */}
        <div className="flex justify-center mt-4">
          <Button size="lg" onClick={handleFinish} className="px-12">
            미션 목록으로 돌아가기
          </Button>
        </div>

      </main>
    </div>
  );
};

export default ResultPage;
