export default interface SavedDashboard {
    name: string
    isDefault: boolean
    machineryUID: string
    timestamp: number
    numSensorsMonitored: number
    numWidgets: number
}