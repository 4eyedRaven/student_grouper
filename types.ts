export interface Student {
  id: number
  name: string
  excluded: boolean
}

export interface Class {
  id: number
  name: string
  students: Student[]
}