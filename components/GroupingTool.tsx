// components/GroupingTool.tsx
"use client";

import { useState, useEffect } from 'react';
import { Student, GroupingHistoryEntry } from '../types';
import Droppable from './Droppable';
import DraggableStudent from './DraggableStudent';
import EditableGroupName from './EditableGroupName';
import ShufflingAnimation from './ShufflingAnimation'; // Import the new component
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion

interface GroupingToolProps {
  students: Student[];
  currentClassId: number | null;
  onGroupingSaved: () => void;
}

export default function GroupingTool({
  students,
  currentClassId,
  onGroupingSaved,
}: GroupingToolProps) {
  const [groupingOption, setGroupingOption] = useState<'byGroups' | 'byStudents'>('byGroups');
  const [groupCountInput, setGroupCountInput] = useState<string>('');
  const [groupCount, setGroupCount] = useState<number>(2);
  const [studentsPerGroup, setStudentsPerGroup] = useState<number>(4);
  const [groups, setGroups] = useState<Student[][]>([]);
  const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [draggedStudentId, setDraggedStudentId] = useState<number | null>(null);
  const [inputError, setInputError] = useState<string>('');
  const [groupingId, setGroupingId] = useState<number | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'shuffling' | 'completed'>('idle'); // New state

  const generateGroups = () => {
    if (students.length === 0) {
      alert('No students available to group.');
      return;
    }

    // Validate input based on grouping option
    if (groupingOption === 'byGroups') {
      if (!Number.isInteger(groupCount) || groupCount < 1) {
        setInputError('Please enter a valid number of groups (at least 1).');
        return;
      }
      if (groupCount > students.length) {
        setInputError('Number of groups cannot exceed the number of students.');
        return;
      }
    } else {
      if (!Number.isInteger(studentsPerGroup) || studentsPerGroup < 1) {
        setInputError('Please enter a valid number of students per group (at least 1).');
        return;
      }
      if (studentsPerGroup > students.length) {
        setInputError('Students per group cannot exceed the number of students.');
        return;
      }
    }

    // Separate students by capability level
    const highStudents = students.filter((s) => s.capabilityLevel === 'high');
    const mediumStudents = students.filter((s) => s.capabilityLevel === 'medium');
    const lowStudents = students.filter((s) => s.capabilityLevel === 'low');

    // Shuffle each capability group
    const shuffle = (array: Student[]) => array.sort(() => Math.random() - 0.5);
    shuffle(highStudents);
    shuffle(mediumStudents);
    shuffle(lowStudents);

    // Combine all students, interleaving capability levels for balance
    const combinedStudents: Student[] = [];
    const maxLength = Math.max(highStudents.length, mediumStudents.length, lowStudents.length);
    for (let i = 0; i < maxLength; i++) {
      if (highStudents[i]) combinedStudents.push(highStudents[i]);
      if (mediumStudents[i]) combinedStudents.push(mediumStudents[i]);
      if (lowStudents[i]) combinedStudents.push(lowStudents[i]);
    }

    let numGroups: number;

    if (groupingOption === 'byGroups') {
      numGroups = groupCount;
    } else {
      numGroups = Math.ceil(students.length / studentsPerGroup);
    }

    // Initialize empty groups
    const newGroups: Student[][] = Array.from({ length: numGroups }, () => []);

    // Distribute students into groups in a round-robin fashion
    combinedStudents.forEach((student, index) => {
      const groupIndex = index % numGroups;
      newGroups[groupIndex].push(student);
    });

    // Initialize default group names
    const initialGroupNames: { [key: number]: string } = {};
    newGroups.forEach((_, index) => {
      initialGroupNames[index] = `Group ${index + 1}`;
    });

    const newGroupingId = Date.now();
    setGroupingId(newGroupingId);
    setGroups(newGroups);
    setGroupNames(initialGroupNames);

    // Start the animation
    setAnimationPhase('shuffling');
    setShowModal(true); // Display the modal with animation
    setInputError('');
  };

  const saveGroupingHistory = () => {
    if (currentClassId === null || groupingId === null) {
      console.error('GroupingTool: currentClassId or groupingId is null. Cannot save grouping history.');
      return;
    }

    const groupHistoryKey = `groupHistory-${currentClassId}`;
    const groupHistoryJson = localStorage.getItem(groupHistoryKey);
    const groupHistory: GroupingHistoryEntry[] = groupHistoryJson ? JSON.parse(groupHistoryJson) : [];

    const updatedGroups = groups.map((group, index) => ({
      id: index,
      name: groupNames[index],
      students: group,
    }));

    const newEntry: GroupingHistoryEntry = {
      id: groupingId,
      timestamp: new Date().toISOString(),
      method: groupingOption,
      value: groupingOption === 'byGroups' ? groupCount : studentsPerGroup,
      numberOfStudents: students.length,
      groups: updatedGroups,
    };

    const existingIndex = groupHistory.findIndex((entry) => entry.id === groupingId);
    if (existingIndex !== -1) {
      groupHistory[existingIndex] = newEntry;
    } else {
      groupHistory.push(newEntry);
    }

    localStorage.setItem(groupHistoryKey, JSON.stringify(groupHistory));
    console.log(`GroupingTool: Saved grouping under key "${groupHistoryKey}"`);
    console.log('GroupingTool: Grouping Entry:', newEntry);
  };

  const closeModal = () => {
    if (groupingId !== null) {
      saveGroupingHistory();
      onGroupingSaved();
    }
    setShowModal(false);
    setGroupingId(null);
    setDraggedStudentId(null);
    setAnimationPhase('idle'); // Reset animation phase
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setAnimationPhase('idle');
      }
    };

    if (showModal) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  const handleDragStart = (studentId: number) => {
    setDraggedStudentId(studentId);
  };

  const handleDragEnd = (studentId: number, destinationGroupId: string) => {
    if (draggedStudentId === null) return;

    // Find source group
    const sourceGroupIndex = groups.findIndex((group) =>
      group.some((s) => s.id === draggedStudentId)
    );
    const destinationGroupIndex = parseInt(destinationGroupId.split('-')[1], 10);

    if (
      sourceGroupIndex === -1 ||
      destinationGroupIndex === -1 ||
      sourceGroupIndex === destinationGroupIndex
    ) {
      setDraggedStudentId(null);
      return;
    }

    // Clone the groups
    const newGroups = groups.map((group) => [...group]);

    // Remove the student from the source group
    const [movedStudent] = newGroups[sourceGroupIndex].splice(
      newGroups[sourceGroupIndex].findIndex((s) => s.id === draggedStudentId),
      1
    );

    // Add the student to the destination group
    newGroups[destinationGroupIndex].push(movedStudent);

    setGroups(newGroups);
    setDraggedStudentId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      if (groupingOption === 'byGroups') {
        setGroupCountInput(value);
        if (value === '') {
          setGroupCount(0);
        } else {
          setGroupCount(parseInt(value, 10));
        }
      } else {
        setGroupCountInput(value);
        if (value === '') {
          setStudentsPerGroup(0);
        } else {
          setStudentsPerGroup(parseInt(value, 10));
        }
      }
      setInputError('');
    } else {
      setInputError('Please enter a valid number.');
    }
  };

  const handleGroupNameChange = (groupIndex: number, newName: string) => {
    setGroupNames((prevNames) => ({
      ...prevNames,
      [groupIndex]: newName,
    }));
  };

  return (
    <div className="grouping-tool">
      <h2>Grouping Tool</h2>
      <div className="grouping-options">
        <label>
          <input
            type="radio"
            value="byGroups"
            checked={groupingOption === 'byGroups'}
            onChange={() => {
              setGroupingOption('byGroups');
              setGroupCountInput('');
              setGroupCount(2);
              setInputError('');
            }}
          />
          By Number of Groups
        </label>
        <label>
          <input
            type="radio"
            value="byStudents"
            checked={groupingOption === 'byStudents'}
            onChange={() => {
              setGroupingOption('byStudents');
              setGroupCountInput('');
              setStudentsPerGroup(4);
              setInputError('');
            }}
          />
          By Students per Group
        </label>
      </div>

      <div className="group-count">
        <input
          type="text"
          value={groupCountInput}
          onChange={handleInputChange}
          placeholder={
            groupingOption === 'byGroups'
              ? 'Number of Groups'
              : 'Number of Students per Group'
          }
          aria-label={
            groupingOption === 'byGroups'
              ? 'Number of Groups'
              : 'Number of Students per Group'
          }
          className={inputError ? 'input-error' : ''}
        />
        <button onClick={generateGroups} aria-label="Generate Groups">
          Generate Groups
        </button>
      </div>
      {inputError && <p className="error-message">{inputError}</p>}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="Close Modal">
              &times;
            </button>
            <h2>{animationPhase === 'completed' ? 'Generated Groups' : 'Generating Groups...'}</h2>
            <div className="groups-display">
              {animationPhase === 'completed' ? (
                // Display final groups
                groups.map((group, groupIndex) => (
                  <Droppable
                    key={groupIndex}
                    id={`group-${groupIndex}`}
                    onDrop={(studentId) => handleDragEnd(studentId, `group-${groupIndex}`)}
                  >
                    <div className="group-card">
                      <EditableGroupName
                        groupIndex={groupIndex}
                        groupName={groupNames[groupIndex]}
                        onGroupNameChange={handleGroupNameChange}
                      />
                      <ul>
                        {group.map((student) => (
                          <DraggableStudent
                            key={student.id}
                            student={student}
                            onDragStart={() => handleDragStart(student.id)}
                            isDragging={draggedStudentId === student.id}
                          />
                        ))}
                      </ul>
                    </div>
                  </Droppable>
                ))
              ) : (
                // Display shuffling animation
                <ShufflingAnimation
                  students={students}
                  onAnimationComplete={() => setAnimationPhase('completed')}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Styles */}
      <style jsx>{`
        .grouping-tool {
          margin-bottom: 2rem;
        }

        .grouping-tool h2 {
          margin-bottom: 1rem;
        }

        .grouping-options {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .grouping-options label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .grouping-options input[type='radio'] {
          cursor: pointer;
        }

        .group-count {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1rem;
        }

        .group-count input[type='text'] {
          width: 200px;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 1rem;
          background-color: var(--border-color);
          color: var(--text-color);
        }

        .group-count input[type='text'].input-error {
          border-color: #e74c3c;
          box-shadow: 0 0 5px rgba(231, 76, 60, 0.5);
        }

        .group-count input[type='text']::placeholder {
          color: #cccccc;
        }

        .error-message {
          color: #e74c3c;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .grouping-tool button {
          padding: 0.5rem 1rem;
        }

        /* Modal Styles */
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
          padding: 1rem;
          border-radius: 8px;
          max-width: 90vw;
          max-height: 90vh;
          width: 800px;
          position: relative;
          color: var(--text-color);
          cursor: default;
          overflow-y: auto;
        }

        .modal-close-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background-color: transparent;
          color: var(--text-color);
          border: none;
          font-size: 2rem;
          cursor: pointer;
        }

        .modal-close-btn:hover {
          color: var(--accent-color);
        }

        .modal-content h2 {
          margin-top: 0;
          color: var(--primary-color);
        }

        .groups-display {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1rem;
          justify-content: center;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modal-content {
            width: 95vw;
            padding: 0.75rem;
          }

          .groups-display {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.75rem;
            margin-top: 1rem;
            justify-items: center;
          }

          .group-count input[type='text'] {
            width: 100%;
          }

          .grouping-options {
            flex-direction: column;
            align-items: flex-start;
          }

          .grouping-tool button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}