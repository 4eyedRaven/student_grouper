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