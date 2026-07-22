import React, { useState, useRef, useEffect } from "react";
import type { Person } from "../types";
import { RecipientChip } from "./ui/RecipientChip";

interface AddressInputProps {
  label: string;
  selectedPeople: Person[];
  onAdd: (person: Person) => void;
  onRemove: (id: string) => void;
  addressBook: Person[];
}

export const AddressInput: React.FC<AddressInputProps> = ({
  label,
  selectedPeople,
  onAdd,
  onRemove,
  addressBook,
}) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 검색어에 따른 후보 필터링 (이미 선택된 사람 제외)
  const suggestions = query.trim() 
    ? addressBook
        .filter(p => !selectedPeople.find(s => s.id === p.id))
        .filter(p => 
          p.name.includes(query) || 
          p.position.includes(query) || 
          p.team.includes(query) || 
          (p.company && p.company.includes(query))
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      onAdd(suggestions[0]);
      setQuery("");
      setShowDropdown(false);
    }
  };

  return (
    <div className="flex flex-col border-b border-border py-2 px-3 relative" ref={containerRef}>
      <div className="flex items-start gap-2">
        <label className="text-sm text-textSecondary w-16 pt-1 shrink-0">{label}</label>
        <div className="flex flex-wrap gap-1.5 flex-1 min-h-[32px]">
          {selectedPeople.map(p => (
            <RecipientChip key={p.id} person={p} onRemove={() => onRemove(p.id)} />
          ))}
          <input
            className="flex-1 outline-none text-sm min-w-[120px] bg-transparent"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute left-16 right-0 top-full mt-1 bg-white border border-border shadow-lg rounded-md z-20 overflow-hidden">
          {suggestions.map(p => (
            <li
              key={p.id}
              className="px-3 py-2 text-sm hover:bg-surface cursor-pointer flex justify-between items-center"
              onClick={() => {
                onAdd(p);
                setQuery("");
                setShowDropdown(false);
              }}
            >
              <div>
                <span className="font-bold">{p.name}</span> {p.position}
                <span className="text-textSecondary ml-2 text-xs">
                  {p.isExternal ? (p.company || p.team) : p.team}
                </span>
              </div>
              {p.isExternal && (
                <span className="text-[10px] bg-gray-100 px-1 rounded border border-gray-200">외부</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
