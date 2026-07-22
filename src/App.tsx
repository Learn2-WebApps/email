import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import StartPage from './pages/StartPage';
import MissionLobbyPage from './pages/player/MissionLobbyPage';
import ComposePage from './pages/player/ComposePage';
import ResultPage from './pages/player/ResultPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import { useApp } from './contexts/AppContext';

/**
 * /play/:code 접속 시 상태에 따라 로비로 보내거나 시작화면으로 리다이렉트
 */
const PlayCodeRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const { sessionCode, participantName } = useApp();

  if (sessionCode === code && participantName) {
    return <Navigate to="lobby" replace />;
  }
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        
        {/* /play/:code 접속 시 로직 처리 */}
        <Route path="/play/:code" element={<PlayCodeRedirect />} />
        
        <Route path="/play/:code/lobby" element={<MissionLobbyPage />} />
        <Route path="/play/:code/compose" element={<ComposePage />} />
        <Route path="/play/:code/result" element={<ResultPage />} />
        
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        
        {/* 잘못된 경로는 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
