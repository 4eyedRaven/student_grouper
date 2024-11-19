// components/DraggableStudent.tsx
import React from 'react';

interface DraggableStudentProps {
  student: {
    id: number;
    name: string;
    capabilityLevel: 'high' | 'medium' | 'low';
    present: boolean;
  };
  onDragStart: () => void;
  isDragging: boolean;
}

const DraggableStudent: React.FC<DraggableStudentProps> = ({
  student,
  onDragStart,
  isDragging,
}) => {
  return (
    <li
      className={`draggable-student ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => {
        onDragStart();
        e.dataTransfer.setData('text/plain', student.id.toString());
        e.dataTransfer.effectAllowed = 'move';
      }}
      aria-label={`Student ${student.name}`}
      data-id={student.id} /* Added for potential future use */
    >
      {student.name}
    </li>
  );
};

export default DraggableStudent;