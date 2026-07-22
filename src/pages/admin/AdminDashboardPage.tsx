import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  isAdminAuthenticated, 
  setAdminAuthenticated, 
  createSessionCode, 
  listSessionCodes, 
  toggleSessionCodeActive, 
  deleteSessionCode,
  listSessionsByCode, 
  listSubmissionsBySessionCode, 
} from '../../lib/adminStorage';
import type {
  SessionCodeItem, 
  LearnerSessionItem, 
  SubmissionItem 
} from '../../lib/adminStorage';
import { Button } from '../../components/ui/Button';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [codes, setCodes] = useState<SessionCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // 선택된 세션 코드 상세
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [learners, setLearners] = useState<LearnerSessionItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 선택된 제출 내역 모달
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // 세션 코드 삭제 모달용 상태
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin', { replace: true });
      return;
    }
    loadCodes();
  }, [navigate]);

  const loadCodes = async () => {
    setLoading(true);
    const data = await listSessionCodes();
    setCodes(data);
    setLoading(false);
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    navigate('/admin', { replace: true });
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);

    try {
      const newCode = await createSessionCode(manualCode, description);
      setManualCode('');
      setDescription('');
      await loadCodes();
      handleSelectCode(newCode);
    } catch (err: any) {
      setFormError(err.message || "코드 생성 중 오류가 발생했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (code: string, currentActive: boolean) => {
    try {
      await toggleSessionCodeActive(code, !currentActive);
      await loadCodes();
    } catch (err) {
      console.error("상태 변경 실패:", err);
    }
  };

  const promptDeleteCode = (code: string) => {
    setCodeToDelete(code);
  };

  const confirmDeleteCode = async () => {
    if (!codeToDelete) return;
    const targetCode = codeToDelete;
    setCodeToDelete(null);

    try {
      await deleteSessionCode(targetCode);
      if (selectedCode === targetCode) {
        setSelectedCode(null);
        setLearners([]);
        setSubmissions([]);
      }
      await loadCodes();
      setToastMessage(`세션 코드 [${targetCode}] 및 관련 데이터가 완전히 삭제되었습니다.`);
    } catch (err: any) {
      setToastMessage(`삭제 중 오류가 발생했습니다: ${err.message || err}`);
    }
  };

  const handleSelectCode = async (code: string) => {
    setSelectedCode(code);
    setLoadingDetail(true);
    try {
      const [lList, sList] = await Promise.all([
        listSessionsByCode(code),
        listSubmissionsBySessionCode(code),
      ]);
      setLearners(lList);
      setSubmissions(sList);
    } catch (err) {
      console.error("세부 내역 로드 실패:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "-";
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* 관리자 전용 헤더 */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <h1 className="text-xl font-bold text-slate-100">한울푸드 이메일 튜터 대시보드</h1>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
            ADMIN MODE
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors border border-slate-600"
        >
          로그아웃
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-8">
        
        {/* 상단 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
            <p className="text-xs font-bold text-slate-400 mb-1">발급된 세션 코드</p>
            <p className="text-3xl font-extrabold text-indigo-400">{codes.length}개</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
            <p className="text-xs font-bold text-slate-400 mb-1">활성 상태 세션 코드</p>
            <p className="text-3xl font-extrabold text-emerald-400">
              {codes.filter(c => c.isActive).length}개
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
            <p className="text-xs font-bold text-slate-400 mb-1">총 등록 학습자 수</p>
            <p className="text-3xl font-extrabold text-blue-400">
              {codes.reduce((acc, cur) => acc + cur.learnerCount, 0)}명
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 좌측: 세션 코드 생성 및 목록 관리 (7컬럼) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 새 코드 생성 카드 */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl text-slate-100">
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <span>➕</span> 새 세션 코드 발급
              </h2>

              <form onSubmit={handleCreateCode} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      세션 코드 (선택: 미입력 시 자동 1000~9999)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="숫자 4자리 지정 입력"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      설명 / 그룹명 (선택)
                    </label>
                    <input
                      type="text"
                      placeholder="예: 6월 신입사원 1기"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-400 font-medium">⚠️ {formError}</p>
                )}

                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 border-none"
                  >
                    {creating ? "발급 중..." : "세션 코드 발급하기"}
                  </Button>
                </div>
              </form>
            </div>

            {/* 코드 목록 테이블 카드 */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>📋</span> 세션 코드 목록 (최신순)
                </h2>
                <button
                  onClick={loadCodes}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  새로고침
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-slate-400 py-8 text-center">목록을 불러오는 중...</p>
              ) : codes.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">등록된 세션 코드가 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="p-3">코드</th>
                        <th className="p-3">설명</th>
                        <th className="p-3">생성일</th>
                        <th className="p-3 text-center">학습자 수</th>
                        <th className="p-3 text-center">상태</th>
                        <th className="p-3 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {codes.map((item) => (
                        <tr
                          key={item.code}
                          className={`hover:bg-slate-700/40 transition-colors ${selectedCode === item.code ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : ''}`}
                        >
                          <td className="p-3 font-mono font-bold text-indigo-300 text-sm">{item.code}</td>
                          <td className="p-3 truncate max-w-[120px]">{item.description || "-"}</td>
                          <td className="p-3 text-slate-400">{formatDate(item.createdAt)}</td>
                          <td className="p-3 text-center font-bold text-blue-400">{item.learnerCount}명</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleActive(item.code, item.isActive)}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                                item.isActive 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                                  : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
                              }`}
                            >
                              {item.isActive ? '활성' : '비활성'}
                            </button>
                          </td>
                          <td className="p-3 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSelectCode(item.code)}
                              className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[11px] font-bold rounded transition-colors"
                            >
                              조회
                            </button>
                            <button
                              onClick={() => promptDeleteCode(item.code)}
                              className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-[11px] font-bold rounded transition-colors"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 선택된 코드 상세 및 제출 이력 뷰 (5컬럼) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl text-slate-100 min-h-[400px]">
              {!selectedCode ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                  <span className="text-4xl mb-2">🔍</span>
                  <p className="text-sm">좌측 목록에서 세션 코드를 선택하시면</p>
                  <p className="text-sm">학습자 목록과 제출 이력을 확인할 수 있습니다.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div>
                      <span className="text-xs text-slate-400 block">선택된 세션 코드</span>
                      <h3 className="text-xl font-bold text-indigo-300 font-mono">[{selectedCode}] 상세 조회</h3>
                    </div>
                    <button
                      onClick={() => handleSelectCode(selectedCode)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                      새로고침
                    </button>
                  </div>

                  {loadingDetail ? (
                    <p className="text-sm text-slate-400 py-8 text-center">상세 데이터를 불러오는 중...</p>
                  ) : (
                    <>
                      {/* 학습자 목록 */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                          <span>등록된 학습자 ({learners.length}명)</span>
                        </h4>
                        {learners.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center bg-slate-900/50 rounded border border-slate-700/50">
                            아직 이 코드로 진입한 학습자가 없습니다.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                            {learners.map((l) => (
                              <div key={l.id} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-slate-200">{l.learnerName}</span>
                                  <span className="text-slate-400 ml-2 text-[10px]">최근 접속: {formatDate(l.lastAccessedAt)}</span>
                                </div>
                                <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded text-[10px] border border-blue-800">
                                  완료: {l.completedMissions.length}건
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 제출 이력 목록 */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          제출 이력 목록 ({submissions.length}건)
                        </h4>
                        {submissions.length === 0 ? (
                          <p className="text-xs text-slate-400 py-6 text-center bg-slate-900/50 rounded border border-slate-700/50">
                            제출된 미션 이력이 없습니다.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {submissions.map((sub) => {
                              const score = sub.scoreResult?.totalScore ?? 0;
                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => setSelectedSubmission(sub)}
                                  className="bg-slate-900 hover:bg-slate-850 cursor-pointer p-3 rounded-lg border border-slate-700/80 transition-colors flex items-center justify-between"
                                >
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-slate-200 text-xs">{sub.learnerName}</span>
                                      <span className="text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                        {sub.missionId}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">{formatDate(sub.submittedAt)}</p>
                                  </div>
                                  <div className="text-right flex items-center gap-3">
                                    <span className={`text-base font-extrabold ${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                      {score}점
                                    </span>
                                    <span className="text-xs text-slate-400">▶</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* 팝업 모달 1: 세션 코드 일괄 삭제 확인 커스텀 모달 */}
      {codeToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">세션 코드 일괄 삭제</h3>
                <p className="text-xs text-slate-400 font-mono">코드: [{codeToDelete}]</p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700/80 text-xs text-slate-300 leading-relaxed">
              세션 코드 <strong className="text-red-400 font-mono font-bold">[{codeToDelete}]</strong>와(과) 연관된 <strong className="text-red-400">모든 학습자 데이터(sessions, submissions 이력)</strong>가 함께 완전 삭제됩니다.<br/><br/>
              정말 삭제하시겠습니까?
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCodeToDelete(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-600"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteCode}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
              >
                모두 삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 팝업 모달 2: 커스텀 알림 모달 */}
      {toastMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-4 text-center">
            <div className="text-3xl">ℹ️</div>
            <p className="text-sm text-slate-200 leading-relaxed">{toastMessage}</p>
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => setToastMessage(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 border-none text-xs"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 팝업 모달 3: 제출 상세 보기 모달 */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            
            <div className="p-5 border-b border-slate-700 flex items-center justify-between bg-slate-850">
              <div>
                <span className="text-xs text-indigo-400 font-bold block mb-0.5">
                  [{selectedSubmission.sessionCode}] {selectedSubmission.learnerName} 학습자 제출 상세
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  미션 ID: {selectedSubmission.missionId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs">
              
              {/* 총점 요약 */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/80 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-medium mb-1">제출 일시</p>
                  <p className="font-mono text-slate-200">{formatDate(selectedSubmission.submittedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-medium mb-1">최종 채점</p>
                  <p className="text-2xl font-extrabold text-indigo-400">
                    {selectedSubmission.scoreResult?.totalScore ?? 0} <span className="text-xs text-slate-500 font-normal">/ 100점</span>
                  </p>
                </div>
              </div>

              {/* 항목별 상세 점수 및 AI 피드백 */}
              {selectedSubmission.scoreResult?.breakdown && (
                <div>
                  <h4 className="font-bold text-slate-300 text-sm mb-3">📊 항목별 상세 평가</h4>
                  <div className="flex flex-col gap-2.5">
                    {selectedSubmission.scoreResult.breakdown.map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-900/60 p-3 rounded border border-slate-700/50">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-slate-200">{item.category}</span>
                          <span className="text-indigo-400">{item.score} / {item.maxScore}</span>
                        </div>
                        <p className="text-slate-400 whitespace-pre-line leading-relaxed">{item.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 감점 내역 */}
              {selectedSubmission.scoreResult?.penalties?.length > 0 && (
                <div className="bg-red-950/40 border border-red-800/60 p-3.5 rounded-lg">
                  <h4 className="font-bold text-red-400 mb-2">⚠️ 감점 내역</h4>
                  <ul className="list-disc pl-4 text-red-300 space-y-1">
                    {selectedSubmission.scoreResult.penalties.map((pen: any, idx: number) => (
                      <li key={idx}>{pen.reason} ({pen.points}점)</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 작성된 메일 폼 데이터 */}
              {selectedSubmission.formData && (
                <div>
                  <h4 className="font-bold text-slate-300 text-sm mb-3">📄 작성 및 제출된 이메일 폼</h4>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/80 space-y-2 font-mono">
                    <div><span className="text-slate-500 font-bold w-16 inline-block">액션:</span> <span className="text-indigo-300">{selectedSubmission.formData.actionType || 'compose'}</span></div>
                    <div><span className="text-slate-500 font-bold w-16 inline-block">제목:</span> <span className="text-slate-200">{selectedSubmission.formData.subject}</span></div>
                    <div><span className="text-slate-500 font-bold w-16 inline-block">수신인:</span> <span className="text-slate-300">{Array.isArray(selectedSubmission.formData.to) ? selectedSubmission.formData.to.join(", ") : selectedSubmission.formData.to}</span></div>
                    <div><span className="text-slate-500 font-bold w-16 inline-block">참조:</span> <span className="text-slate-300">{Array.isArray(selectedSubmission.formData.cc) ? selectedSubmission.formData.cc.join(", ") : selectedSubmission.formData.cc || "-"}</span></div>
                    <div><span className="text-slate-500 font-bold w-16 inline-block">첨부:</span> <span className="text-slate-300">{Array.isArray(selectedSubmission.formData.attachments) ? selectedSubmission.formData.attachments.join(", ") : selectedSubmission.formData.attachments || "-"}</span></div>
                    <div className="mt-3 pt-3 border-t border-slate-800 whitespace-pre-wrap font-sans text-slate-200 leading-relaxed bg-slate-950 p-3 rounded">
                      {selectedSubmission.formData.body}
                    </div>
                  </div>
                </div>
              )}

              {/* JSON 원본 보기 토글 */}
              <div className="pt-2">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  {showRawJson ? "▲ JSON 원본 접기" : "▼ JSON 원본 데이터 펼치기"}
                </button>
                {showRawJson && (
                  <pre className="mt-2 p-3 bg-black/80 rounded border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                    {JSON.stringify(selectedSubmission, null, 2)}
                  </pre>
                )}
              </div>

            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-850 flex justify-end">
              <Button
                onClick={() => setSelectedSubmission(null)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 border-none text-xs px-6 py-2"
              >
                닫기
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
