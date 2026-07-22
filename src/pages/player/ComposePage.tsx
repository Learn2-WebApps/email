import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getMission } from '../../lib/sessionDummy';
import type { Mission, DriveFile, ComposeFormData } from '../../types';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { InboxPanel } from '../../components/compose/InboxPanel';
import { DrivePanel } from '../../components/compose/DrivePanel';
import { ComposeForm } from '../../components/compose/ComposeForm';
import { replaceName } from '../../utils/intro';
import { gradeSubmission } from '../../lib/grading';

type TabType = 'compose' | 'inbox' | 'drive' | 'info';

const ComposePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { sessionCode, participantName, missionId } = useApp();
  
  const [mission, setMission] = useState<Mission | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('compose');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태 관리
  const [formData, setFormData] = useState<ComposeFormData>({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    body: '',
    attachments: [],
  });

  useEffect(() => {
    if (!code || code !== sessionCode || !participantName || !missionId) {
      navigate('/', { replace: true });
      return;
    }

    const loadedMission = getMission(missionId);
    if (loadedMission) {
      setMission(loadedMission);
    } else {
      navigate('/', { replace: true });
    }
  }, [code, sessionCode, participantName, missionId, navigate]);

  if (!mission) return null;

  const handleAttach = (file: DriveFile) => {
    // 이미 첨부된 파일인지 확인
    if (formData.attachments.find((a: any) => a.originalName === file.name)) {
      alert('이미 첨부된 파일입니다.');
      return;
    }

    setFormData((prev: ComposeFormData) => ({
      ...prev,
      attachments: [...prev.attachments, { originalName: file.name, currentName: file.name }]
    }));

    // 모바일에서는 첨부 후 작성 탭으로 자동 이동
    setActiveTab('compose');
  };

  const handleAction = (actionType: 'reply' | 'reply_all' | 'forward', email: any) => {
    let to: any[] = [];
    let cc: any[] = [];
    let subject = '';
    let body = '';
    let attachments: any[] = [];

    const getPerson = (id: string) => {
      if (id === "p00") {
        return { id: "p00", name: participantName || "신입", team: "마케팅팀", position: "사원" };
      }
      return mission.addressBook.find(p => p.id === id) || { id, name: id, team: '', position: '' } as any;
    };
    
    const sender = getPerson(email.from);
    const toNames = email.to.map((id: string) => {
      const p = getPerson(id);
      return `${p.name} ${p.position} (${p.team})`.trim();
    }).join(", ");
    const ccNames = (email.cc || []).map((id: string) => {
      const p = getPerson(id);
      return `${p.name} ${p.position} (${p.team})`.trim();
    }).join(", ");

    const processedSubject = replaceName(email.subject, participantName || "신입");
    const processedBody = replaceName(email.body, participantName || "신입");
    let ccLine = ccNames ? `\nCc: ${ccNames}` : '';
    const originalMessageText = `\n\n----- Original Message -----\nFrom: ${sender.name} ${sender.position} (${sender.team})\nTo: ${toNames}${ccLine}\nSent: ${email.timestamp}\nSubject: ${processedSubject}\n\n${processedBody}`;

    if (actionType === 'reply') {
      to = [sender];
      subject = `Re: ${email.subject.replace(/^(Re:\s*)+/i, '')}`;
      body = originalMessageText;
    } else if (actionType === 'reply_all') {
      to = [sender, ...email.to.map((t: string) => mission.addressBook.find(p => p.id === t)).filter(Boolean)];
      cc = (email.cc || []).map((c: string) => mission.addressBook.find(p => p.id === c)).filter(Boolean);
      subject = `Re: ${email.subject.replace(/^(Re:\s*)+/i, '')}`;
      body = originalMessageText;
    } else if (actionType === 'forward') {
      subject = `Fwd: ${email.subject.replace(/^(Fwd:\s*)+/i, '')}`;
      body = originalMessageText;
      attachments = (email.attachments || []).map((a: string) => ({ originalName: a, currentName: a }));
    }

    // Deduplicate
    to = to.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    cc = cc.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

    if (!formData.body || window.confirm('기존 작성 중인 내용이 덮어씌워집니다. 진행하시겠습니까?')) {
      setFormData({
        to,
        cc,
        bcc: [],
        subject,
        body,
        attachments,
        actionType,
      });
      setActiveTab('compose');
    }
  };

  const handleReset = () => {
    if (window.confirm('작성 중인 내용을 모두 초기화하시겠습니까?')) {
      setFormData({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body: '',
        attachments: [],
      });
    }
  };

  const handleSubmit = async () => {
    if (formData.to.length === 0) {
      alert('받는사람을 1명 이상 지정해주세요.');
      return;
    }
    if (!formData.subject.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.body.trim()) {
      alert('본문 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await gradeSubmission(formData, mission);
      sessionStorage.setItem(`result_${code}`, JSON.stringify(result));
      sessionStorage.setItem(`submission_${code}`, JSON.stringify(formData));
      navigate(`/play/${code}/result`);
    } catch (error) {
      console.error("채점 에러:", error);
      alert("채점 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const introText = replaceName(mission.intro, participantName!);

  return (
    <div className="min-h-screen bg-surface flex flex-col h-screen overflow-hidden relative">
      <Header />
      
      {/* 로딩 오버레이 */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="text-6xl mb-4 animate-bounce">🤖</div>
          <h2 className="text-xl font-bold text-primary mb-2">채점 중입니다...</h2>
          <p className="text-textSecondary">잠시만 기다려주세요.</p>
        </div>
      )}

      {/* 모바일 탭 메뉴 */}
      <div className="md:hidden flex border-b border-border bg-white sticky top-[49px] z-10">
        {[
          { id: 'compose', label: '✏️ 작성' },
          { id: 'inbox', label: '📥 받은메일' },
          { id: 'drive', label: '📁 자료함' },
          { id: 'info', label: '📋 미션' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 
              ${activeTab === tab.id ? 'text-primary border-primary bg-blue-50' : 'text-textSecondary border-transparent'}`}
            onClick={() => setActiveTab(tab.id as TabType)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden p-2 md:p-4">
        {/* PC 레이아웃: 3분할 */}
        <div className="hidden md:grid grid-cols-12 gap-4 h-full">
          {/* 좌측: 미션 정보 */}
          <div className="col-span-3 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <h2 className="font-bold text-lg text-textPrimary px-1">📋 미션 정보</h2>
              <Card className="p-4 text-sm leading-relaxed">
                <p className="font-bold text-primary mb-2">[{mission.title}]</p>
                <div className="whitespace-pre-line border-b border-border pb-3 mb-3">
                  {introText}
                </div>
                {mission.briefInfo && (
                  <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100 whitespace-pre-line">
                    <p className="font-bold mb-1">참고 정보:</p>
                    {mission.briefInfo}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* 중앙: 인박스 / 자료함 탭 */}
          <div className="col-span-4 flex flex-col h-full overflow-hidden">
            <div className="flex mb-2 gap-2 justify-between items-end">
              <div className="flex gap-2">
                <button 
                  className={`px-4 py-1.5 rounded-t-lg text-sm font-bold transition-colors
                    ${activeTab === 'inbox' || activeTab === 'compose' ? 'bg-white border border-b-0 border-border text-primary' : 'text-textSecondary hover:bg-white/50'}`}
                  onClick={() => setActiveTab('inbox')}
                >
                  📥 받은편지함
                </button>
                <button 
                  className={`px-4 py-1.5 rounded-t-lg text-sm font-bold transition-colors
                    ${activeTab === 'drive' ? 'bg-white border border-b-0 border-border text-primary' : 'text-textSecondary hover:bg-white/50'}`}
                  onClick={() => setActiveTab('drive')}
                >
                  📁 자료함
                </button>
              </div>
              <button 
                className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded shadow-sm hover:bg-primary/90 transition-colors mb-0.5 shrink-0"
                onClick={() => {
                  if (!formData.body || window.confirm('새 메일을 작성하시겠습니까? (작성 중인 내용은 초기화됩니다)')) {
                    setFormData({
                      to: [],
                      cc: [],
                      bcc: [],
                      subject: '',
                      body: '',
                      attachments: [],
                      actionType: 'compose',
                    });
                    setActiveTab('compose');
                  }
                }}
              >
                ✏️ 새 메일 쓰기
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {activeTab === 'drive' ? (
                <DrivePanel files={mission.driveFiles} onAttach={handleAttach} />
              ) : (
                <InboxPanel emails={mission.inbox} addressBook={mission.addressBook} userName={participantName || undefined} onAction={handleAction} />
              )}
            </div>
          </div>

          {/* 우측: 작성 폼 */}
          <div className="col-span-5 h-full overflow-hidden">
            <ComposeForm 
              data={formData}
              addressBook={mission.addressBook}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* 모바일 레이아웃: 탭 전환 */}
        <div className="md:hidden h-full">
          {activeTab === 'compose' && (
            <ComposeForm 
              data={formData}
              addressBook={mission.addressBook}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          )}
          {activeTab === 'inbox' && <InboxPanel emails={mission.inbox} addressBook={mission.addressBook} userName={participantName || undefined} onAction={handleAction} />}
          {activeTab === 'drive' && <DrivePanel files={mission.driveFiles} onAttach={handleAttach} />}
          {activeTab === 'info' && (
            <div className="overflow-y-auto h-full pb-12">
              <Card className="p-4 text-sm leading-relaxed">
                <p className="font-bold text-primary mb-2">[{mission.title}]</p>
                <div className="whitespace-pre-line border-b border-border pb-3 mb-3">
                  {introText}
                </div>
                {mission.briefInfo && (
                  <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100 whitespace-pre-line">
                    <p className="font-bold mb-1">참고 정보:</p>
                    {mission.briefInfo}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComposePage;
