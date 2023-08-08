import type GridWidget from '../interfaces/GridWidget'
import type ReactGridLayout from 'react-grid-layout'
import { type Layout } from 'react-grid-layout'

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
  gridCompaction: 'horizontal' | 'vertical' | null
  grid: {
    widgets: GridWidget[]
    layout: Layout[]
  }

  constructor (
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
    gridCompaction?: 'horizontal' | 'vertical' | null,
    dashboard?: { widgets: GridWidget[], layout: ReactGridLayout.Layout[] }
  ) {
    this.name = name || 'Unsaved new dashboard'
    this.machineryUID = machineryUID || ''
    this.timestamp = timestamp || 0
    this.userID = userID || 0
    this.isDefault = isDefault || false
    this.numUnsavedChanges = numUnsavedChanges || 0
    this.lastSave = lastSave || 0
    this.isNew = isNew || true
    this.numCols = numCols || 12
    this.numRows = numRows || 2
    this.gridCompaction = gridCompaction || null
    this.grid = (dashboard != null)
      ? dashboard
      : {
          widgets: [],
          layout: []
        }
  }
}
