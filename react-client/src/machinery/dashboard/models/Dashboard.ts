import GridWidget from "../interfaces/GridWidget";
import ReactGridLayout, {Layout} from "react-grid-layout";

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
        layout: Layout[]
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
        dashboard?: { widgets: GridWidget[]; layout: ReactGridLayout.Layout[] }
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
        this.grid = dashboard ?  dashboard : {
            widgets: [],
            layout: []
        };
    }
}