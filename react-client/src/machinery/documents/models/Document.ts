export default class Document {
  machineryUID: string
  documentUID: string | null
  name: string
  location: string
  sizeBytes: number
  isDir: boolean
  isDocument: boolean
  isModifiable: boolean
  creationTimestamp: number
  modificationTimestamp: number
  createdBy: number
  modifiedBy: number

  constructor (machineryUID: string, documentUID: string | null, name: string, location: string, sizeBytes: number, isDir: boolean, isDocument: boolean, isModifiable: boolean, creationTimestamp: number, modificationTimestamp: number, createdBy: number, modifiedBy: number) {
    this.machineryUID = machineryUID
    this.documentUID = documentUID
    this.name = name
    this.location = location
    this.sizeBytes = sizeBytes
    this.isDir = isDir
    this.isDocument = isDocument
    this.isModifiable = isModifiable
    this.creationTimestamp = creationTimestamp
    this.modificationTimestamp = modificationTimestamp
    this.createdBy = createdBy
    this.modifiedBy = modifiedBy
  }
}
