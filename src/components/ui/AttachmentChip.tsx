import React, { useState, useEffect, useRef } from "react";

interface AttachmentChipProps {
  fileName: string;
  originalFileName: string;
  onRename: (newName: string) => void;
  onRemove: () => void;
}

export const AttachmentChip: React.FC<AttachmentChipProps> = ({
  fileName,
  onRename,
  onRemove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(fileName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== fileName) {
      onRename(editValue.trim());
    } else {
      setEditValue(fileName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(fileName);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 bg-surface border border-border px-3 py-1 rounded-full text-sm group">
      <span className="text-textSecondary">📎</span>
      
      {isEditing ? (
        <input
          ref={inputRef}
          className="bg-white border border-primary outline-none px-1 rounded text-xs min-w-[120px]"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span 
          className="cursor-pointer hover:text-primary transition-colors max-w-[180px] truncate"
          onClick={() => setIsEditing(true)}
          title="클릭하여 이름 수정"
        >
          {fileName}
        </span>
      )}

      <button
        onClick={onRemove}
        className="text-textSecondary hover:text-red-500 transition-colors ml-1 font-bold"
        aria-label="제거"
      >
        ✕
      </button>
    </div>
  );
};
