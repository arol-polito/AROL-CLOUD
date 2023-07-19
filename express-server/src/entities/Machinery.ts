export default class Machinery {
    uid: string
    companyID: number
    modelID: string
    modelName: string
    modelType: string
    geoLocation: { x: number, y: number }
    locationCluster: string
    numHeads: number

    constructor(
        uid: string,
        companyID: number,
        modelID: string,
        modelName: string,
        modelType: string,
        geoLocation: { x: number, y: number },
        locationCluster: string,
        numHeads: number
    ) {
        this.uid = uid
        this.companyID = companyID
        this.modelID = modelID
        this.modelName = modelName
        this.modelType = modelType
        this.geoLocation = geoLocation
        this.locationCluster = locationCluster
        this.numHeads = numHeads
    }

}