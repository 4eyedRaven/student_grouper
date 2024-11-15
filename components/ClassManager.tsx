// components/ClassManager.tsx
import { useState } from 'react';
import { Class } from '../types';

interface ClassManagerProps {
  classes: Class[];
  currentClassId: number | null;
  onAddClass: (className: string) => void;
  onRemoveClass: (classId: number) => void;
  onSelectClass: (selectedClassId: number) => void;
}

export default function ClassManager({
  classes,
  currentClassId,
  onAddClass,
  onRemoveClass,
  onSelectClass,
}: ClassManagerProps) {
  const [newClassName, setNewClassName] = useState('');

  const handleAddClass = () => {
    if (newClassName.trim()) {
      onAddClass(newClassName.trim());
      setNewClassName('');
    }
  };

  // **Add this function to handle the Enter key**
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClass();
    }
  };

  return (
    <div className="class-manager">
      <h2>Classes</h2>
      <div className="class-list">
        {classes.map((c) => (
          <div
            key={c.id}
            className={`class-item ${currentClassId === c.id ? 'active' : ''}`}
            onClick={() => onSelectClass(c.id)}
          >
            {c.name}
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveClass(c.id);
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="add-class">
        <input
          type="text"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          onKeyDown={handleKeyDown} // **Add this line**
          placeholder="New class name"
        />
        <button onClick={handleAddClass}>+</button>
      </div>
    </div>
  );
}