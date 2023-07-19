import React, {useEffect, useMemo, useRef, useState} from "react";
import SensorData from "../../../models/SensorData";
import {Box, CloseButton, Divider, Heading, HStack, Text, VStack} from "@chakra-ui/react";
import SensorMonitoring from "../../../interfaces/SensorMonitoring";
import Aggregation from "../../../interfaces/Aggregation";
import dayjs from "dayjs";
import TooltipData from "../../../interfaces/TooltipData";
import {FiArrowDown, FiArrowUp} from "react-icons/fi";

interface ChartTooltipProps {
    chartTooltipData: TooltipData
    setChartTooltipData: React.Dispatch<React.SetStateAction<TooltipData>>
}

export default function ChartTooltip(props: ChartTooltipProps) {

    const [tooltipPosition, setTooltipPosition] = useState<number[]>([])

    const tooltipRef = useRef<HTMLDivElement>(null)

    //WINDOW RESIZE LISTENER - to KEEP TOOLTIP POSITION UPDATED
    useEffect(() => {

        if (!tooltipRef || !tooltipRef.current) return

        tooltipRef!!.current!!.addEventListener("resize", updateTooltipPosition);
        if (tooltipRef) {
            updateTooltipPosition()
        }
        return () => {
            if (!tooltipRef || !tooltipRef.current) return

            tooltipRef!!.current!!.removeEventListener("resize", updateTooltipPosition);
        };

    }, [tooltipRef])

    //TRIGGER TOOLTIP REPOSITIONING
    useEffect(() => {
        updateTooltipPosition()
    }, [props.chartTooltipData.chartCoordinate, props.chartTooltipData.clickCoordinate, window.innerHeight, window.innerWidth])

    //CALCULATE POSITION (absolute) OF TOOLTIP
    function updateTooltipPosition() {

        if (!tooltipRef || !tooltipRef.current) return

        let ref = tooltipRef!!.current!!

        let finalTooltipX, finalTooltipY

        const tooltipWidth = ref.offsetWidth
        const tooltipHeight = ref.offsetHeight

        if (tooltipWidth === 0 || tooltipHeight === 0) return

        const chartX = props.chartTooltipData.chartCoordinate[0]
        const chartY = props.chartTooltipData.chartCoordinate[1]

        const tooltipX = props.chartTooltipData.clickCoordinate[0]
        const tooltipY = props.chartTooltipData.clickCoordinate[1]

        const windowWidth = window.innerWidth + window.scrollX
        const windowHeight = window.innerHeight + window.scrollY

        finalTooltipX = chartX + tooltipX + tooltipWidth
        if (finalTooltipX > windowWidth) {
            finalTooltipX = windowWidth - tooltipWidth - 12
        } else {
            finalTooltipX -= tooltipWidth
            // finalTooltipX += window.scrollX
        }

        finalTooltipY = chartY + tooltipY + tooltipHeight
        if (finalTooltipY > windowHeight) {
            finalTooltipY = windowHeight - tooltipHeight - 12
        } else {
            finalTooltipY -= tooltipHeight
            // finalTooltipY += window.scrollY
        }

        setTooltipPosition([~~finalTooltipX, ~~finalTooltipY])
    }

    //Use this instead of state in order to not add a useEffect call (creates lag in value calculation and display)
    const sensorsToDisplayValue = useMemo(
        () => getSensorsToDisplayValue(),
        [props.chartTooltipData.sensorData]
    )

    //CALCULATE WHAT TO SHOW IN TOOLTIP
    function getSensorsToDisplayValue() {

        let payload = props.chartTooltipData.sensorData[0].payload as SensorData
        let sensorsMonitoringObject = props.chartTooltipData.sensorsMonitoringObject

        if (Object.keys(payload.aggregationData).length === 0) {
            return Object.entries(payload.activeData).map(([sensorInternalName, sensorValue]) => {

                let diff = ""
                if(props.chartTooltipData.sensorDataIndex>0 && sensorValue!==null){
                    let prevIndex = props.chartTooltipData.sensorDataIndex-1
                    if(props.chartTooltipData.displayData[prevIndex].allData.hasOwnProperty(sensorInternalName) &&
                        props.chartTooltipData.displayData[prevIndex].allData[sensorInternalName]!==null
                    ){
                        diff = (sensorValue - props.chartTooltipData.displayData[prevIndex].allData[sensorInternalName]!!).toFixed(2)
                    }
                }
                else if(props.chartTooltipData.leftData.length>0 && sensorValue!==null){
                    let prevSensorData = props.chartTooltipData.leftData.slice(-1)
                    if(
                        prevSensorData.length>0 &&
                        prevSensorData[0].allData.hasOwnProperty(sensorInternalName) &&
                        prevSensorData[0].allData[sensorInternalName]!==null
                    ){
                        diff = (sensorValue - prevSensorData[0].allData[sensorInternalName]!!).toFixed(2)
                    }
                }

                let sensorMonitoringEntry = sensorsMonitoringObject[sensorInternalName]

                if (sensorMonitoringEntry) {
                    return {
                        color: sensorMonitoringEntry.color,
                        name: sensorMonitoringEntry.name,
                        value: sensorValue,
                        unit: sensorMonitoringEntry.unit,
                        diff: diff
                    }
                }

                return {
                    color: "",
                    name: "",
                    value: "N/A",
                    unit: "",
                    diff: ""
                }
            }).sort((a,b)=> {
                if(a.value==="N/A" && b.value==="N/A") return 0
                if(a.value==="N/A") return 1
                if(b.value==="N/A") return -1
                return Number(b.value)-Number(a.value)
            })
        } else {
            return Object.entries(payload.aggregationData).map(([aggregationName, aggregationValue]) => {

                let aggregationEntry = props.chartTooltipData.aggregationsArray.find((el: Aggregation) => (el.name === aggregationName))
                let sensorEntry = props.chartTooltipData.sensorsMonitoringArray.find((el: SensorMonitoring) => (aggregationValue.note.endsWith(el.internalName)))

                let diff=""
                if(props.chartTooltipData.sensorDataIndex>0){
                    let prevIndex = props.chartTooltipData.sensorDataIndex-1
                    if(props.chartTooltipData.displayData[prevIndex].aggregationData.hasOwnProperty(aggregationName)){
                        diff = (aggregationValue.value - props.chartTooltipData.displayData[prevIndex].aggregationData[aggregationName].value).toFixed(2)
                    }
                }
                else if(props.chartTooltipData.leftData.length>0){
                    let prevSensorData = props.chartTooltipData.leftData.slice(-1)
                    if(
                        prevSensorData.length>0 &&
                        prevSensorData[0].aggregationData.hasOwnProperty(aggregationName)
                    ){
                        diff = (aggregationValue.value - prevSensorData[0].aggregationData[aggregationName].value).toFixed(2)
                    }
                }

                if (aggregationEntry) {
                    return {
                        color: aggregationEntry.color,
                        name: aggregationEntry.name,
                        note: sensorEntry ? sensorEntry.name : aggregationValue.note,
                        value: aggregationValue.value,
                        unit: aggregationEntry.unit,
                        diff: diff
                    }
                }

                return {
                    color: "",
                    name: "",
                    value: "N/A",
                    unit: "",
                    diff: ""
                }

            }).sort((a,b)=> {
                if(a.value==="N/A" && b.value==="N/A") return 0
                if(a.value==="N/A") return 1
                if(b.value==="N/A") return -1
                return Number(b.value)-Number(a.value)
            })
        }
    }

    //CALCULATE TIME THE MACHINERY WAS OFF - if it was off at this time
    function getHoursMachineryOff() {
        const from = props.chartTooltipData.sensorData[0].payload.machineryOffFrom
        const to = props.chartTooltipData.sensorData[0].payload.machineryOffTo
        const diff = ~~((to - from) / 3600000)

        if(diff<24){
            return diff + " hours"
        }
        return ~~(diff/24)+ " days"
    }

    //FORMAT DIFF
    function getDiff(diff: string){
        if(!diff) return ""

        if(diff==="0.0" || diff==="-0.0"){
            return <Text fontWeight={400} fontSize={"sm"} pl={2}>No change</Text>
        }
        else if(parseFloat(diff)<0){
            return <>
                <Text fontWeight={400} fontSize={"sm"} pl={2}>{diff}</Text>
                <FiArrowDown />
            </>
        }
        else{
            return <>
                <Text fontWeight={400} fontSize={"sm"} pl={2}>+{diff}</Text>
                <FiArrowUp />
            </>
        }

    }

    //STOP SHOWING TOOLTIP
    function handleCloseTooltip() {
        props.setChartTooltipData((val) => {
            val.active = false
            return {...val}
        })
    }

    return (

        <Box
            ref={tooltipRef}
            zIndex={1500}
            position={"absolute"}
            visibility={tooltipPosition.length === 0 ? "hidden" : "visible"}
            top={0}
            left={0}
            transform={"translate(" + tooltipPosition[0] + "px, " + tooltipPosition[1] + "px)"}
            onMouseDown={(e)=>(e.stopPropagation())}
        >
            <VStack
                w={"fit-content"}
                boxShadow={'xl'}
                rounded={'xl'}
                bg={"white"}
                borderWidth={1}
                borderColor={"gray.400"}
                p={2}
                alignItems={"left"}
            >
                {
                    !props.chartTooltipData.sensorData[0].payload.machineryOff &&
                    <>
                        <HStack
                            w={"full"}
                            justifyContent={"space-between"}
                        >
                            <Heading size={"sm"} whiteSpace={"nowrap"} w={"full"} textAlign={"center"}>{props.chartTooltipData.label}</Heading>
                            <CloseButton size={"md"} onClick={handleCloseTooltip}/>
                        </HStack>
                        <Divider orientation={"horizontal"}/>
                        <VStack
                            maxH={"300px"}
                            overflowY={"auto"}
                            alignItems={"left"}
                        >
                            {
                                sensorsToDisplayValue.map((sensorData: any, index: number) => (
                                        <HStack key={index} justifyContent={"space-between"}>
                                            <HStack>
                                                <Box boxSize={6}
                                                     bgColor={sensorData.color}
                                                     borderRadius={"md"}/>
                                                <HStack alignItems={"baseline"}>
                                                    <Text>{sensorData.name}</Text>
                                                    {
                                                        sensorData.hasOwnProperty("note") &&
                                                        <Text fontSize={"xs"}
                                                              color={"gray.400"}
                                                        >
                                                            {sensorData.note}
                                                        </Text>
                                                    }
                                                </HStack>

                                            </HStack>
                                            <HStack
                                                alignItems={"space-between"}
                                                >
                                                <Text fontWeight={600}
                                                      pl={2}>{sensorData.value} {sensorData.unit}</Text>
                                                <HStack
                                                    w={"90px"}
                                                    justifyContent={"right"}
                                                >
                                                    {getDiff(sensorData.diff)}
                                                </HStack>
                                            </HStack>
                                        </HStack>
                                    )
                                )
                            }
                        </VStack>
                    </>
                }
                {
                    props.chartTooltipData.sensorData[0].payload.machineryOff &&
                    <HStack
                        alignItems={"flex-start"}
                    >
                        <VStack
                            alignItems={"justifyContent"}
                        >
                            <Text fontSize={"md"} fontWeight={600}>Machinery OFF for {getHoursMachineryOff()}</Text>
                            <Text fontSize={"sm"} mt={"0!important"}
                                  fontWeight={400}>From {dayjs(props.chartTooltipData.sensorData[0].payload.machineryOffFrom).format("D MMM YYYY HH:mm")}</Text>
                            <Text fontSize={"sm"} mt={"0!important"}
                                  fontWeight={400}>To {dayjs(props.chartTooltipData.sensorData[0].payload.machineryOffTo).format("D MMM YYYY HH:mm")}</Text>
                        </VStack>
                        <CloseButton size={"md"} onClick={handleCloseTooltip}/>
                    </HStack>
                }
            </VStack>
        </Box>

    )

}
