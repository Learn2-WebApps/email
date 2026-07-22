import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrCreateSession } from '../lib/sessionStorage';
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 4자리 숫자 필터링
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setCode(value);
      if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

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

    // 2. 4자리 숫자 입장 코드 검사
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 4) {
      newErrors.code = '입장 코드는 4자리 숫자여야 합니다.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 3. Firebase 세션 검증 및 생성/조회
      await getOrCreateSession(trimmedCode, trimmedName);

      // 성공 시 AppContext 및 localStorage 업데이트
      setSession(trimmedCode, "한울푸드 이메일 실습", "mission_tasting");
      setParticipantName(trimmedName);

      // 미션 로비로 이동
      navigate(`/play/${trimmedCode}/lobby`);
    } catch (err: any) {
      setErrors({ code: err.message || '유효하지 않은 세션 코드입니다. 관리자에게 문의하세요.' });
    } finally {
      setLoading(false);
    }
  };

  const isValid = code.trim().length === 4 && name.trim().length > 0;

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
            label="입장 코드 (숫자 4자리)"
            placeholder="입장 코드 4자리를 입력하세요"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={code}
            onChange={handleCodeChange}
            error={errors.code}
            disabled={loading}
          />

          <TextInput
            label="이름 (직급 제외)"
            placeholder="예: 홍길동"
            value={name}
            onChange={handleNameChange}
            error={errors.name}
            disabled={loading}
          />

          <p className="text-xs text-textSecondary text-center leading-tight">
            같은 코드와 이름으로 다시 입장하면 이전 작성 내용을 이어서 진행할 수 있습니다.
          </p>

          <Button 
            type="submit" 
            size="lg" 
            disabled={loading || !isValid} 
            className="mt-2"
          >
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
