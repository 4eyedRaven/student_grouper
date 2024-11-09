import { useState } from 'react'
import { Student } from '../types'

interface StudentManagerProps {
  students: Student[]
  onAddStudent: (name: string) => void
  onRemoveStudent: (id: number) => void
  onToggleExclusion: (id: number) => void
}

export default function StudentManager({
  students,
  onAddStudent,
  onRemoveStudent,
  onToggleExclusion,
}: StudentManagerProps) {
  const [newStudentName, setNewStudentName] = useState('')

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim())
      setNewStudentName('')
    }
  }

  return (
    <div className="student-manager">
      <h2>Students</h2>
      <div className="student-list">
        {students.map((student) => (
          <div key={student.id} className={`student-item ${student.excluded ? 'excluded' : ''}`}>
            {student.name}
            <button className="exclude-btn" onClick={() => onToggleExclusion(student.id)}>
              {student.excluded ? 'Include' : 'Exclude'}
            </button>
            <button className="remove-btn" onClick={() => onRemoveStudent(student.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="add-student">
        <input
          type="text"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
          placeholder="New student name"
        />
        <button onClick={handleAddStudent}>+</button>
      </div>
    </div>
  )
}