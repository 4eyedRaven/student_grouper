// components/DraggableStudent.tsx
import { Student } from '../types';

interface DraggableStudentProps {
  student: Student;
  onDragStart: () => void;
  isDragging: boolean;
}

export default function DraggableStudent({ student, onDragStart, isDragging }: DraggableStudentProps) {
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>) => {
    onDragStart();
    e.dataTransfer.setData('text/plain', student.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <li
      draggable
      onDragStart={handleDragStart}
      className={`draggable-student ${isDragging ? 'dragging' : ''}`}
    >
      {student.name}
    </li>
  );
}