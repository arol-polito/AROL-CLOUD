export default class Dashboard {
    name: string
    machineryUID: string
    timestamp: number
    userID: number
    isDefault: boolean
    numUnsavedChanges: number
    lastSave: number
    isNew: boolean
    numCols: number
    numRows: number
    gridCompaction: "horizontal" | "vertical" | null
    grid: {
        widgets: GridWidget[],
        layout: any[]
    }

    constructor(
        name?: string,
        machineryUID?: string,
        timestamp?: number,
        userID?: number,
        isDefault?: boolean,
        numUnsavedChanges?: number,
        lastSave?: number,
        isNew?: boolean,
        numCols?: number,
        numRows?: number,
        gridCompaction?: "horizontal" | "vertical" | null,
        dashboard?: { widgets: GridWidget[]; layout: any[] }
    ) {
        this.name = name ? name : "Unsaved new dashboard"
        this.machineryUID = machineryUID ? machineryUID : ""
        this.timestamp = timestamp ? timestamp : 0
        this.userID = userID ? userID : 0
        this.isDefault = isDefault ? isDefault : false
        this.numUnsavedChanges = numUnsavedChanges ? numUnsavedChanges : 0
        this.lastSave = lastSave ? lastSave : 0
        this.isNew = isNew ? isNew : true
        this.numCols = numCols ? numCols : 12
        this.numRows = numRows ? numRows : 2
        this.gridCompaction = gridCompaction ? gridCompaction : null
        this.grid = dashboard ? dashboard : {
            widgets: [],
            layout: []
        };
    }
}

interface GridWidget {
    id: string
    name: string
    type: string
    maxSensors: number
    sensorsMonitoring: SensorDataFilters
}

interface SensorDataFilters {
    dataRange: SensorDataRange
    sensors: { [key: string]: SensorDataFilter[] },
    aggregations: { name: string, color: string }[]
}

interface SensorDataFilter {
    headNumber: number
    mechNumber: number
    sensorNames: { name: string, color: string }[]
}

interface SensorDataRange {
    amount: number
    unit: string
}