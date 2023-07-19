import {
    Box,
    HStack,
    IconButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    Spinner,
    Text,
    VStack
} from "@chakra-ui/react";
import Sensor from "../../models/Sensor";
import {FiList, FiLock, FiMoreVertical, FiPlus, FiRefreshCw, FiSettings, FiTrash2, FiUnlock} from "react-icons/fi";
import React, {Fragment, memo, useContext, useEffect, useMemo, useRef, useState} from "react";
import SensorsModal from "../modals/SensorsModal";
import machineryService from "../../../../services/MachineryService";
import Machinery from "../../../../machineries-map/components/Machinery";
import WidgetSettingsModal from "../modals/WidgetSettingsModal";
import {Layout} from "react-grid-layout";
import SensorDataFilters from "../../interfaces/SensorDataFilters";
import GridWidget from "../../interfaces/GridWidget";
import TooltipData from "../../interfaces/TooltipData";
import HistoryModal from "../modals/HistoryModal";
import SlidingSensorData from "../../interfaces/SlidingSensorData";
import DashboardSize from "../../interfaces/DashboardSize";
import ToastContext from "../../../../utils/contexts/ToastContext";
import WidgetInfoPopover from "./WidgetInfoPopover";
import SensorMonitoring from "../../interfaces/SensorMonitoring";
import Aggregation from "../../interfaces/Aggregation";
import helperFunctions from "../../../../utils/HelperFunctions";
import SingleValueDataDisplay from "../data-visualization/SingleValueDataDisplay";
import MultiValueDataDisplay from "../data-visualization/MultiValueDataDisplay";
import SensorDataFilter from "../../interfaces/SensorDataFilter";
import SensorDataRange from "../../interfaces/SensorDataRange";
import axiosExceptionHandler from "../../../../utils/AxiosExceptionHandler";
import toastHelper from "../../../../utils/ToastHelper";
import WidgetControlPanel from "./WidgetControlPanel";

interface DashboardWidgetProps {
    widget: GridWidget
    machinery: Machinery
    dashboardSize: DashboardSize
    layout: Layout
    availableSensors: Sensor[]
    sensorsMonitoring: SensorDataFilters
    handleWidgetModified: Function
    chartTooltipActive: boolean
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
    dashboardPermissions: { read: boolean, modify: boolean, write: boolean }
}

function Widget(props: DashboardWidgetProps) {

    const toast = useContext(ToastContext)

    const ref = useRef<any>()

    const [sensorsMonitoring, setSensorsMonitoring] = useState<SensorDataFilters>(props.sensorsMonitoring)
    const [sensorsMonitoringArray, setSensorsMonitoringArray] = useState<SensorMonitoring[]>([])
    const [sensorsMonitoringObject, setSensorsMonitoringObject] = useState<{ [key: string]: SensorMonitoring }>({})
    const [aggregationsArray, setAggregationsArray] = useState<Aggregation[]>([])

    const [availableSensorsMap, setAvailableSensorsMap] = useState<Map<string, Sensor[]>>(new Map())

    const [sensorData, setSensorData] = useState<SlidingSensorData>({
        leftData: [],
        displayData: [],
        rightData: [],
        minDisplayTime: 0,
        numSensorData: 0,
        endOfData: false,
        hasNewData: false,
        numSamplesDisplaying: 0
    })
    const [sensorsDataLoading, setSensorsDataLoading] = useState(false)
    const [sensorDataError, setSensorDataError] = useState(false)
    const [loadingMoreSensorData, setLoadingMoreSensorData] = useState(false)

    const [sensorsModalOpen, setSensorsModalOpen] = useState(false)
    const [settingsModalOpen, setSettingsModalOpen] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)

    const [dataDisplaySize, setDataDisplaySize] = useState<{ height: number, width: number }>({
        height: 0,
        width: 0
    })

    const [widgetStatic, setWidgetStatic] = useState(props.widget.static)

    let lastValueTimestamp = 0

    //LOAD SENSOR DATA
    useEffect(() => {

        if (numSensorsMonitoring === 0) return

        async function getData() {

            if (sensorsMonitoring.requestType === "first-time") {
                setSensorsDataLoading(true)
            }

            setSensorDataError(false)

            try {

                let result = await machineryService.getMachinerySensorsData(props.machinery.uid, sensorsMonitoring)

                if (sensorsMonitoring.requestType === "first-time" && result.displaySensorData.length > 0) {
                    let sensorsMonitoringForCachedData = {...sensorsMonitoring}
                    sensorsMonitoringForCachedData.requestType = "cache-only"
                    sensorsMonitoringForCachedData.cacheDataRequestMaxTime = result.displaySensorData[0].time
                    let cachedData = await machineryService.getMachinerySensorsData(props.machinery.uid, sensorsMonitoringForCachedData)

                    result.cachedSensorData = cachedData.cachedSensorData
                    result.endOfData = cachedData.endOfData
                }

                //Avoid any update to parent (the dashboard object) if sensorsMonitoring did not change
                if (JSON.stringify(sensorsMonitoring) !== JSON.stringify(props.sensorsMonitoring)) {
                    props.handleWidgetModified("set-sensors-monitoring", {
                        id: props.widget.id,
                        sensorsMonitoring: sensorsMonitoring
                    })
                }

                setSensorData((val) => {
                    val.endOfData = result.endOfData
                    switch (result.requestType) {
                        case "first-time": {
                            val.displayData = result.displaySensorData
                            val.leftData = result.cachedSensorData
                            val.rightData = []
                            val.numSensorData = result.numSensorData
                            val.minDisplayTime = result.minDisplayTime
                            val.numSamplesDisplaying = val.displayData.filter((el) => (!el.machineryOff)).length
                            val.hasNewData = false
                            break

                            if(result.displaySensorData.length){
                                lastValueTimestamp = result.displaySensorData.slice(-1)[0].time
                            }
                        }
                        case "cache-only": {
                            val.leftData = [...result.cachedSensorData, ...val.leftData]
                            break
                        }
                        case "new-only": {
                            console.log("new data receive")
                            if (props.widget.category === "single-value") {
                                if (result.newSensorData.length > 0) {
                                    val.leftData = [...val.leftData, ...val.displayData, ...result.cachedSensorData]
                                    val.displayData = result.newSensorData
                                }
                            } else {
                                if (val.rightData.length === 0) {
                                    val.numSamplesDisplaying -= val.displayData.slice(0, result.newSensorData.length).filter((el) => (!el.machineryOff)).length
                                    val.numSamplesDisplaying += result.newSensorData.filter((el) => (!el.machineryOff)).length

                                    val.leftData = [...val.leftData, ...val.displayData.slice(0, result.newSensorData.length)]
                                    val.displayData = [...val.displayData.slice(result.newSensorData.length), ...result.newSensorData]
                                } else {
                                    val.rightData = [...result.newSensorData.reverse(), ...val.rightData]
                                    if (result.newSensorData.length > 0) {
                                        val.hasNewData = true
                                    }
                                }

                            }

                            break
                        }
                        default: {
                            console.error("Unknown sensor data request type")
                            break
                        }
                    }

                    return {...val}
                })

            } catch (e) {
                console.log(e)
                axiosExceptionHandler.handleAxiosExceptionWithToast(
                    e,
                    toast,
                    "Sensor data could not be loaded"
                )
                setSensorDataError(true)
            }

            setSensorsDataLoading(false)
        }

        getData()

        const interval = setInterval(() => {
            setSensorsMonitoring((val)=>{
                val.requestType = "new-only"
                // let lastValueTimestamp = 0
                // if(sensorData.rightData.length>0){
                //     lastValueTimestamp = sensorData.rightData[0].maxTime
                // }
                // else if(sensorData.displayData.length>0){
                //     lastValueTimestamp = sensorData.displayData.slice(-1)[0].maxTime
                // }
                // else if(sensorData.leftData.length>0){
                //     lastValueTimestamp = sensorData.leftData.slice(-1)[0].maxTime
                // }
                // else{
                //     return val
                // }

                val.newDataRequestMinTime = lastValueTimestamp

                console.log("new data request")

                return {...val}
            })
        }, helperFunctions.randomIntFromInterval(20000, 40000));

        return () => {
            clearInterval(interval);
        };

    }, [sensorsMonitoring])

    //DATA DISPLAY ZONE HEIGHT & WIDTH in px
    useEffect(() => {
        const rowHeight = props.dashboardSize.rowHeight
        const gridMargin = 5

        setDataDisplaySize({
            //74 = 18 bottom text height + 32 widget heading + 16 top&bottom padd
            height: Math.round(props.layout.h * rowHeight + (props.layout.h - 1) * gridMargin - 66),
            //16 = 16 left&right padd
            width: Math.floor(rowHeight * props.layout.w + (props.layout.w - 1) * gridMargin - 16)
        })
    }, [props.dashboardSize.rowHeight, props.dashboardSize.width, props.dashboardSize.numCols, props.layout.h, props.layout.w])

    //AVAILABLE SENSORS MAP - for use in Sensors Modal
    useEffect(() => {
        let map: Map<string, Sensor[]> = new Map()
        props.availableSensors.forEach((el) => {
            if (map.has(el.category)) {
                map.get(el.category)!!.push(el)
            } else {
                map.set(el.category, [el])
            }
        })
        setAvailableSensorsMap(map)
    }, [props.availableSensors])

    //LOAD MORE SENSOR DATA
    useEffect(() => {

        if (!loadingMoreSensorData) return

        setSensorsMonitoring((val) => {
            val.requestType = "cache-only"
            if (sensorData.leftData.length > 0) {
                val.cacheDataRequestMaxTime = sensorData.leftData[0].time
            } else if (sensorData.displayData.length > 0) {
                val.cacheDataRequestMaxTime = sensorData.displayData[0].time
            } else {
                return val
            }

            return {...val}
        })

    }, [loadingMoreSensorData])

    //CONVERT sensors monitoring & aggregation from map to array for showing them on chart
    useEffect(() => {

        let arrayOfSensorsMonitoring: SensorMonitoring[] = []
        let objectOfSensorsMonitoring: { [key: string]: SensorMonitoring } = {}

        for (const [, value] of Object.entries(sensorsMonitoring.sensors)) {
            value.forEach((entry) => {
                entry.sensorNames.forEach((sensorName) => {
                    if (entry.headNumber === 0) {
                        let sensorFound = props.availableSensors.find((el) => (el.internalName === sensorName.name))
                        if (sensorFound) {
                            let sensorMonitoring = {
                                name: sensorFound.name,
                                internalName: sensorFound.internalName,
                                unit: sensorFound.unit,
                                color: sensorName.color
                            }
                            arrayOfSensorsMonitoring.push(sensorMonitoring)
                            objectOfSensorsMonitoring[sensorFound.internalName] = sensorMonitoring
                        }
                    } else {
                        let sensorFound = props.availableSensors.find((el) => (el.internalName === sensorName.name))
                        if (sensorFound) {
                            let sensorInternalName = "H" + String(entry.headNumber).padStart(2, "0") + "_" + sensorName.name
                            let sensorMonitoring = {
                                name: sensorFound.name + " - Head " + entry.headNumber,
                                internalName: sensorInternalName,
                                unit: sensorFound.unit,
                                color: sensorName.color
                            }
                            arrayOfSensorsMonitoring.push(sensorMonitoring)
                            objectOfSensorsMonitoring[sensorInternalName] = sensorMonitoring
                        }
                    }
                })
            })
        }

        let arrayOfAggregations: Aggregation[] = []
        sensorsMonitoring.aggregations.forEach((aggregation) => {
            if (aggregation.name !== "none" && arrayOfSensorsMonitoring.length>0) {
                arrayOfAggregations.push({
                    ...aggregation,
                    unit: arrayOfSensorsMonitoring[0].unit ,
                    internalName: aggregation.name
                })
            }
        })

        if (!helperFunctions.areArraysEqual(arrayOfSensorsMonitoring, sensorsMonitoringArray)) {
            setSensorsMonitoringArray(arrayOfSensorsMonitoring)
            setSensorsMonitoringObject(objectOfSensorsMonitoring)
        }

        if (!helperFunctions.areArraysEqual(arrayOfAggregations, aggregationsArray)) {
            setAggregationsArray(arrayOfAggregations)
        }
    }, [sensorsMonitoring, props.availableSensors])

    //OPEN SENSORS MODAL
    function handleOpenSensorsModalButton(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault()
        e.stopPropagation()
        setSensorsModalOpen(true)
    }

    //NUMBER OF SENSORS MONITORING IN THIS WIDGET
    const numSensorsMonitoring = useMemo(
        () => {
            let numSensors = 0
            for (const value of Object.values(sensorsMonitoring.sensors)) {
                for(const headEntry of value){
                    numSensors += headEntry.sensorNames.length
                }
            }
            return numSensors
        },
        [sensorsMonitoring]
    )

    //NUMBER OF AGGREGATIONS MONITORING IN THIS WIDGET
    const numAggregationsMonitoring = useMemo(
        () => {
            return sensorsMonitoring.aggregations.filter((el) => (el.name !== "none")).length
        },
        [sensorsMonitoring]
    )

    //WIDGET DESCRIPTOR TEXT - placed at the bottom
    const widgetBottomText = useMemo(
        () => {
            let text = ""
            if (props.widget.maxSensors > 1) {
                text = numSensorsMonitoring + " sensors monitoring | "
            }
            if (numAggregationsMonitoring) {
                text += "Aggregated | "
            } else {
                text += "No aggregations | "
            }

            if (widgetStatic) {
                text += "Locked"
            } else {
                text += "Unlocked"
            }

            return text
        },
        [widgetStatic, numSensorsMonitoring, numAggregationsMonitoring, props.widget.maxSensors]
    )

    function handleWidgetMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        if (!props.dashboardPermissions.modify || widgetStatic) {
            e.stopPropagation()
        }

        if (props.chartTooltipActive) {
            props.setChartTooltip((val) => {
                val.active = false
                return val
            })
        }
    }

    return (
        <Fragment>
            <VStack
                boxShadow={'xl'}
                rounded={'md'}
                bgColor={"white"}
                w={"full"}
                h={"full"}
                overflow={"none"}
                onMouseDown={handleWidgetMouseDown}
                ref={ref}
            >
                <WidgetControlPanel
                    widgetStatic={widgetStatic}
                    setWidgetStatic={setWidgetStatic}
                    numSensorsMonitoring={numSensorsMonitoring}
                    sensorDataError={sensorDataError}
                    setHistoryModalOpen={setHistoryModalOpen}
                    setSensorsModalOpen={setSensorsModalOpen}
                    setSettingsModalOpen={setSettingsModalOpen}
                    widgetID={props.widget.id}
                    widgetName={props.widget.name}
                    widgetMaxSensors={props.widget.maxSensors}
                    availableSensors={props.availableSensors}
                    sensorsMonitoringSensors={sensorsMonitoring.sensors}
                    sensorsMonitoringAggregations={sensorsMonitoring.aggregations}
                    sensorsMonitoringDataRange={sensorsMonitoring.dataRange}
                    setSensorsMonitoring={setSensorsMonitoring}
                    chartTooltipActive={props.chartTooltipActive}
                    setChartTooltip={props.setChartTooltip}
                    handleWidgetModified={props.handleWidgetModified}
                    dashboardPermissionsModify={props.dashboardPermissions.modify}
                />
                {
                    !sensorsDataLoading &&
                    numSensorsMonitoring === 0 &&
                    <VStack
                        w={"full"}
                        h={dataDisplaySize.height}
                        justifyContent={"center"}
                        alignContent={"center"}
                    >
                        <Box
                            p={3}
                            _hover={{
                                cursor: "pointer"
                            }}
                            onClick={handleOpenSensorsModalButton}
                            onMouseDown={(e) => (e.stopPropagation())}
                        >
                            <Text textAlign={"center"} fontSize={50} color={"gray.500"}>+</Text>
                            <Text textAlign={"center"} fontSize={"sm"} color={"gray.500"} mt={"-3!important"}>Choose
                                sensors</Text>
                        </Box>
                    </VStack>
                }
                {
                    !sensorsDataLoading &&
                    numSensorsMonitoring > 0 &&
                    <>
                        <VStack
                            w={"full"}
                            justifyContent={"center"}
                            alignContent={"center"}
                        >
                            {
                                sensorData.displayData.length &&
                                sensorsMonitoringArray.length &&
                                <Box
                                    w={"full"}
                                    h={dataDisplaySize.height}
                                    maxH={dataDisplaySize.height}
                                >
                                    {
                                        props.widget.category === "single-value" &&
                                        <SingleValueDataDisplay
                                            widget={props.widget}
                                            sensorMonitoring={sensorsMonitoringArray[0]}
                                            sensorData={sensorData}
                                            dataDisplaySize={dataDisplaySize}
                                        />
                                    }
                                    {
                                        props.widget.category === "multi-value" &&
                                        <MultiValueDataDisplay
                                            widget={props.widget}
                                            displayType={"dashboard"}
                                            availableSensors={props.availableSensors}
                                            sensorsMonitoringArray={sensorsMonitoringArray}
                                            sensorsMonitoringObject={sensorsMonitoringObject}
                                            aggregationsArray={aggregationsArray}
                                            sensorData={sensorData}
                                            setSensorData={setSensorData}
                                            loadingMoreSensorData={loadingMoreSensorData}
                                            setLoadingMoreSensorData={setLoadingMoreSensorData}
                                            chartTooltipActive={props.chartTooltipActive}
                                            setChartTooltip={props.setChartTooltip}
                                            dataDisplaySize={dataDisplaySize}
                                        />
                                    }
                                </Box>
                            }
                            {
                                !sensorDataError &&
                                sensorData.numSensorData === 0 &&
                                <VStack
                                    w={"full"}
                                    h={dataDisplaySize.height}
                                    justifyContent={"center"}
                                    alignContent={"center"}
                                >
                                    <Text textAlign={"center"} fontSize={"sm"} color={"gray.500"}>No data from
                                        sensors</Text>
                                </VStack>
                            }
                            {
                                sensorDataError &&
                                <VStack
                                    w={"full"}
                                    h={dataDisplaySize.height}
                                    justifyContent={"center"}
                                    alignContent={"center"}
                                >
                                    <Text textAlign={"center"} fontSize={"sm"} color={"gray.500"}>Failed to load
                                        sensor data. Please try again.</Text>
                                </VStack>
                            }
                        </VStack>
                        <HStack
                            h={"auto"}
                            w={"full"}
                            justifyContent={"center"}
                            textOverflow={"ellipsis"}
                            whiteSpace={"nowrap"}
                        >
                            <Text
                                mt={"-12px"}
                                fontSize={"xs"}
                                color={"gray.400"}
                                _hover={{
                                    cursor: "default"
                                }}
                                // onMouseDown={(e)=>(e.stopPropagation())}
                            >
                                {widgetBottomText}
                            </Text>
                        </HStack>
                    </>
                }
                {
                    sensorsDataLoading &&
                    <VStack
                        w={"full"}
                        h={(180 - 50) + ((props.layout.h - 1) * 180) + "px"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        //Stop click from propagating down to dashboard
                        onMouseDown={(e) => (e.stopPropagation())}
                    >
                        <Spinner size={"xl"}/>
                    </VStack>
                }
            </VStack>
            {
                sensorsModalOpen &&
                <SensorsModal
                    modalOpen={sensorsModalOpen}
                    setModalOpen={setSensorsModalOpen}
                    availableSensors={availableSensorsMap}
                    sensorsMonitoring={sensorsMonitoring}
                    setSensorsMonitoring={setSensorsMonitoring}
                    numHeads={props.machinery.numHeads}
                    maxSelectableSensors={props.widget.maxSensors}
                />
            }
            {
                settingsModalOpen &&
                <WidgetSettingsModal
                    settingsModalOpen={settingsModalOpen}
                    setSettingsModalOpen={setSettingsModalOpen}
                    sensorsMonitoring={sensorsMonitoring}
                    setSensorsMonitoring={setSensorsMonitoring}
                    availableSensors={props.availableSensors}
                    maxSelectableSensors={props.widget.maxSensors}
                />
            }
            {
                historyModalOpen &&
                <HistoryModal
                    historyModalOpen={historyModalOpen}
                    setHistoryModalOpen={setHistoryModalOpen}
                    sensorData={sensorData}
                    sensorsMonitoring={sensorsMonitoring}
                    setSensorsMonitoring={setSensorsMonitoring}
                    availableSensors={props.availableSensors}
                />
            }
        </Fragment>
    )

}

export default memo(Widget)