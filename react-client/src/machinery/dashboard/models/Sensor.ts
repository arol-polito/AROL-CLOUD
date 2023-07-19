export default class Sensor {
    machineryUID: string
    name: string
    description: string
    unit: string
    thresholdLow: number
    thresholdHigh: number
    internalName: string
    category: string
    type: string
    isHeadMounted: boolean
    bucketingType: string
    imgFilename: number
    imgPointerLocation: { x: number, y: number }


    constructor(machineryUID: string, name: string, description: string, unit: string, thresholdLow: number, thresholdHigh: number, internalName: string, category: string, type: string, isHeadMounted: boolean, bucketingType: string, imgFilename: number, imgPointerLocation: { x: number; y: number }) {
        this.machineryUID = machineryUID;
        this.name = name;
        this.description = description;
        this.unit = unit;
        this.thresholdLow = thresholdLow;
        this.thresholdHigh = thresholdHigh;
        this.internalName = internalName;
        this.category = category;
        this.type = type;
        this.isHeadMounted = isHeadMounted;
        this.bucketingType = bucketingType;
        this.imgFilename = imgFilename;
        this.imgPointerLocation = imgPointerLocation;
    }
}