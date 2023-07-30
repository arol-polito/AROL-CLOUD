import Dashboard from "../entities/Dashboard";
import machineryRepository from "./MachineryRepository";
import userRepository from "./UserRepository";
import pgClient from "../configs/PgClient";
import {ITask} from "pg-promise";

interface SavedDashboard {
    name: string
    isDefault: boolean
    machineryUID: string
    timestamp: number
    numSensorsMonitored: number
    numWidgets: number
}

async function saveDashboard(dashboard: Dashboard, userID: number): Promise<boolean | null> {

    try {

        dashboard.userID = userID
        dashboard.timestamp = Date.now()

        let result: any
        return await pgClient.tx(async (transaction: ITask<any>) => {

            if (dashboard.isDefault) {
                await pgClient.query(
                    "UPDATE public.machinery_dashboards SET dashboard=jsonb_set(dashboard::jsonb, '{isDefault}', 'false'::jsonb, true)::jsonb WHERE machinery_uid=$1 RETURNING *",
                    [dashboard.machineryUID]
                )

            }

            const duplicateResult = await pgClient.query(
                "SELECT COUNT(*) AS num_dashboards FROM public.machinery_dashboards WHERE machinery_uid=$1 AND dashboard->>'name' = $2",
                [dashboard.machineryUID, dashboard.name]
            )

            if (!duplicateResult || duplicateResult.length === 0 || !duplicateResult[0].hasOwnProperty("num_dashboards")) {
                throw "Could not count number of dashboards while saving dashboard"
            }

            const duplicate = Number(duplicateResult[0].num_dashboards)
            if (duplicate===0) {
                throw "No dashboard with this name found"
            }

            result = await pgClient.query(
                "UPDATE public.machinery_dashboards SET dashboard=$1 WHERE machinery_uid=$2 AND dashboard->>'name'=$3 RETURNING *",
                [dashboard, dashboard.machineryUID, dashboard.name]
            )

            console.log(result)

            return result && result.length;

        })


    } catch (e) {
        console.log(e)
        if(e==="No dashboard with this name found"){
            return false
        }
        return null
    }

}

async function saveAsDashboard(dashboard: Dashboard, userID: number): Promise<boolean | null> {

    try {

        dashboard.userID = userID
        dashboard.timestamp = Date.now()

        let result: any
        return await pgClient.tx(async (transaction: ITask<any>) => {

            if (dashboard.isDefault) {
                await pgClient.query(
                    "UPDATE public.machinery_dashboards SET dashboard=jsonb_set(dashboard::jsonb, '{isDefault}', 'false'::jsonb, true)::jsonb WHERE machinery_uid=$1",
                    [dashboard.machineryUID]
                )
            }

            const duplicateResult = await pgClient.query(
                "SELECT COUNT(*) AS num_dashboards FROM public.machinery_dashboards WHERE machinery_uid=$1 AND dashboard->>'name' = $2",
                [dashboard.machineryUID, dashboard.name]
            )

            if (!duplicateResult || duplicateResult.length === 0 || !duplicateResult[0].hasOwnProperty("num_dashboards")) {
                throw "Could not count number of dashboards while saving as dashboard"
            }

            const duplicate = Number(duplicateResult[0].num_dashboards)

            if (duplicate > 0) {
                throw "Dashboard with this name already exists"
            }

            result = await pgClient.query(
                "INSERT INTO public.machinery_dashboards(machinery_uid, dashboard) VALUES ($1, $2) RETURNING *",
                [dashboard.machineryUID, dashboard]
            )

            return result && result.length;

        })


    } catch (e) {
        console.log(e)
        if(e==="Dashboard with this name already exists"){
            return false
        }
        return null
    }

}

async function deleteDashboard(dashboardName: string, machineryUID: string): Promise<boolean | null> {

    try {
        const result = await pgClient.query(
            "DELETE FROM public.machinery_dashboards WHERE dashboard->>'name'=$1 AND machinery_uid=$2 RETURNING *",
            [dashboardName, machineryUID]
        )

        return result && result.length;

    } catch (e) {
        console.log(e)
        return null
    }

}

async function loadDashboard(dashboardName: string, machineryUID: string): Promise<Dashboard | null> {

    try {

        const result = await pgClient.oneOrNone(
            "SELECT dashboard FROM public.machinery_dashboards WHERE dashboard->>'name'=$1 AND machinery_uid=$2",
            [dashboardName, machineryUID]
        )

        if (!result) {
            return null
        }

        return result.dashboard as Dashboard


    } catch (e) {
        console.log(e)
        return null
    }

}

async function loadDefaultDashboard(machineryUID: string): Promise<Dashboard | null> {

    try {

        const result = await pgClient.oneOrNone(
            "SELECT dashboard FROM public.machinery_dashboards WHERE (dashboard->>'isDefault')::boolean=true AND machinery_uid=$1 LIMIT 1",
            [machineryUID]
        )

        if (!result) {
            return null
        }

        return result.dashboard as Dashboard

    } catch (e) {
        console.log(e)
        return null
    }

}

async function getDashboards(machineryUID: string): Promise<SavedDashboard[] | null> {

    try {

        //Retrieve all dashboards of the given machinery
        const result = await pgClient.manyOrNone(
            "SELECT dashboard FROM public.machinery_dashboards WHERE machinery_uid=$1",
            [machineryUID]
        )

        const savedDashboards: SavedDashboard[] = []
        await result.forEach((row: any) => {

            //Cast DB dashboard object
            const dashboard = row.dashboard as Dashboard

            //Count distinct sensors monitored in the given dashboard
            const sensorsMonitored: string[] = []
            dashboard.grid.widgets.forEach((widget) => {
                Object.values(widget.sensorsMonitoring.sensors).forEach((value) => {
                    value.forEach((sensorMonitoringHead) => {
                        sensorMonitoringHead.sensorNames.forEach((sensorEntry) => {
                            let sensorName = ""
                            if (sensorMonitoringHead.headNumber) {
                                sensorName = "H" + String(sensorMonitoringHead.headNumber).padStart(2, "0") + "_" + sensorEntry.name
                            } else {
                                sensorName = sensorEntry.name
                            }
                            if (!sensorsMonitored.includes(sensorName)) {
                                sensorsMonitored.push(sensorName)
                            }
                        })
                    })
                })
            })

            //Add current dashboard to saved dashboards array
            savedDashboards.push({
                name: dashboard.name,
                isDefault: dashboard.isDefault,
                machineryUID: dashboard.machineryUID,
                timestamp: dashboard.timestamp,
                numSensorsMonitored: sensorsMonitored.length,
                numWidgets: dashboard.grid.widgets.length
            })
        })

        return savedDashboards

    } catch (e) {
        console.log(e)
        return null
    }

}

async function getDashboardTemplates(machineryUID: string, companyID: number, userID: number, userRoles: string[]): Promise<SavedDashboard[] | null> {

    try {
        //FIND MACHINERIES WITH SAME MODEL AS THE REQUESTED MACHINERY
        let companyMachineries = await machineryRepository.getCompanyMachineries(companyID)
        if (!companyMachineries) {
            // noinspection ExceptionCaughtLocallyJS
            throw "Could not fetch company machineries"
        }

        const machineryFound = companyMachineries.find((machinery) => (machinery.uid === machineryUID))
        if (!machineryFound) {
            // noinspection ExceptionCaughtLocallyJS
            throw "MachineryUID does not exist"
        }

        //FILTER OUT MACHINERIES TO WHICH I DO NOT HAVE PERMISSION
        if (!userRoles.includes("COMPANY_ROLE_ADMIN")) {
            const userMachineries = await userRepository.getAllUserPermissions(userID)
            if (userMachineries) {
                companyMachineries = companyMachineries.filter((machinery) => (userMachineries!.find((el) => (el.dashboardsRead && el.machineryUID === machinery.uid)) !== undefined))
            } else {
                // noinspection ExceptionCaughtLocallyJS
                throw "Could not fetch machinery permissions of user"
            }
        }

        //FIND ALL MACHINERIES THAT HAVE THE SAME MODEL AS THE CURRENT MACHINERY
        //Takes care of filtering out the current machinery
        const machineryModel = machineryFound.modelID
        const sameModelMachineryUIDs: string[] = []
        companyMachineries.forEach((machinery) => {
            if (machinery.uid !== machineryUID && machinery.modelID === machineryModel) {
                sameModelMachineryUIDs.push(machinery.uid)
            }
        })

        if (sameModelMachineryUIDs.length === 0) {
            return []
        }


        //FETCH TEMPLATES
        const result = await pgClient.manyOrNone(
            "SELECT dashboard FROM public.machinery_dashboards WHERE machinery_uid = ANY ($1)",
            [sameModelMachineryUIDs]
        )

        const templateDashboards: SavedDashboard[] = []
        await result.forEach((row: any) => {

            //Cast DB dashboard object
            const dashboard = row.dashboard as Dashboard

            //Count distinct sensors monitored in the given dashboard
            // let sensorsMonitored: string[] = []
            // dashboard.grid.widgets.forEach((widget) => {
            //     Object.keys(widget.sensorsMonitoring.sensors).forEach((key) => {
            //         widget.sensorsMonitoring.sensors[key].forEach((headMechEntry) => {
            //             headMechEntry.sensorNames.forEach((sensorEntry) => {
            //                 if (!sensorsMonitored.includes(sensorEntry.name)) {
            //                     sensorsMonitored.push(sensorEntry.name)
            //                 }
            //             })
            //         })
            //     })
            // })

            //Add current dashboard to template dashboards array
            templateDashboards.push({
                name: dashboard.name,
                isDefault: dashboard.isDefault,
                machineryUID: dashboard.machineryUID,
                timestamp: dashboard.timestamp,
                numSensorsMonitored: 0/*sensorsMonitored.length*/,
                numWidgets: dashboard.grid.widgets.length
            })
        })

        return templateDashboards

    } catch (e) {
        console.log(e)
        return null
    }

}


export default {
    saveDashboard,
    saveAsDashboard,
    deleteDashboard,
    loadDashboard,
    loadDefaultDashboard,
    getDashboards,
    getDashboardTemplates
}