import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateCode } from '../lib/sessionDummy';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/ui/Card';
import { TextInput } from '../components/ui/TextInput';
import { Button } from '../components/ui/Button';

const StartPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ code?: string; name?: string }>({});
  
  const navigate = useNavigate();
  const { setSession, setParticipantName } = useApp();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { code?: string; name?: string } = {};

    // 1. 이름 유효성 검사
    const trimmedName = name.trim();
    const nameRegex = /^[가-힣a-zA-Z0-9]+$/;
    
    if (!trimmedName) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (trimmedName.length > 10) {
      newErrors.name = '이름은 10자 이내로 입력해주세요.';
    } else if (!nameRegex.test(trimmedName)) {
      newErrors.name = '이름은 한글, 영문, 숫자만 입력 가능합니다.';
    }

    // 2. 입장 코드 비어있음 검사
    if (!code.trim()) {
      newErrors.code = '입장 코드를 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 3. 코드 검증
      const result = await validateCode(code);
      if (result.valid && result.missionId && result.sessionName) {
        setSession(code, result.sessionName, result.missionId);
        setParticipantName(trimmedName);
        navigate(`/play/${code}/lobby`);
      } else {
        setErrors({ code: '유효하지 않은 입장 코드입니다.' });
      }
    } catch (err) {
      setErrors({ code: '코드 검증 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-surface">
      <Card className="w-[90%] md:max-w-[480px]">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-textPrimary mb-2">한울푸드 메일 실습</h1>
          <p className="text-textSecondary">신입사원 이메일 작성 트레이닝</p>
        </div>

        <form onSubmit={handleStart} className="flex flex-col gap-6">
          <TextInput
            label="입장 코드"
            placeholder="입장 코드 7자리를 입력하세요"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={errors.code}
            disabled={loading}
          />

          <TextInput
            label="이름 (직급 제외)"
            placeholder="예: 홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={loading}
          />

          <p className="text-xs text-textSecondary text-center leading-tight">
            같은 코드와 이름으로 다시 입장하면 이전 작성 내용을 이어서 진행할 수 있습니다.
          </p>

          <Button type="submit" size="lg" disabled={loading} className="mt-2">
            {loading ? '확인 중...' : '입장하기'}
          </Button>
        </form>

        <div className="mt-8 text-right border-t border-border pt-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-xs text-textSecondary hover:text-primary transition-colors"
          >
            관리자 모드
          </button>
        </div>
      </Card>
    </div>
  );
};

export default StartPage;
