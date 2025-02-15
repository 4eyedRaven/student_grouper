// components/EditableClassName.tsx
"use client";

import { useState } from "react";

interface EditableClassNameProps {
  classId: number;
  name: string;
  onRename: (classId: number, newName: string) => void;
}

const EditableClassName: React.FC<EditableClassNameProps> = ({ classId, name, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  const handleBlur = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== name) {
      onRename(classId, trimmedName);
    } else {
      setTempName(name); // revert if empty or unchanged
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      setTempName(name);
      setIsEditing(false);
    }
  };

  return isEditing ? (
    <input
      type="text"
      value={tempName}
      onChange={(e) => setTempName(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      className="editable-class-name-input"
      aria-label="Edit class name"
    />
  ) : (
    <span
      onDoubleClick={() => setIsEditing(true)}
      className="editable-class-name"
      title="Double-click to edit"
    >
      {name}
    </span>
  );
};

export default EditableClassName;