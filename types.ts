// types.ts
export interface Student {
  id: number;
  name: string;
  present: boolean;
  capabilityLevel: 'high' | 'medium' | 'low';
}

export interface Class {
  id: number;
  name: string;
  students: Student[];
}

export interface GroupingHistoryEntry {
  id: number;
  timestamp: string; // ISO string
  method: 'byGroups' | 'byStudents';
  value: number; // Number of groups or students per group
  numberOfStudents: number;
  groups: {
    id: number;
    name: string;
    students: Student[];
  }[];
}