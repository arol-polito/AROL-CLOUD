export default interface Machinery {
  uid: string
  companyID: number
  modelID: string
  modelName: string
  modelType: string
  geoLocation: { x: number, y: number }
  locationCluster: string
  numHeads: number
}
