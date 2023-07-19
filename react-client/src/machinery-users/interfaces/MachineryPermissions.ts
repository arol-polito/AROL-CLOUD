export default interface MachineryPermissions {
    userID: number
    machineryUID: string
    machineryAccess: boolean
    dashboardsWrite: boolean
    dashboardsModify: boolean
    dashboardsRead: boolean
    documentsWrite: boolean
    documentsModify: boolean
    documentsRead: boolean
}