import React from "react";
import { useApp } from "../../contexts/AppContext";

export const Header: React.FC = () => {
  const { participantName } = useApp();

  return (
    <header className="bg-white border-b border-border px-4 py-3 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-xl">📧</span>
        <h1 className="font-bold text-textPrimary hidden sm:block">한울푸드 메일 실습</h1>
      </div>
      
      {participantName && (
        <div className="text-sm font-medium text-textSecondary">
          <span className="text-primary">{participantName}</span> 사원
        </div>
      )}
    </header>
  );
};
