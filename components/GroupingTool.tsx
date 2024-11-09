// components/GroupingTool.tsx
import { useState, useEffect } from 'react';
import { Student } from '../types';

interface GroupingToolProps {
  students: Student[];
}

export default function GroupingTool({ students }: GroupingToolProps) {
  const [groupingOption, setGroupingOption] = useState<'byGroups' | 'byStudents'>('byGroups');
  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState<Student[][]>([]);
  const [showModal, setShowModal] = useState(false);

  const generateGroups = () => {
    const totalStudents = students.length;

    // Separate and shuffle students by capability level
    const shuffle = (array: Student[]) => array.sort(() => Math.random() - 0.5);
    let highStudents = shuffle(students.filter((s) => s.capabilityLevel === 'high'));
    let mediumStudents = shuffle(students.filter((s) => s.capabilityLevel === 'medium'));
    let lowStudents = shuffle(students.filter((s) => s.capabilityLevel === 'low'));

    // Determine number of groups
    let numGroups: number;

    if (groupingOption === 'byGroups') {
      numGroups = groupCount;
    } else {
      numGroups = Math.ceil(totalStudents / groupCount);
    }

    // Initialize groups
    const newGroups: Student[][] = Array.from({ length: numGroups }, () => []);

    // Interleave students from different capabilities
    const combinedStudents: Student[] = [];
    while (highStudents.length || mediumStudents.length || lowStudents.length) {
      if (highStudents.length) combinedStudents.push(highStudents.shift()!);
      if (mediumStudents.length) combinedStudents.push(mediumStudents.shift()!);
      if (lowStudents.length) combinedStudents.push(lowStudents.shift()!);
    }

    // Distribute students to groups in a round-robin fashion
    combinedStudents.forEach((student, index) => {
      newGroups[index % numGroups].push(student);
    });

    setGroups(newGroups);
    setShowModal(true); // Show the modal with the generated groups
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
          value={groupCount}
          onChange={(e) =>
            setGroupCount(Math.max(1, Math.min(students.length, parseInt(e.target.value) || 1)))
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
              {groups.map((group, index) => (
                <div key={index} className="group-card">
                  <h3>Group {index + 1}</h3>
                  <ul>
                    {group.map((student) => (
                      <li key={student.id}>{student.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}