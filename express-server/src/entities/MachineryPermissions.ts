export default class MachineryPermissions {
    userID: number
    machineryUID: string
    dashboardsWrite: boolean
    dashboardsModify: boolean
    dashboardsRead: boolean
    documentsWrite: boolean
    documentsModify: boolean
    documentsRead: boolean


    constructor(userID: number, machineryUID: string, dashboardsWrite: boolean, dashboardsModify: boolean, dashboradsRead: boolean, documentsWrite: boolean, documentsModify: boolean, documentsRead: boolean) {
        this.userID = userID;
        this.machineryUID = machineryUID;
        this.dashboardsWrite = dashboardsWrite;
        this.dashboardsModify = dashboardsModify;
        this.dashboardsRead = dashboradsRead;
        this.documentsWrite = documentsWrite;
        this.documentsModify = documentsModify;
        this.documentsRead = documentsRead;
    }
}