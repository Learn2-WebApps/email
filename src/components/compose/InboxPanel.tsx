import React, { useState } from "react";
import type { MissionEmail } from "../../types";
import { replaceName } from "../../utils/intro";

interface InboxPanelProps {
  emails: MissionEmail[];
  addressBook?: import('../../types').Person[];
  userName?: string;
  onAction?: (actionType: 'reply' | 'reply_all' | 'forward', email: MissionEmail) => void;
}

export const InboxPanel: React.FC<InboxPanelProps> = ({ emails, addressBook, userName, onAction }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getPersonName = (id: string) => {
    if (id === "p00") {
      return userName ? `마케팅팀 ${userName} 사원` : "마케팅팀 신입 사원";
    }
    if (!addressBook) return id;
    const person = addressBook.find(p => p.id === id);
    if (!person) return id;
    return `${person.team ? person.team + " " : ""}${person.name}${person.position ? " " + person.position : ""}${person.company ? " (" + person.company + ")" : ""}`.trim();
  };

  const selectedEmail = emails.find(e => e.id === selectedId);

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-textSecondary gap-2 py-12">
        <span className="text-4xl">📥</span>
        <p>받은 메일이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-white overflow-hidden shadow-sm">
      {/* 리스트 영역 */}
      <div className={`flex-1 overflow-y-auto ${selectedEmail ? "h-1/2" : "h-full"}`}>
        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => setSelectedId(selectedId === email.id ? null : email.id)}
            className={`p-3 border-b border-border cursor-pointer transition-colors
              ${selectedId === email.id ? "bg-blue-50 border-l-4 border-l-primary" : "hover:bg-surface"}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-sm truncate max-w-[150px]">{getPersonName(email.from)}</span>
              <span className="text-[10px] text-textSecondary shrink-0">{email.timestamp}</span>
            </div>
            <div className="text-sm font-medium truncate mb-1">{replaceName(email.subject, userName || "신입")}</div>
            <div className="text-xs text-textSecondary truncate">
              {email.attachments && email.attachments.length > 0 && <span className="mr-1">📎</span>}
              {replaceName(email.body, userName || "신입").replace(/\n/g, " ")}
            </div>
          </div>
        ))}
      </div>

      {/* 본문 영역 */}
      {selectedEmail && (
        <div className="h-1/2 border-t border-border flex flex-col bg-white">
          <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="font-bold text-base mb-2 truncate">{replaceName(selectedEmail.subject, userName || "신입")}</h3>
            <div className="text-xs space-y-1 text-textSecondary">
              <div><span className="font-semibold inline-block w-12">보낸사람:</span> {getPersonName(selectedEmail.from)}</div>
              <div><span className="font-semibold inline-block w-12">받는사람:</span> {selectedEmail.to.map(getPersonName).join(", ")}</div>
              {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                <div><span className="font-semibold inline-block w-12">참조:</span> {selectedEmail.cc.map(getPersonName).join(", ")}</div>
              )}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="flex gap-2 items-center mt-2">
                  <span className="font-semibold inline-block w-12 shrink-0">첨부파일:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEmail.attachments.map(f => (
                      <span key={f} className="bg-white border border-border px-2 py-0.5 rounded text-[10px]">📎 {f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>
            {onAction && (
              <div className="flex gap-2 shrink-0">
                 <button className="px-3 py-1.5 text-xs border border-border rounded bg-white text-gray-400 cursor-not-allowed">삭제</button>
                 <button className="px-3 py-1.5 text-xs border border-border rounded bg-white hover:bg-gray-50 transition-colors" onClick={() => onAction('reply', selectedEmail)}>답장</button>
                 <button className="px-3 py-1.5 text-xs border border-border rounded bg-white hover:bg-gray-50 transition-colors" onClick={() => onAction('reply_all', selectedEmail)}>전체답장</button>
                 <button className="px-3 py-1.5 text-xs border border-border rounded bg-white hover:bg-gray-50 transition-colors" onClick={() => onAction('forward', selectedEmail)}>전달</button>
              </div>
            )}
          </div>
          <div className="p-4 overflow-y-auto flex-1 text-sm whitespace-pre-wrap leading-relaxed text-textPrimary">
            {replaceName(selectedEmail.body, userName || "신입")}
          </div>
        </div>
      )}
    </div>
  );
};
