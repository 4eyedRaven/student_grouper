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
  const [studentsPerGroup, setStudentsPerGroup] = useState<number>(4); // Parsed numerical value
  const [groups, setGroups] = useState<Student[][]>([]);
  const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({}); // State to track group names
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
    } else {
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

    // Initialize default group names
    const initialGroupNames: { [key: number]: string } = {};
    newGroups.forEach((_, index) => {
      initialGroupNames[index] = `Group ${index + 1}`;
    });

    setGroups(newGroups);
    setGroupNames(initialGroupNames);
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
                          onDragStart={() => handleDragStart(student)}
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
    </div>
  );
}

// Component for Editable Group Name
interface EditableGroupNameProps {
  groupIndex: number;
  groupName: string;
  onGroupNameChange: (groupIndex: number, newName: string) => void;
}

function EditableGroupName({ groupIndex, groupName, onGroupNameChange }: EditableGroupNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(groupName);

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (tempName.trim() === '') {
      setTempName(groupName); // Revert to original name if empty
    } else {
      onGroupNameChange(groupIndex, tempName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setTempName(groupName); // Revert to original name
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
      className="group-name-input"
      aria-label={`Edit name for Group ${groupIndex + 1}`}
    />
  ) : (
    <h3 className="group-name" onClick={handleNameClick} role="button" tabIndex={0}>
      {groupName}
    </h3>
  );
}