import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { missions } from '../../data/missions';
import { getCompletedMissions } from '../../lib/sessionStorage';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const MissionLobbyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { sessionCode, participantName, setMissionId } = useApp();
  
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (!code || code !== sessionCode || !participantName) {
      navigate('/', { replace: true });
      return;
    }

    const loadCompleted = async () => {
      const c = await getCompletedMissions(code);
      setCompleted(c);
    };
    loadCompleted();
  }, [code, sessionCode, participantName, navigate]);

  const handleStartMission = (id: string) => {
    setMissionId(id);
    navigate(`/play/${code}/compose`);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-[800px] mx-auto p-4 md:py-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">📋 진행 가능한 미션</h2>
        
        <div className="flex flex-col gap-4">
          {Object.values(missions).map((mission) => {
            const isCompleted = completed.includes(mission.id);
            const isLocked = !!(mission.unlockCondition && !completed.includes(mission.unlockCondition));
            
            return (
              <Card key={mission.id} className={`shadow-sm border transition-colors ${isLocked ? 'opacity-60 bg-gray-50 border-gray-200' : 'border-border hover:border-primary'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-textPrimary">
                        {isLocked && <span className="mr-2">🔒</span>}
                        {mission.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          완료됨
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-textSecondary whitespace-pre-line line-clamp-2">
                      {mission.briefInfo ? mission.briefInfo : mission.intro}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex justify-end">
                    <Button 
                      onClick={() => handleStartMission(mission.id)}
                      disabled={isLocked}
                      variant={isCompleted ? 'secondary' : 'primary'}
                      className={isLocked ? 'bg-gray-200 text-gray-500 border-gray-200' : ''}
                    >
                      {isLocked ? '잠김' : isCompleted ? '다시 도전하기' : '시작하기'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default MissionLobbyPage;
