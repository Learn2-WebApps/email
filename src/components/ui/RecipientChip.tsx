import React from "react";
import type { Person } from "../../types";

interface RecipientChipProps {
  person: Person;
  onRemove: () => void;
}

export const RecipientChip: React.FC<RecipientChipProps> = ({
  person,
  onRemove,
}) => {
  const isExternal = person.isExternal || (person.company && person.company !== "한울푸드");

  const bgColor = isExternal ? "bg-gray-100" : "bg-blue-50";
  const borderColor = isExternal ? "border-gray-300" : "border-blue-200";
  const textColor = isExternal ? "text-gray-700" : "text-blue-700";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${bgColor} ${borderColor} ${textColor} text-xs font-medium`}>
      <span>
        {person.name} {person.position}
        <span className="opacity-70 ml-1">
          ({isExternal ? (person.company || person.team) : person.team})
        </span>
      </span>
      <button
        onClick={onRemove}
        className="hover:text-red-500 transition-colors ml-0.5"
        aria-label="삭제"
      >
        ✕
      </button>
    </div>
  );
};
