export default class SensorData{
    // formattedTime: string
    active: boolean
    machineryOff: boolean
    machineryOffFrom: number
    machineryOffTo: number
    time: number
    minTime: number
    maxTime: number
    formattedTime: string

    activeData: {
        [key: string]: number | null
    }
    fillerData: {
        [key: string]: number | null
    }
    allData: {
        [key: string]: number | null
    }
    aggregationData: {
        [key: string]: {value: number, note: string}
    }

    constructor(active: boolean, machineryOff: boolean, machineryOffFrom: number, machineryOffTo: number, time: number, minTime: number, maxTime: number, formattedTime: string, activeData: { [p: string]: number | null }, fillerData: { [p: string]: number | null }, allData: { [p: string]: number | null }, aggregationData: { [p: string]: { value: number; note: string } }) {
        this.active = active;
        this.machineryOff = machineryOff;
        this.machineryOffFrom = machineryOffFrom;
        this.machineryOffTo = machineryOffTo;
        this.time = time;
        this.minTime = minTime;
        this.maxTime = maxTime;
        this.formattedTime = formattedTime;
        this.activeData = activeData;
        this.fillerData = fillerData;
        this.allData = allData;
        this.aggregationData = aggregationData;
    }
}
