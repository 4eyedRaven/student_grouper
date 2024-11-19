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
  const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<number | null>(null);

  const handleAddClass = () => {
    if (newClassName.trim()) {
      onAddClass(newClassName.trim());
      setNewClassName('');
    }
  };

  // Handle Enter key for adding class
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
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') onSelectClass(c.id);
            }}
            aria-pressed={currentClassId === c.id}
          >
            {c.name}
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteClassId(c.id);
              }}
              aria-label={`Remove class ${c.name}`}
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
          onKeyDown={handleKeyDown}
          placeholder="New class name"
          aria-label="New class name"
        />
        <button onClick={handleAddClass} aria-label="Add Class">
          +
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteClassId !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteClassId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete the class "
              {classes.find((c) => c.id === confirmDeleteClassId)?.name}"? This action cannot be
              undone.
            </p>
            <div className="modal-buttons">
              <button
                className="delete-btn"
                onClick={() => {
                  onRemoveClass(confirmDeleteClassId);
                  setConfirmDeleteClassId(null);
                }}
              >
                Delete
              </button>
              <button onClick={() => setConfirmDeleteClassId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Styles for the modal */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          cursor: pointer;
        }

        .modal-content {
          background-color: var(--bg-color);
          padding: 1.5rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          position: relative;
          color: var(--text-color);
          cursor: default;
        }

        .modal-content h3 {
          margin-top: 0;
          color: var(--primary-color);
        }

        .modal-content p {
          margin-bottom: 1.5rem;
        }

        .modal-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .modal-buttons button {
          padding: 0.5rem 1rem;
        }

        .modal-buttons .delete-btn {
          background-color: #e74c3c;
        }

        .modal-buttons .delete-btn:hover {
          background-color: #c0392b;
        }
      `}</style>
    </div>
  );
}