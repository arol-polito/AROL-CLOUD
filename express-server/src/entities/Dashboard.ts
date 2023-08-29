export default class Dashboard {
    name: string
    isLoading: boolean
    machineryUID: string
    timestamp: number
    userID: number
    isDefault: boolean
    numUnsavedChanges: number
    lastSave: number
    isNew: boolean
    size: DashboardSize
    widgets: GridWidget[]
    layout: any[]


    constructor(
        name?: string,
        isLoading?: boolean,
        machineryUID?: string,
        timestamp?: number,
        userID?: number,
        isDefault?: boolean,
        numUnsavedChanges?: number,
        lastSave?: number,
        isNew?: boolean,
        size?: DashboardSize,
        widgets?: GridWidget[],
        layout?: any[]) {
        this.name = name || 'Unsaved new dashboard';
        this.isLoading = false;
        this.machineryUID = machineryUID || '';
        this.timestamp = timestamp || 0;
        this.userID = userID || 0;
        this.isDefault = isDefault || false;
        this.numUnsavedChanges = numUnsavedChanges || 0;
        this.lastSave = lastSave || 0;
        this.isNew = isNew || true;
        this.size = size || {
            width: 1000,
            numCols: 12,
            numRows: 4,
            rowHeight: 125,
            compactType: null
        };
        this.widgets = widgets || [];
        this.layout = layout || [];
    }
}

interface DashboardSize {
    width: number
    numCols: number
    numRows: number
    rowHeight: number
    compactType: 'horizontal' | 'vertical' | null
}

interface GridWidget {
    id: string
    name: string
    category: string
    type: string
    maxSensors: number
    static: boolean
    sensorsMonitoring: any
    numSensorsMonitoring: number
    sensorsMonitoringArray: any[]
    sensorsMonitoringObject: Record<string, any>
    aggregationsArray: any[]
    numAggregationsMonitoring: number
    sensorData: any
    chartProps: any
    numChange: number
}