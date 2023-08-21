import type GridWidget from '../interfaces/GridWidget'
import {type Layout} from 'react-grid-layout'
import DashboardSize from "../interfaces/DashboardSize";

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
    layout: Layout[]


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
        layout?: Layout[]) {
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
            compactType: 'vertical'
        };
        this.widgets = widgets || [];
        this.layout = layout || [];
    }
}
