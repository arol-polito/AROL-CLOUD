import {Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading, Spinner, VStack} from "@chakra-ui/react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import HeadingPanel from "../components/HeadingPanel";
import React, {useContext, useEffect, useState} from "react";
import DashboardPanel from "../../dashboard/components/DashboardPanel";
import Sensor from "../../dashboard/models/Sensor";
import machineryService from "../../../services/MachineryService";
import Dashboard from "../../dashboard/models/Dashboard";
import {Layout} from "react-grid-layout";
import DocumentsPanel from "../../documents/components/DocumentsPanel";
import LandingPanel from "../components/LandingPanel";
import Machinery from "../../../machineries-map/components/Machinery";
import PrincipalContext from "../../../utils/contexts/PrincipalContext";
import permissionChecker from "../../../utils/PermissionChecker";
import TooltipData from "../../dashboard/interfaces/TooltipData";
import LoadDashboardAction from "../interfaces/LoadDashboardAction";
import axiosExceptionHandler from "../../../utils/AxiosExceptionHandler";
import ToastContext from "../../../utils/contexts/ToastContext";

interface DashboardProps {
    type: string
}

export default function MachineryPage(props: DashboardProps) {

    const navigate = useNavigate()

    let params = useParams()
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
    const [dashboardToLoad, setDashboardToLoad] = useState<string | null>(null)

    const [machinerySensors, setMachinerySensors] = useState<Sensor[]>([])
    const [loadDashboard, setLoadDashboard] = useState<LoadDashboardAction>({
        doLoad: false,
        isTemplate: false,
        machineryUID: "",
        name: ""
    })

    const [dashboard, setDashboard] = useState<Dashboard>(new Dashboard())

    //In order to make sure that only 1 tooltip is displayed at a time
    const [chartTooltip, setChartTooltip] = useState<TooltipData>({
        active: false,
        label: "",
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

    //SET USER PERMISSIONS
    useEffect(()=>{

        if(!machineryUID) return

        setDashboardPermissions((val)=>{
            if(permissionChecker.hasMachineryPermission(principal, machineryUID, "dashboardsWrite")){
                val.read = true
                val.modify = true
                val.write = true
            }
            else if(permissionChecker.hasMachineryPermission(principal, machineryUID, "dashboardsModify")){
                val.read = true
                val.modify = true
                val.write = false
            }
            else if(permissionChecker.hasMachineryPermission(principal, machineryUID, "dashboardsRead")){
                val.read = true
                val.modify = false
                val.write = false
            }
            else{
                val.read = false
                val.modify = false
                val.write = false
            }

            return {...val}
        })

        setDocumentsPermissions((val)=>{
            if(permissionChecker.hasMachineryPermission(principal, machineryUID, "documentsWrite")){
                val.read = true
                val.modify = true
                val.write = true
            }
            else if(permissionChecker.hasMachineryPermission(principal, machineryUID, "documentsModify")){
                val.read = true
                val.modify = true
                val.write = false
            }
            else if(permissionChecker.hasMachineryPermission(principal, machineryUID, "documentsRead")){
                val.read = true
                val.modify = false
                val.write = false
            }
            else{
                val.read = false
                val.modify = false
                val.write = false
            }

            return {...val}
        })

    }, [principal, machineryUID])

    //FETCH MACHINERY DETAILS - needed if request is done by url and not by UI
    useEffect(() => {

        if (!machineryUID) {
            navigate("/machineries")
            return
        }

        if(location.state) {
            setDashboardToLoad(location.state.dashboardName ? location.state.dashboardName : null)

            const machinery = location.state.machinery ? location.state.machinery : null
            if (machinery) {
                setMachinery(machinery)
                setMachineryLoading(false)
                return
            }
        }
        else{
            setDashboardToLoad(null)
        }

        async function getMachinery() {

            setMachineryLoading(true)

            try {

                let result = await machineryService.getMachineryByUID(machineryUID!!)
                console.log(result)
                setMachinery(result)

            } catch (e) {
                console.log(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    "Machinery not found"
                )
                navigate("/machineries")
                return
            }

            setMachineryLoading(false)

        }

        getMachinery()

    }, [])

    //FETCH AVAILABLE SENSORS
    useEffect(() => {

        if (!machinery || !machineryUID) return

        async function getData() {
            try {
                let result = await machineryService.getMachinerySensors(machineryUID!!)
                setMachinerySensors(result)
            } catch (e) {
                console.log(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    "Could not load machinery sensors"
                )
            }

        }

        getData()

    }, [machinery])

    //BREADCRUMB LINK NAVIGATION
    function breadcrumbNavigate(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, to: string, isCurrent: boolean) {
        e.preventDefault()
        e.stopPropagation()

        if (isCurrent) return

        if (to === "/machineries") {
            navigate(to)
        } else {
            navigate(to, {
                state: machinery
            })
        }
    }

    return (
        <Box w={"full"}>
            <Breadcrumb mb={2}>
                <BreadcrumbItem>
                    <BreadcrumbLink onClick={(e) => breadcrumbNavigate(e, "/machineries", false)}>
                        Machineries
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbItem isCurrentPage={props.type === "landing"}>
                    <BreadcrumbLink
                        onClick={(e) => breadcrumbNavigate(e, "/machinery/" + machineryUID, props.type === "landing")}>
                        {machineryUID}
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {
                    props.type === "dashboard" &&
                    < BreadcrumbItem isCurrentPage={true}>
                        <BreadcrumbLink
                            onClick={(e) => breadcrumbNavigate(e, "/machinery/" + machineryUID + "/dashboard", true)}>
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                }
                {
                    props.type === "documents" &&
                    <BreadcrumbItem isCurrentPage={true}>
                        <BreadcrumbLink
                            onClick={(e) => breadcrumbNavigate(e, "/machinery/" + machineryUID + "/documents", true)}>
                            Documents
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                }
            </Breadcrumb>

            {
                !machineryLoading &&
                machinery &&
                machineryUID &&
                <>
                    <Heading mb={6}>Machinery {machineryUID}</Heading>
                    <HeadingPanel
                        type={props.type}
                        machinery={machinery}
                        dashboard={dashboard}
                        setDashboard={setDashboard}
                        setLoadDashboard={setLoadDashboard}
                        dashboardPermissions={dashboardPermissions}
                        documentsPermissions={documentsPermissions}
                        setChartTooltip={setChartTooltip}
                    />
                    {
                        props.type === "landing" &&
                        <LandingPanel
                            machinery={machinery}
                        />
                    }
                    {
                        props.type === "dashboard" &&
                        <DashboardPanel
                            machinery={machinery}
                            dashboard={dashboard}
                            setDashboard={setDashboard}
                            availableSensors={machinerySensors}
                            dashboardToLoadByDefault={dashboardToLoad}
                            setDashboardToLoadByDefault={setDashboardToLoad}
                            loadDashboard={loadDashboard}
                            setLoadDashboard={setLoadDashboard}
                            dashboardPermissions={dashboardPermissions}
                            chartTooltip={chartTooltip}
                            setChartTooltip={setChartTooltip}
                        />
                    }
                    {
                        props.type === "documents" &&
                        <DocumentsPanel
                            machinery={machinery}
                            documentsPermissions={documentsPermissions}
                        />
                    }
                </>
            }
            {
                machineryLoading &&
                <VStack
                    w={"full"}
                    h={"700px"}
                    justifyContent={"center"}
                    alignItems={"center"}
                >
                    <Spinner size={"xl"}/>
                </VStack>
            }
        </Box>
    )
}