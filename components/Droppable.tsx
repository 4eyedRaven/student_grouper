// components/Droppable.tsx
import { useState } from 'react';
import { Student } from '../types';

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  onDrop: (studentId: number) => void;
}

export default function Droppable({ id, children, onDrop }: DroppableProps) {
  const [isOver, setIsOver] = useState(false); // State to track drag-over

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Visual feedback is handled via state
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // To prevent flickering when dragging over child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const studentId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(studentId)) {
      onDrop(studentId);
    }
  };

  return (
    <div
      className={`group-card ${isOver ? 'group-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}