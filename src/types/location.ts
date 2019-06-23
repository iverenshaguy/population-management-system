export type CreateLocationInput = {
  name: string,
  male: number,
  female: number,
  parent: string
}

export type UpdateLocationInput = {
  name?: string,
  male?: number,
  female?: number,
  parent?: string
}

export type UpdateLocationValue = {
  name?: string,
  population?: {
    male?: number,
    female?: number,
  }
  parent?: string
}

export type ParentData = {
  oldParent: string,
  newParent: string
}

export type User = {
  _id: string,
  email: string,
  name: string,
  locations: [Location]
}

export type Population = {
  female: number,
  male: number,
  total: number
}

export type Location = {
  _id: string,
  name: string,
  population: Population,
  author: User,
  parent: Location,
  children: [Location]
}
