import { useState } from 'react'
import { Student } from '../types'

interface GroupingToolProps {
  students: Student[]
}

export default function GroupingTool({ students }: GroupingToolProps) {
  const [groupingOption, setGroupingOption] = useState<'byGroups' | 'byStudents'>('byGroups')
  const [groupCount, setGroupCount] = useState(2)
  const [groups, setGroups] = useState<Student[][]>([])

  const generateGroups = () => {
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5)
    let newGroups: Student[][] = []

    if (groupingOption === 'byGroups') {
      const groupSize = Math.ceil(shuffledStudents.length / groupCount)
      for (let i = 0; i < groupCount; i++) {
        newGroups.push(shuffledStudents.slice(i * groupSize, (i + 1) * groupSize))
      }
    } else {
      for (let i = 0; i < shuffledStudents.length; i += groupCount) {
        newGroups.push(shuffledStudents.slice(i, i + groupCount))
      }
    }

    setGroups(newGroups)
  }

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
          min="2"
          max={students.length}
          value={groupCount}
          onChange={(e) => setGroupCount(Math.max(2, Math.min(students.length, parseInt(e.target.value) || 2)))}
        />
        <button onClick={generateGroups}>Generate Groups</button>
      </div>
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
  )
}