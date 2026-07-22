import React from 'react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">관리자 대시보드</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <h2 className="font-bold mb-2">활성 세션</h2>
            <p className="text-2xl text-primary font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <h2 className="font-bold mb-2">전체 제출</h2>
            <p className="text-2xl text-primary font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
            <h2 className="font-bold mb-2">평가 대기</h2>
            <p className="text-2xl text-primary font-bold">0</p>
          </div>
        </div>
        <p className="mt-8 text-center text-textSecondary">대시보드 화면 (준비 중)</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
