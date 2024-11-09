import { useState } from 'react'
import { Class } from '../types'

interface ClassManagerProps {
  classes: Class[]
  currentClass: Class | null
  onAddClass: (className: string) => void
  onRemoveClass: (classId: number) => void
  onSelectClass: (selectedClass: Class) => void
}

export default function ClassManager({
  classes,
  currentClass,
  onAddClass,
  onRemoveClass,
  onSelectClass,
}: ClassManagerProps) {
  const [newClassName, setNewClassName] = useState('')

  const handleAddClass = () => {
    if (newClassName.trim()) {
      onAddClass(newClassName.trim())
      setNewClassName('')
    }
  }

  return (
    <div className="class-manager">
      <h2>Classes</h2>
      <div className="class-list">
        {classes.map((c) => (
          <div
            key={c.id}
            className={`class-item ${currentClass?.id === c.id ? 'active' : ''}`}
            onClick={() => onSelectClass(c)}
          >
            {c.name}
            <button className="remove-btn" onClick={() => onRemoveClass(c.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="add-class">
        <input
          type="text"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="New class name"
        />
        <button onClick={handleAddClass}>+</button>
      </div>
    </div>
  )
}