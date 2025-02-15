// components/ClientHome.tsx
"use client";

import { useState, useEffect } from 'react';
import ClassManager from './ClassManager';
import StudentManager from './StudentManager';
import GroupingTool from './GroupingTool';
import GroupHistory from './GroupHistory';
import Instructions from './Instructions';
import { Class, Student } from '../types';

export default function ClientHome() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClassId, setCurrentClassId] = useState<number | null>(null);
  const [groupHistoryRefreshKey, setGroupHistoryRefreshKey] = useState<number>(0);

  // Load classes from localStorage on mount
  useEffect(() => {
    const savedClasses = localStorage.getItem('classes');
    if (savedClasses) {
      try {
        const parsedClasses: Class[] = JSON.parse(savedClasses);
        const updatedClasses = parsedClasses.map((cls) => ({
          ...cls,
          students: cls.students.map((student) => ({
            ...student,
            capabilityLevel: student.capabilityLevel || 'medium',
            present: student.present !== undefined ? student.present : true,
          })),
        }));
        setClasses(updatedClasses);
        if (updatedClasses.length > 0) {
          setCurrentClassId(updatedClasses[0].id);
        } else {
          setCurrentClassId(null);
        }
      } catch (error) {
        console.error('ClientHome: Error parsing classes from localStorage:', error);
        setClasses([]);
        setCurrentClassId(null);
      }
    }
  }, []);

  // Save classes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  const currentClass = classes.find((c) => c.id === currentClassId) || null;

  // Function to add a new class
  const addClass = (className: string) => {
    const newClass: Class = { id: Date.now(), name: className, students: [] };
    setClasses([...classes, newClass]);
    setCurrentClassId(newClass.id);
  };

  // Function to remove an existing class
  const removeClass = (classId: number) => {
    const updatedClasses = classes.filter((c) => c.id !== classId);
    setClasses(updatedClasses);
    if (currentClassId === classId) {
      setCurrentClassId(updatedClasses.length > 0 ? updatedClasses[0].id : null);
    }
  };

  // New function to rename a class period
  const renameClass = (classId: number, newName: string) => {
    setClasses(classes.map((c) =>
      c.id === classId ? { ...c, name: newName } : c
    ));
  };

  // Function to add a new student to the current class
  const addStudent = (name: string, capabilityLevel: 'high' | 'medium' | 'low') => {
    if (currentClassId !== null) {
      const newStudent: Student = {
        id: Date.now(),
        name,
        capabilityLevel,
        present: true,
      };
      setClasses(
        classes.map((c) =>
          c.id === currentClassId ? { ...c, students: [...c.students, newStudent] } : c
        )
      );
    }
  };

  // Function to remove a student from the current class
  const removeStudent = (studentId: number) => {
    if (currentClassId !== null) {
      setClasses(
        classes.map((c) =>
          c.id === currentClassId
            ? { ...c, students: c.students.filter((s) => s.id !== studentId) }
            : c
        )
      );
    }
  };

  // Function to toggle student presence/exclusion
  const toggleStudentExclusion = (studentId: number) => {
    if (currentClassId !== null) {
      setClasses(
        classes.map((c) =>
          c.id === currentClassId
            ? {
                ...c,
                students: c.students.map((s) =>
                  s.id === studentId ? { ...s, present: !s.present } : s
                ),
              }
            : c
        )
      );
    }
  };

  // Function to trigger a refresh of group history
  const triggerGroupHistoryRefresh = () => {
    setGroupHistoryRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <>
      <ClassManager
        classes={classes}
        currentClassId={currentClassId}
        onAddClass={addClass}
        onRemoveClass={removeClass}
        onSelectClass={setCurrentClassId}
        onRenameClass={renameClass} // Pass the renaming function to ClassManager
      />

      {/* Display instructions when no classes exist */}
      {classes.length === 0 && <Instructions />}

      {currentClass && (
        <>
          <StudentManager
            students={currentClass.students}
            onAddStudent={addStudent}
            onRemoveStudent={removeStudent}
            onToggleExclusion={toggleStudentExclusion}
          />
          <GroupingTool
            students={currentClass.students.filter((s) => s.present)}
            currentClassId={currentClassId}
            onGroupingSaved={triggerGroupHistoryRefresh}
          />
          <GroupHistory
            currentClassId={currentClassId}
            className={currentClass.name}
            refreshKey={groupHistoryRefreshKey}
          />
        </>
      )}
    </>
  );
}