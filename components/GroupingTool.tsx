// components/GroupingTool.tsx

import { useState, useEffect } from 'react';
import { Student, GroupingHistoryEntry } from '../types';
import Droppable from './Droppable';
import DraggableStudent from './DraggableStudent';
import EditableGroupName from './EditableGroupName'; // Ensure this is imported correctly

interface GroupingToolProps {
  students: Student[];
  currentClassId: number | null;
  onGroupingSaved: () => void; // Callback to refresh GroupHistory
}

export default function GroupingTool({
  students,
  currentClassId,
  onGroupingSaved,
}: GroupingToolProps) {
  const [groupingOption, setGroupingOption] = useState<'byGroups' | 'byStudents'>('byGroups');
  const [groupCountInput, setGroupCountInput] = useState<string>(''); // Controlled input value as string
  const [groupCount, setGroupCount] = useState<number>(2); // Parsed numerical value
  const [studentsPerGroup, setStudentsPerGroup] = useState<number>(4); // Parsed numerical value
  const [groups, setGroups] = useState<Student[][]>([]);
  const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({}); // State to track group names
  const [showModal, setShowModal] = useState(false);
  const [draggedStudentId, setDraggedStudentId] = useState<number | null>(null); // Tracks the dragged student
  const [inputError, setInputError] = useState<string>(''); // Error message for invalid input
  const [groupingId, setGroupingId] = useState<number | null>(null); // State for grouping ID

  // Function to generate groups
  const generateGroups = () => {
    console.log('GroupingTool: Generate Groups button clicked.');

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

    console.log('GroupingTool: High Students:', highStudents);
    console.log('GroupingTool: Medium Students:', mediumStudents);
    console.log('GroupingTool: Low Students:', lowStudents);

    // Shuffle each capability group to ensure randomness
    const shuffle = (array: Student[]) => array.sort(() => Math.random() - 0.5);
    shuffle(highStudents);
    shuffle(mediumStudents);
    shuffle(lowStudents);

    console.log('GroupingTool: Shuffled High Students:', highStudents);
    console.log('GroupingTool: Shuffled Medium Students:', mediumStudents);
    console.log('GroupingTool: Shuffled Low Students:', lowStudents);

    // Combine all students, interleaving capability levels for balance
    const combinedStudents: Student[] = [];
    const maxLength = Math.max(highStudents.length, mediumStudents.length, lowStudents.length);
    for (let i = 0; i < maxLength; i++) {
      if (highStudents[i]) combinedStudents.push(highStudents[i]);
      if (mediumStudents[i]) combinedStudents.push(mediumStudents[i]);
      if (lowStudents[i]) combinedStudents.push(lowStudents[i]);
    }

    console.log('GroupingTool: Combined Students:', combinedStudents);

    let numGroups: number;

    if (groupingOption === 'byGroups') {
      numGroups = groupCount;
    } else {
      numGroups = Math.ceil(students.length / studentsPerGroup);
    }

    console.log('GroupingTool: Number of Groups:', numGroups);

    // Initialize empty groups
    const newGroups: Student[][] = Array.from({ length: numGroups }, () => []);

    // Distribute students into groups in a round-robin fashion
    combinedStudents.forEach((student, index) => {
      const groupIndex = index % numGroups;
      newGroups[groupIndex].push(student);
    });

    console.log('GroupingTool: New Groups:', newGroups);

    // Initialize default group names
    const initialGroupNames: { [key: number]: string } = {};
    newGroups.forEach((_, index) => {
      initialGroupNames[index] = `Group ${index + 1}`;
    });

    const newGroupingId = Date.now();
    setGroupingId(newGroupingId);
    setGroups(newGroups);
    setGroupNames(initialGroupNames);
    setShowModal(true); // Display the modal with groups
    setInputError(''); // Reset any previous error messages
  };

  // Function to save grouping history to localStorage
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
      // Update existing entry
      groupHistory[existingIndex] = newEntry;
    } else {
      // Add new entry
      groupHistory.push(newEntry);
    }

    localStorage.setItem(groupHistoryKey, JSON.stringify(groupHistory));
    console.log(`GroupingTool: Saved grouping under key "${groupHistoryKey}"`);
    console.log('GroupingTool: Grouping Entry:', newEntry);
  };

  // Function to close the modal
  const closeModal = () => {
    if (groupingId !== null) {
      saveGroupingHistory();
      onGroupingSaved(); // Notify parent to refresh GroupHistory
    }
    setShowModal(false);
    setGroupingId(null);
    setDraggedStudentId(null);
  };

  // Effect to handle Escape key and body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
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

  // Function to handle drag start
  const handleDragStart = (studentId: number) => {
    setDraggedStudentId(studentId);
  };

  // Function to handle drag end (drop)
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

    // Clone the groups to avoid direct state mutation
    const newGroups = groups.map((group) => [...group]);

    // Remove the student from the source group
    const [movedStudent] = newGroups[sourceGroupIndex].splice(
      newGroups[sourceGroupIndex].findIndex((s) => s.id === draggedStudentId),
      1
    );

    // Add the student to the destination group
    newGroups[destinationGroupIndex].push(movedStudent);

    setGroups(newGroups);
    setDraggedStudentId(null); // Reset the dragged student ID
  };

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits
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
      setInputError(''); // Reset error message on valid input
    } else {
      setInputError('Please enter a valid number.');
    }
  };

  // Function to handle group name changes
  const handleGroupNameChange = (groupIndex: number, newName: string) => {
    setGroupNames((prevNames) => ({
      ...prevNames,
      [groupIndex]: newName,
    }));
    // Optionally, you can save immediately after name change
    // saveGroupingHistory();
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
              setGroupCount(2); // Reset to default
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
              setStudentsPerGroup(4); // Reset to default
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
      {/* Display error message if any */}
      {inputError && <p className="error-message">{inputError}</p>}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="Close Modal">
              &times;
            </button>
            <h2>Generated Groups</h2>
            <div className="groups-display">
              {groups.map((group, groupIndex) => (
                <Droppable
                  key={groupIndex}
                  id={`group-${groupIndex}`}
                  onDrop={(studentId) => handleDragEnd(studentId, `group-${groupIndex}`)}
                >
                  <div className="group-card">
                    {/* Editable Group Name */}
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inline Styles for GroupingTool (Alternatively, move to CSS module) */}
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
          border-color: #e74c3c; /* Red border for errors */
          box-shadow: 0 0 5px rgba(231, 76, 60, 0.5); /* Subtle red glow */
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
          background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent black */
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          cursor: pointer;
        }

        .modal-content {
          background-color: var(--bg-color);
          padding: 1rem; /* Increased padding for better content spacing */
          border-radius: 8px;
          max-width: 90vw; /* Use viewport width for better fit */
          max-height: 90vh; /* Use viewport height to prevent overflow */
          width: 800px; /* Keep a reasonable width */
          position: relative;
          color: var(--text-color);
          cursor: default;
          overflow-y: auto; /* Enable vertical scrolling if content overflows */
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
          gap: 0.75rem; /* Reduced gap */
          margin-top: 1rem;
          justify-content: center; /* Center the groups */
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modal-content {
            width: 95vw;
            padding: 0.75rem; /* Further reduced padding */
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