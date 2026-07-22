import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAdminAuthenticated } from '../../lib/adminStorage';
import { Button } from '../../components/ui/Button';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 4자리 숫자 필터링
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setPassword(value);
      setError(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length !== 4) {
      setError("관리자 비밀번호 4자리를 입력해 주세요.");
      return;
    }

    setLoading(true);
    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || "0067";

    if (password === expectedPassword) {
      // 브라우저 sessionStorage - 우리 sessionStorage.ts 모듈과 무관
      setAdminAuthenticated(true);
      navigate('/admin/dashboard');
    } else {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mb-4 text-2xl border border-slate-600">
            🛡️
          </div>
          <div className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-indigo-500/30">
            ADMIN MODE
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">관리자 로그인</h1>
          <p className="text-xs text-slate-400">한울푸드 이메일 튜터 시스템 관리자 페이지</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-300">
              관리자 비밀번호 (숫자 4자리)
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="숫자 4자리 입력"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center font-mono text-xl tracking-widest"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400 font-medium text-center mt-1">
                ⚠️ {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || password.length !== 4}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 border-none disabled:bg-slate-700 disabled:text-slate-500"
          >
            {loading ? "인증 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-700 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← 학습자 메인 화면으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
