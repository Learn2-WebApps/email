import React, { useState } from "react";
import type { Person, ComposeFormData } from "../../types";
import { AddressInput } from "../AddressInput";
import { AttachmentChip } from "../ui/AttachmentChip";
import { Button } from "../ui/Button";

interface ComposeFormProps {
  data: ComposeFormData;
  addressBook: Person[];
  onChange: (newData: ComposeFormData) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export const ComposeForm: React.FC<ComposeFormProps> = ({
  data,
  addressBook,
  onChange,
  onSubmit,
  onReset,
}) => {
  const [showBcc, setShowBcc] = useState(false);

  const handleChange = (field: keyof ComposeFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddPerson = (field: "to" | "cc" | "bcc", person: Person) => {
    if (!data[field].find(p => p.id === person.id)) {
      handleChange(field, [...data[field], person]);
    }
  };

  const handleRemovePerson = (field: "to" | "cc" | "bcc", id: string) => {
    handleChange(field, data[field].filter(p => p.id !== id));
  };

  const handleRenameAttachment = (index: number, newName: string) => {
    const newAttachments = [...data.attachments];
    newAttachments[index] = { ...newAttachments[index], currentName: newName };
    handleChange("attachments", newAttachments);
  };

  const handleRemoveAttachment = (index: number) => {
    handleChange("attachments", data.attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-white border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="bg-primary text-white px-4 py-2 flex justify-between items-center shrink-0">
        <span className="font-bold text-sm">새 메시지 작성</span>
        <button onClick={onReset} className="text-[10px] hover:underline">모두 지우기</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AddressInput
          label="받는사람"
          selectedPeople={data.to}
          addressBook={addressBook}
          onAdd={(p) => handleAddPerson("to", p)}
          onRemove={(id) => handleRemovePerson("to", id)}
        />
        <AddressInput
          label="참조"
          selectedPeople={data.cc}
          addressBook={addressBook}
          onAdd={(p) => handleAddPerson("cc", p)}
          onRemove={(id) => handleRemovePerson("cc", id)}
        />
        
        {showBcc ? (
          <AddressInput
            label="숨은참조"
            selectedPeople={data.bcc}
            addressBook={addressBook}
            onAdd={(p) => handleAddPerson("bcc", p)}
            onRemove={(id) => handleRemovePerson("bcc", id)}
          />
        ) : (
          <div className="px-1 border-b border-border py-1">
            <button 
              onClick={() => setShowBcc(true)}
              className="text-xs text-textSecondary hover:text-primary ml-16"
            >
              + 숨은참조 추가
            </button>
          </div>
        )}

        <div className="px-4 py-2 border-b border-border">
          <input
            className="w-full outline-none text-sm font-bold placeholder:font-normal"
            placeholder="제목을 입력하세요"
            value={data.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
          />
        </div>

        {/* 첨부파일 영역 */}
        <div className="px-4 py-3 bg-gray-50 border-b border-border min-h-[50px]">
          <div className="flex flex-wrap gap-2">
            {data.attachments.length > 0 ? (
              data.attachments.map((file, idx) => (
                <AttachmentChip
                  key={idx}
                  fileName={file.currentName}
                  originalFileName={file.originalName}
                  onRename={(newName) => handleRenameAttachment(idx, newName)}
                  onRemove={() => handleRemoveAttachment(idx)}
                />
              ))
            ) : (
              <span className="text-xs text-textSecondary italic">자료함에서 필요한 파일을 첨부하세요.</span>
            )}
          </div>
        </div>

        {/* 본문 영역 */}
        <textarea
          className="w-full p-4 outline-none text-sm min-h-[300px] resize-none leading-relaxed"
          placeholder="내용을 입력하세요..."
          value={data.body}
          onChange={(e) => handleChange("body", e.target.value)}
        />
      </div>

      <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-3 shrink-0">
        <Button variant="secondary" onClick={onReset}>초기화</Button>
        <Button onClick={onSubmit} className="px-8">제출하기</Button>
      </div>
    </div>
  );
};
