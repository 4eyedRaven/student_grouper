// components/GroupingTool.tsx
import { useState, useEffect } from 'react';
import { Student } from '../types';
import Droppable from './Droppable';
import DraggableStudent from './DraggableStudent';

interface GroupingToolProps {
  students: Student[];
}

export default function GroupingTool({ students }: GroupingToolProps) {
  const [groupingOption, setGroupingOption] = useState<'byGroups' | 'byStudents'>('byGroups');
  const [groupCountInput, setGroupCountInput] = useState<string>(''); // Controlled input value as string
  const [groupCount, setGroupCount] = useState<number>(2); // Parsed numerical value
  const [groups, setGroups] = useState<Student[][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [draggedStudentId, setDraggedStudentId] = useState<number | null>(null); // Tracks the dragged student
  const [inputError, setInputError] = useState<string>(''); // Error message for invalid input

  // Function to generate groups
  const generateGroups = () => {
    console.log('Generate Groups button clicked.');

    if (students.length === 0) {
      alert('No students available to group.');
      return;
    }

    // Validate groupCount
    if (!Number.isInteger(groupCount) || groupCount < 1) {
      setInputError('Please enter a valid number of groups.');
      return;
    }

    // Separate students by capability level
    const highStudents = students.filter((s) => s.capabilityLevel === 'high');
    const mediumStudents = students.filter((s) => s.capabilityLevel === 'medium');
    const lowStudents = students.filter((s) => s.capabilityLevel === 'low');

    console.log('High Students:', highStudents);
    console.log('Medium Students:', mediumStudents);
    console.log('Low Students:', lowStudents);

    // Shuffle each capability group to ensure randomness
    const shuffle = (array: Student[]) => array.sort(() => Math.random() - 0.5);
    shuffle(highStudents);
    shuffle(mediumStudents);
    shuffle(lowStudents);

    console.log('Shuffled High Students:', highStudents);
    console.log('Shuffled Medium Students:', mediumStudents);
    console.log('Shuffled Low Students:', lowStudents);

    // Combine all students, interleaving capability levels for balance
    const combinedStudents: Student[] = [];
    const maxLength = Math.max(highStudents.length, mediumStudents.length, lowStudents.length);
    for (let i = 0; i < maxLength; i++) {
      if (highStudents[i]) combinedStudents.push(highStudents[i]);
      if (mediumStudents[i]) combinedStudents.push(mediumStudents[i]);
      if (lowStudents[i]) combinedStudents.push(lowStudents[i]);
    }

    console.log('Combined Students:', combinedStudents);

    let numGroups: number;

    if (groupingOption === 'byGroups') {
      numGroups = groupCount;
      if (numGroups < 1) {
        setInputError('Number of groups must be at least 1.');
        return;
      }
    } else {
      const studentsPerGroup = groupCount;
      if (studentsPerGroup < 1) {
        setInputError('Number of students per group must be at least 1.');
        return;
      }
      numGroups = Math.ceil(students.length / studentsPerGroup);
    }

    console.log('Number of Groups:', numGroups);

    // Initialize empty groups
    const newGroups: Student[][] = Array.from({ length: numGroups }, () => []);

    // Distribute students into groups in a round-robin fashion
    combinedStudents.forEach((student, index) => {
      const groupIndex = index % numGroups;
      newGroups[groupIndex].push(student);
    });

    console.log('New Groups:', newGroups);

    setGroups(newGroups);
    setShowModal(true); // Display the modal with groups
    setInputError(''); // Reset any previous error messages
  };

  const closeModal = () => {
    setShowModal(false);
  };

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

  const handleDragStart = (student: Student) => {
    setDraggedStudentId(student.id); // Set the dragged student's ID
  };

  const handleDragEnd = (studentId: number, destinationGroupId: string) => {
    if (draggedStudentId === null) return;

    // Prevent moving to the same group
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
      setGroupCountInput(value);
      if (value === '') {
        setGroupCount(0);
      } else {
        setGroupCount(parseInt(value, 10));
      }
      setInputError(''); // Reset error message on valid input
    } else {
      setInputError('Please enter a valid number.');
    }
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
              setGroupCount(Math.ceil(students.length / 2)); // Example default
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
        <button onClick={generateGroups}>Generate Groups</button>
      </div>
      {/* Display error message if any */}
      {inputError && <p className="error-message">{inputError}</p>}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
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
                    <h3>Group {groupIndex + 1}</h3>
                    <ul>
                      {group.map((student) => (
                        <DraggableStudent
                          key={student.id}
                          student={student}
                          onDragStart={() => handleDragStart(student)}
                          isDragging={draggedStudentId === student.id} // Pass isDragging prop
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
    </div>
  );
}