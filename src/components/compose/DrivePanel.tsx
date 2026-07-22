import React from "react";
import type { DriveFile } from "../../types";
import { Button } from "../ui/Button";

interface DrivePanelProps {
  files: DriveFile[];
  onAttach: (file: DriveFile) => void;
}

export const DrivePanel: React.FC<DrivePanelProps> = ({ files, onAttach }) => {
  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-white overflow-hidden shadow-sm">
      <div className="bg-surface px-4 py-2 border-b border-border flex items-center gap-2">
        <span className="text-sm font-bold text-textPrimary">📂 공유 드라이브</span>
        <span className="text-[10px] text-textSecondary">마케팅팀 공유 폴더</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {files.map((file, idx) => (
          <div 
            key={idx} 
            className="p-3 border-b border-border flex items-center justify-between hover:bg-surface transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-xl shrink-0">📄</span>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${file.isConfidential ? "text-red-600" : "text-textPrimary"}`}>
                    {file.name}
                  </span>
                  {file.isConfidential && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded flex items-center gap-0.5">
                      🔒 대외비
                    </span>
                  )}
                </div>
                {file.note && <div className="text-[10px] text-textSecondary truncate">{file.note}</div>}
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => onAttach(file)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              첨부
            </Button>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 text-[10px] text-textSecondary text-center italic">
        * 미션에 필요한 파일을 클릭하여 메일에 첨부하세요.
      </div>
    </div>
  );
};
