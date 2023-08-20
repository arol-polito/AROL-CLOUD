import {useLocation, useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useContext, useEffect, useState} from "react";
import ToastContext from "../../utils/contexts/ToastContext";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import Machinery from "../../machineries-map/components/Machinery";
import Sensor from "../dashboard/models/Sensor";
import Dashboard from "../dashboard/models/Dashboard";
import TooltipData from "../dashboard/interfaces/TooltipData";
import permissionChecker from "../../utils/PermissionChecker";
import machineryService from "../../services/MachineryService";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import LoadDashboardAction from "./interfaces/LoadDashboardAction";
import dashboardService from "../../services/DashboardService";
import toastHelper from "../../utils/ToastHelper";
import {Layout} from "react-grid-layout";
import {calculateChartProps, loadSensorData, processSensorsMonitoring} from "../dashboard/utils"

export const useMachineryPageLogic = () => {

    const navigate = useNavigate()

    const params = useParams()
    const machineryUID = params.machineryUID

    const location = useLocation()

    const toast = useContext(ToastContext)
    const {principal} = useContext(PrincipalContext)

    const [dashboardPermissions, setDashboardPermissions] = useState({
        read: false,
        modify: false,
        write: false
    })
    const [documentsPermissions, setDocumentsPermissions] = useState({
        read: false,
        modify: false,
        write: false
    })

    const [machinery, setMachinery] = useState<Machinery | null>(null)

    const [machinerySensors, setMachinerySensors] = useState<Sensor[]>([])

    const [dashboard, setDashboard] = useState<Dashboard>(new Dashboard())
    // This is the layout object passed to the react-grid-layout
    // This object is updated when a widget is dropped/deleted with values from the gridProps state
    // If not done like this, drag&dropping will not work as intended
    const [layout, setLayout] = useState<Layout[]>([]);

    // In order to make sure that only 1 tooltip is displayed at a time
    const [chartTooltip, setChartTooltip] = useState<TooltipData>({
        active: false,
        label: '',
        chartCoordinate: [0, 0],
        clickCoordinate: [0, 0],
        leftData: [],
        displayData: [],
        sensorData: [],
        sensorDataIndex: -1,
        sensorsMonitoringArray: [],
        sensorsMonitoringObject: {},
        aggregationsArray: []
    })

    const [machineryLoading, setMachineryLoading] = useState(true)

    // SET USER PERMISSIONS
    useEffect(() => {
        if (!machineryUID) return

        setDashboardPermissions((val) => {
            if (permissionChecker.hasMachineryPermission(principal, machineryUID, 'dashboardsWrite')) {
                val.read = true
                val.modify = true
                val.write = true
            } else if (permissionChecker.hasMachineryPermission(principal, machineryUID, 'dashboardsModify')) {
                val.read = true
                val.modify = true
                val.write = false
            } else if (permissionChecker.hasMachineryPermission(principal, machineryUID, 'dashboardsRead')) {
                val.read = true
                val.modify = false
                val.write = false
            } else {
                val.read = false
                val.modify = false
                val.write = false
            }

            return {...val}
        })

        setDocumentsPermissions((val) => {
            if (permissionChecker.hasMachineryPermission(principal, machineryUID, 'documentsWrite')) {
                val.read = true
                val.modify = true
                val.write = true
            } else if (permissionChecker.hasMachineryPermission(principal, machineryUID, 'documentsModify')) {
                val.read = true
                val.modify = true
                val.write = false
            } else if (permissionChecker.hasMachineryPermission(principal, machineryUID, 'documentsRead')) {
                val.read = true
                val.modify = false
                val.write = false
            } else {
                val.read = false
                val.modify = false
                val.write = false
            }

            return {...val}
        })
    }, [principal, machineryUID])

    // FETCH AVAILABLE SENSORS
    const fetchMachinerySensors = useCallback(async (machinery, machineryUID) => {
        try {
            return await machineryService.getMachinerySensors(machineryUID || '');
        } catch (e) {
            console.error(e)
            axiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                'Could not load machinery sensors'
            )
        }

        return [];
    }, [toast])

    //LOAD DASHBOARD
    const loadDashboard = async (machineryUID, loadDashboard?: LoadDashboardAction) => {

        setDashboard((val) => {
            val.isLoading = true;

            return val;
        })

        try {
            let result: Dashboard;
            if (loadDashboard) {
                result = await dashboardService.loadDashboard(machineryUID, loadDashboard.name);

                if (loadDashboard.isTemplate) {
                    result.name = 'Unsaved new dashboard'
                    result.numUnsavedChanges++
                    result.lastSave = 0
                    result.isNew = false

                    for (const widget of result.widgets)
                        widget.sensorsMonitoring = {
                            requestType: 'first-time',
                            cacheDataRequestMaxTime: 0,
                            newDataRequestMinTime: 0,
                            widgetCategory: widget.sensorsMonitoring.widgetCategory,
                            dataRange: {
                                amount: 15,
                                unit: 'sample'
                            },
                            sensors: {
                                drive: [],
                                eqtq: [],
                                plc: []
                            },
                            aggregations: [{name: 'none', color: '#A0AEC0'}]
                        }

                } else
                    for (let widget of result.widgets)
                        try {
                            const sensorData = await loadSensorData(
                                widget.sensorsMonitoring,
                                'first-time',
                                0,
                                0,
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                machinery!,
                                widget
                            )
                            const chartProps = calculateChartProps(sensorData, widget.chartProps);

                            widget.sensorData = sensorData;
                            widget.chartProps = chartProps;

                            widget = {
                                ...widget,
                                ...processSensorsMonitoring(widget.sensorsMonitoring, machinerySensors)
                            }

                        } catch (e) {
                            console.error(e)
                            axiosExceptionHandler.handleAxiosExceptionWithToast(
                                e,
                                toast,
                                'Sensor data could not be loaded'
                            )
                        }


            } else
                result = await dashboardService.loadDefaultDashboard(machineryUID);

            result.numUnsavedChanges = 0
            result.lastSave = 0
            result.isNew = false

            result.widgets.forEach((widget) => ({
                    ...widget,
                    ...processSensorsMonitoring(widget.sensorsMonitoring, machinerySensors)
                }
            ))

            setChartTooltip((val) => {
                val.active = false

                return {...val}
            })

            setDashboard(result)
            setLayout(result.layout)

            if (loadDashboard?.isTemplate)
                toastHelper.makeToast(
                    toast,
                    'Dashboard template loaded',
                    'info'
                )
            else
                toastHelper.makeToast(
                    toast,
                    'Dashboard loaded',
                    'info'
                )
        } catch (e) {
            console.error(e)
            if (loadDashboard?.isTemplate)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboard template could not be loaded'
                )
            else if (loadDashboard)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Dashboard could not be loaded'
                )
            else {
                setDashboard(new Dashboard());

                return;
            }
        }

        setDashboard((val) => {
            val.isLoading = false;

            return val;
        })

    }

    // FETCH MACHINERY DETAILS - needed if request is done by url and not by UI
    useEffect(() => {

        if (!machineryUID) {
            navigate('/machineries');

            return
        }

        async function getMachinery() {

            setMachineryLoading(true)

            try {

                const machinery = location.state?.machinery ? location.state.machinery : null
                let sensorsResult;
                if (machinery) {
                    setMachinery(machinery)
                    setMachineryLoading(false)
                    sensorsResult = await fetchMachinerySensors(machinery, machineryUID);
                    setMachinerySensors(sensorsResult);
                } else {
                    const result = await machineryService.getMachineryByUID(machineryUID || '')
                    setMachinery(result);
                    const sensorsResults = await fetchMachinerySensors(result, machineryUID);
                    setMachinerySensors(sensorsResults);
                }

                if (location.state)
                    if (location.state.dashboardName)
                        loadDashboard(machineryUID, {
                            isTemplate: false,
                            machineryUID: machineryUID || '',
                            name: location.state.dashboardName
                        });
                    else
                        loadDashboard(machineryUID);

            } catch (e) {
                console.error(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    'Machinery not found'
                )
                navigate('/machineries')

                return
            }

            setMachineryLoading(false)
        }

        getMachinery()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, machineryUID, toast])

    // BREADCRUMB LINK NAVIGATION
    const breadcrumbNavigate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, to: string, isCurrent: boolean) => {
        e.preventDefault()
        e.stopPropagation()

        if (isCurrent) return

        if (to === '/machineries')
            navigate(to)
        else
            navigate(to, {
                state: machinery
            })
    }

    return {
        machineryUID,
        dashboardPermissions,
        setDashboardPermissions,
        documentsPermissions,
        setDocumentsPermissions,
        machinery,
        setMachinery,
        machinerySensors,
        setMachinerySensors,
        machineryLoading,
        setMachineryLoading,
        dashboard,
        setDashboard,
        layout,
        setLayout,
        chartTooltip,
        setChartTooltip,
        loadDashboard,
        breadcrumbNavigate
    }
}