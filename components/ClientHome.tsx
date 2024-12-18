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
  const [groupHistoryRefreshKey, setGroupHistoryRefreshKey] = useState<number>(0); // New state

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

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  const currentClass = classes.find((c) => c.id === currentClassId) || null;

  const addClass = (className: string) => {
    const newClass: Class = { id: Date.now(), name: className, students: [] };
    setClasses([...classes, newClass]);
    setCurrentClassId(newClass.id);
  };

  const removeClass = (classId: number) => {
    const updatedClasses = classes.filter((c) => c.id !== classId);
    setClasses(updatedClasses);

    if (currentClassId === classId) {
      setCurrentClassId(updatedClasses.length > 0 ? updatedClasses[0].id : null);
    }
  };

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

  // Function to trigger group history refresh
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
      />

      {/* Display Instructions if no classes are present */}
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
            onGroupingSaved={triggerGroupHistoryRefresh} // Pass the refresh trigger
          />
          <GroupHistory
            currentClassId={currentClassId}
            className={currentClass.name}
            refreshKey={groupHistoryRefreshKey} // Pass the refresh key
          />
        </>
      )}
    </>
  );
}