// components/GroupHistory.tsx
"use client";

import React, { useState, useEffect } from 'react';
import EditableGroupName from './EditableGroupName';
import Droppable from './Droppable';
import DraggableStudent from './DraggableStudent';
import { GroupingHistoryEntry, Student } from '../types';

interface GroupHistoryProps {
  currentClassId: number | null;
  className: string;
  refreshKey: number;
}

const GroupHistory: React.FC<GroupHistoryProps> = ({ currentClassId, className, refreshKey }) => {
  const [groupHistory, setGroupHistory] = useState<GroupingHistoryEntry[]>([]);
  const [selectedGrouping, setSelectedGrouping] = useState<GroupingHistoryEntry | null>(null);
  const [groups, setGroups] = useState<Student[][]>([]);
  const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({});
  const [draggedStudentId, setDraggedStudentId] = useState<number | null>(null);
  const [groupingId, setGroupingId] = useState<number | null>(null); // To identify the current grouping

  // Function to load group history from localStorage
  const loadGroupHistory = () => {
    if (currentClassId === null) {
      setGroupHistory([]);
      return;
    }

    const groupHistoryKey = `groupHistory-${currentClassId}`;
    const savedGroupHistory = localStorage.getItem(groupHistoryKey);

    if (savedGroupHistory) {
      try {
        const parsedHistory: GroupingHistoryEntry[] = JSON.parse(savedGroupHistory);
        // Sort by timestamp descending (newest first)
        const sortedHistory = parsedHistory.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setGroupHistory(sortedHistory);
      } catch (error) {
        console.error('GroupHistory: Error parsing JSON data:', error);
        setGroupHistory([]);
      }
    } else {
      setGroupHistory([]);
    }
  };

  // Load group history on component mount and when dependencies change
  useEffect(() => {
    loadGroupHistory();
  }, [currentClassId, refreshKey]);

  // Function to load a grouping from history
  const loadGrouping = (grouping: GroupingHistoryEntry) => {
    setSelectedGrouping(grouping);
    // Initialize groups and groupNames based on the loaded grouping
    const loadedGroups = grouping.groups.map(group => [...group.students]); // Deep copy to prevent mutations
    setGroups(loadedGroups);

    const loadedGroupNames = grouping.groups.reduce((acc, group, index) => {
      acc[index] = group.name;
      return acc;
    }, {} as { [key: number]: string });
    setGroupNames(loadedGroupNames);

    setGroupingId(grouping.id); // Set current grouping ID for updating history

    // Reset any drag state
    setDraggedStudentId(null);
  };

  // Function to handle drag start
  const handleDragStart = (studentId: number) => {
    setDraggedStudentId(studentId);
  };

  // Function to handle drag end (drop)
  const handleDragEnd = (studentId: number, destinationGroupId: string) => {
    if (draggedStudentId === null || !selectedGrouping) return;

    const destinationGroupIndex = parseInt(destinationGroupId.split('-')[1], 10);

    // Validate destinationGroupIndex
    if (
      isNaN(destinationGroupIndex) ||
      destinationGroupIndex < 0 ||
      destinationGroupIndex >= groups.length
    ) {
      console.error('GroupHistory: Invalid destination group index:', destinationGroupIndex);
      alert('Cannot drop the student here. Please choose a valid group.');
      return;
    }

    // Clone the groups to avoid direct state mutation
    const newGroups = groups.map(group => [...group]);

    // Find source group
    let sourceGroupIndex = -1;
    let movedStudent: Student | null = null;
    for (let i = 0; i < newGroups.length; i++) {
      const studentIndex = newGroups[i].findIndex(s => s.id === draggedStudentId);
      if (studentIndex !== -1) {
        sourceGroupIndex = i;
        movedStudent = newGroups[i].splice(studentIndex, 1)[0];
        break;
      }
    }

    if (sourceGroupIndex === -1 || movedStudent === null) {
      console.error('GroupHistory: Source group not found for student ID:', draggedStudentId);
      alert('Source group not found.');
      return;
    }

    // Prevent dropping into the same group
    if (sourceGroupIndex === destinationGroupIndex) {
      console.log('GroupHistory: Dropped into the same group.');
      setDraggedStudentId(null);
      return;
    }

    // Check if the destination group exists
    if (!newGroups[destinationGroupIndex]) {
      console.error('GroupHistory: Destination group does not exist.');
      alert('Destination group does not exist.');
      return;
    }

    // Add the student to the destination group
    newGroups[destinationGroupIndex].push(movedStudent);

    // Update state
    setGroups(newGroups);

    // Update selectedGrouping.groups
    if (selectedGrouping) {
      const updatedGroups = newGroups.map((group, index) => ({
        ...selectedGrouping.groups[index],
        students: group,
      }));
      setSelectedGrouping({
        ...selectedGrouping,
        groups: updatedGroups,
      });
    }

    setDraggedStudentId(null);

    console.log('GroupHistory: Groups after drag-and-drop:', newGroups);
    console.log('GroupHistory: SelectedGrouping after drag-and-drop:', selectedGrouping);
  };

  // Function to save grouping history to localStorage
  const saveGroupingHistory = () => {
    if (currentClassId === null || groupingId === null) {
      console.error('GroupHistory: currentClassId or groupingId is null. Cannot save grouping history.');
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

    const existingGrouping = groupHistory.find(entry => entry.id === groupingId);

    if (!existingGrouping) {
      console.error('GroupHistory: Grouping to update not found in history.');
      return;
    }

    const newEntry: GroupingHistoryEntry = {
      ...existingGrouping,
      timestamp: new Date().toISOString(), // Update timestamp to reflect modification
      groups: updatedGroups,
      numberOfStudents: groups.reduce((acc, group) => acc + group.length, 0),
    };

    // Replace the existing entry
    const updatedGroupHistory = groupHistory.map(entry =>
      entry.id === groupingId ? newEntry : entry
    );

    localStorage.setItem(groupHistoryKey, JSON.stringify(updatedGroupHistory));
    console.log(`GroupHistory: Saved grouping under key "${groupHistoryKey}"`);
    console.log('GroupHistory: Grouping Entry:', newEntry);

    // Reload groupHistory to reflect changes
    loadGroupHistory();
  };

  // Function to handle deletion of a grouping
  const handleDeleteGrouping = (groupingIdToDelete: number) => {
    // Removed the confirmation prompt as per user request
    // Proceed to delete the grouping immediately

    if (currentClassId === null) {
      console.error('GroupHistory: currentClassId is null. Cannot delete grouping.');
      return;
    }

    const groupHistoryKey = `groupHistory-${currentClassId}`;
    const savedGroupHistory = localStorage.getItem(groupHistoryKey);

    if (!savedGroupHistory) {
      console.error('GroupHistory: No group history found in localStorage.');
      return;
    }

    try {
      const parsedHistory: GroupingHistoryEntry[] = JSON.parse(savedGroupHistory);
      const updatedHistory = parsedHistory.filter(entry => entry.id !== groupingIdToDelete);

      localStorage.setItem(groupHistoryKey, JSON.stringify(updatedHistory));
      console.log(`GroupHistory: Deleted grouping with ID ${groupingIdToDelete} from localStorage.`);

      // Update the groupHistory state
      setGroupHistory(updatedHistory);

      // If the deleted grouping is currently loaded, close the modal
      if (selectedGrouping && selectedGrouping.id === groupingIdToDelete) {
        setSelectedGrouping(null);
        setGroups([]);
        setGroupNames({});
        setGroupingId(null);
        setDraggedStudentId(null);
      }
    } catch (error) {
      console.error('GroupHistory: Error parsing JSON data during deletion:', error);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    if (groupingId !== null) {
      saveGroupingHistory();
      // Optionally, notify parent component to refresh history
      // If you have an onGroupingSaved callback prop, call it here
    }
    setSelectedGrouping(null);
    setGroupingId(null);
    setDraggedStudentId(null);
  };

  // Effect to handle Escape key and body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (selectedGrouping) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedGrouping]);

  // Function to handle group name changes
  const handleGroupNameChange = (groupIndex: number, newName: string) => {
    setGroupNames(prev => ({ ...prev, [groupIndex]: newName }));
    // Update selectedGrouping.groups
    if (selectedGrouping) {
      const updatedGroups = selectedGrouping.groups.map((grp, idx) => {
        if (idx === groupIndex) {
          return { ...grp, name: newName };
        }
        return grp;
      });
      setSelectedGrouping({ ...selectedGrouping, groups: updatedGroups });
    }

    console.log('GroupHistory: Group name changed:', groupIndex, newName);
    console.log('GroupHistory: SelectedGrouping after renaming:', selectedGrouping);
  };

  return (
    <div className="group-history">
      <h2>Previous Groupings</h2>
      {groupHistory.length === 0 ? (
        <p>No previous groupings available.</p>
      ) : (
        <ul>
          {groupHistory.map(grouping => (
            <li
              key={grouping.id}
              onClick={() => loadGrouping(grouping)}
              style={{
                cursor: 'pointer',
                marginBottom: '0.5rem',
                padding: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>{new Date(grouping.timestamp).toLocaleString()}</strong> -{' '}
                {grouping.method === 'byGroups'
                  ? `${grouping.value} Groups`
                  : `${grouping.value} Students per Group`}
              </div>
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering loadGrouping
                  handleDeleteGrouping(grouping.id);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#e74c3c', // Red color for delete action
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
                aria-label={`Delete grouping created on ${new Date(grouping.timestamp).toLocaleString()}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedGrouping && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="Close Modal">
              &times;
            </button>
            <h2>Loaded Grouping</h2>
            <div className="groups-display">
              {groups.map((group, groupIndex) => (
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
                      {group.map(student => (
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

      {/* Inline Styles for GroupHistory (As per user request) */}
      <style jsx>{`
        .group-history {
          /* Styles as needed */
        }

        .group-history h2 {
          /* Styles as needed */
        }

        .group-history ul {
          list-style: none;
          padding: 0;
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

        .group-card {
          background-color: var(--border-color);
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          min-width: 120px;
          transition: background-color 0.2s, border 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .group-card:hover {
          background-color: rgba(255, 255, 255, 0.05);
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

          /* Add more responsive styles as needed */
        }
      `}</style>
    </div>
  );
};

export default GroupHistory;