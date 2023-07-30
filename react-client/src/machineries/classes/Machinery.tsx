export default class Machinery {
  id: number
  name: string
  location: string
  type: string
  status: string

  constructor (id: number, name: string, location: string, type: string, status: string) {
    this.id = id
    this.name = name
    this.location = location
    this.type = type
    this.status = status
  }
}
