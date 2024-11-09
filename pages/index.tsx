import { useState, useEffect } from 'react'
import Head from 'next/head'
import ClassManager from '../components/ClassManager'
import StudentManager from '../components/StudentManager'
import GroupingTool from '../components/GroupingTool'
import { Class, Student } from '../types'

export default function Home() {
  const [classes, setClasses] = useState<Class[]>([])
  const [currentClass, setCurrentClass] = useState<Class | null>(null)

  useEffect(() => {
    const savedClasses = localStorage.getItem('classes')
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses)
      setClasses(parsedClasses)
      if (parsedClasses.length > 0) {
        setCurrentClass(parsedClasses[0])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes))
  }, [classes])

  const addClass = (className: string) => {
    const newClass: Class = { id: Date.now(), name: className, students: [] }
    setClasses([...classes, newClass])
    setCurrentClass(newClass)
  }

  const removeClass = (classId: number) => {
    const updatedClasses = classes.filter((c) => c.id !== classId)
    setClasses(updatedClasses)
    if (currentClass?.id === classId) {
      setCurrentClass(updatedClasses[0] || null)
    }
  }

  const addStudent = (name: string) => {
    if (currentClass) {
      const newStudent: Student = { id: Date.now(), name, excluded: false }
      const updatedClass = {
        ...currentClass,
        students: [...currentClass.students, newStudent],
      }
      setClasses(classes.map((c) => (c.id === currentClass.id ? updatedClass : c)))
      setCurrentClass(updatedClass)
    }
  }

  const removeStudent = (studentId: number) => {
    if (currentClass) {
      const updatedStudents = currentClass.students.filter((s) => s.id !== studentId)
      const updatedClass = { ...currentClass, students: updatedStudents }
      setClasses(classes.map((c) => (c.id === currentClass.id ? updatedClass : c)))
      setCurrentClass(updatedClass)
    }
  }

  const toggleStudentExclusion = (studentId: number) => {
    if (currentClass) {
      const updatedStudents = currentClass.students.map((s) =>
        s.id === studentId ? { ...s, excluded: !s.excluded } : s
      )
      const updatedClass = { ...currentClass, students: updatedStudents }
      setClasses(classes.map((c) => (c.id === currentClass.id ? updatedClass : c)))
      setCurrentClass(updatedClass)
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Student Grouping App</title>
        <meta name="description" content="A tool for teachers to manage classes and group students" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Student Grouping App</h1>
        <ClassManager
          classes={classes}
          currentClass={currentClass}
          onAddClass={addClass}
          onRemoveClass={removeClass}
          onSelectClass={setCurrentClass}
        />
        {currentClass && (
          <>
            <StudentManager
              students={currentClass.students}
              onAddStudent={addStudent}
              onRemoveStudent={removeStudent}
              onToggleExclusion={toggleStudentExclusion}
            />
            <GroupingTool students={currentClass.students.filter((s) => !s.excluded)} />
          </>
        )}
      </main>
    </div>
  )
}