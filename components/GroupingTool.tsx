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
  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState<Student[][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [draggedStudentId, setDraggedStudentId] = useState<number | null>(null); // Tracks the dragged student

  // Function to generate groups
  const generateGroups = () => {
    if (students.length === 0) {
      alert('No students available to group.');
      return;
    }

    // Separate students by capability level
    const highStudents = students.filter((s) => s.capabilityLevel === 'high');
    const mediumStudents = students.filter((s) => s.capabilityLevel === 'medium');
    const lowStudents = students.filter((s) => s.capabilityLevel === 'low');

    // Shuffle each capability group to ensure randomness
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
      if (numGroups < 1) {
        alert('Number of groups must be at least 1.');
        return;
      }
    } else {
      const studentsPerGroup = groupCount;
      if (studentsPerGroup < 1) {
        alert('Number of students per group must be at least 1.');
        return;
      }
      numGroups = Math.ceil(students.length / studentsPerGroup);
    }

    // Initialize empty groups
    const newGroups: Student[][] = Array.from({ length: numGroups }, () => []);

    // Distribute students into groups in a round-robin fashion
    combinedStudents.forEach((student, index) => {
      const groupIndex = index % numGroups;
      newGroups[groupIndex].push(student);
    });

    setGroups(newGroups);
    setShowModal(true); // Display the modal with groups
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

  return (
    <div className="grouping-tool">
      <h2>Grouping Tool</h2>
      <div className="grouping-options">
        <label>
          <input
            type="radio"
            value="byGroups"
            checked={groupingOption === 'byGroups'}
            onChange={() => setGroupingOption('byGroups')}
          />
          By Number of Groups
        </label>
        <label>
          <input
            type="radio"
            value="byStudents"
            checked={groupingOption === 'byStudents'}
            onChange={() => setGroupingOption('byStudents')}
          />
          By Students per Group
        </label>
      </div>
      <div className="group-count">
        <input
          type="number"
          min="1"
          max={students.length}
          value={groupingOption === 'byGroups' ? groupCount : Math.ceil(students.length / groupCount)}
          onChange={(e) =>
            setGroupCount(Math.max(1, Math.min(students.length, parseInt(e.target.value, 10) || 1)))
          }
          placeholder={
            groupingOption === 'byGroups'
              ? 'Number of Groups'
              : 'Number of Students per Group'
          }
        />
        <button onClick={generateGroups}>Generate Groups</button>
      </div>

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