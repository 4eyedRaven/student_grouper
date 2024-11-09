// pages/index.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import ClassManager from '../components/ClassManager';
import StudentManager from '../components/StudentManager';
import GroupingTool from '../components/GroupingTool';
import { Class, Student } from '../types';

export default function Home() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClassId, setCurrentClassId] = useState<number | null>(null);

  useEffect(() => {
    const savedClasses = localStorage.getItem('classes');
    if (savedClasses) {
      const parsedClasses: Class[] = JSON.parse(savedClasses);

      // Assign default values for new properties if missing
      const updatedClasses = parsedClasses.map((cls) => ({
        ...cls,
        students: cls.students.map((student) => ({
          ...student,
          capabilityLevel: student.capabilityLevel || 'medium', // Default capability level
          present: student.present !== undefined ? student.present : true, // Default to present
        })),
      }));

      setClasses(updatedClasses);

      if (updatedClasses.length > 0) {
        setCurrentClassId(updatedClasses[0].id);
      } else {
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
        present: true, // Student is present by default
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

  return (
    <div className="container">
      <Head>
        <title>Student Grouping App</title>
        <meta
          name="description"
          content="A tool for teachers to manage classes and group students"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Student Grouping App</h1>
        <ClassManager
          classes={classes}
          currentClassId={currentClassId}
          onAddClass={addClass}
          onRemoveClass={removeClass}
          onSelectClass={setCurrentClassId}
        />
        {currentClass && (
          <>
            <StudentManager
              students={currentClass.students}
              onAddStudent={addStudent}
              onRemoveStudent={removeStudent}
              onToggleExclusion={toggleStudentExclusion}
            />
            <GroupingTool students={currentClass.students.filter((s) => s.present)} />
          </>
        )}
      </main>
    </div>
  );
}