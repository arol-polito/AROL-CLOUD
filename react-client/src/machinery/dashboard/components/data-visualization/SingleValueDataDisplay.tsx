import GridWidget from "../../interfaces/GridWidget";
import SensorMonitoring from "../../interfaces/SensorMonitoring";
import SlidingSensorData from "../../interfaces/SlidingSensorData";
import React, {useEffect, useState, memo} from "react";
import {Divider, HStack, Text, VStack} from "@chakra-ui/react";
import {FiArrowDown, FiArrowUp} from "react-icons/fi";
import GaugeChart from "react-gauge-chart";
import Thermometer from 'react-thermometer-ecotropy'

interface SingleValueDataDisplayProps {
    widget: GridWidget
    sensorMonitoring: SensorMonitoring
    sensorData: SlidingSensorData
    dataDisplaySize: { height: number, width: number }
}

function SingleValueDataDisplay(props: SingleValueDataDisplayProps) {

    const [sensorDataToDisplay, setSensorDataToDisplay] = useState<{
        value: string
        maxValue: number
        valueDiff: string
        aggregateNote: string
        formattedTime: string
    } | undefined>(undefined)

    //HANDLE DATA TO DISPLAY
    useEffect(() => {

        const displayData = props.sensorData.displayData
        const leftData = props.sensorData.leftData
        const rightData = props.sensorData.rightData

        let newSensorData = {
            value: "",
            maxValue: 0,
            valueDiff: "",
            aggregateNote: "",
            formattedTime: ""
        }

        if (displayData.length > 0) {

            const displayDataEntry = displayData[0]

            //Display AGGREGATE
            if (Object.entries(displayDataEntry.aggregationData).length > 0 &&
                displayDataEntry.aggregationData.aggregation.value
            ) {
                //VALUE DIFF with previous aggregation
                let valueDiff = ""
                let filteredLeftData = leftData.filter((val) => {
                    if (Object.entries(val.aggregationData).length === 0 || !val.aggregationData.hasOwnProperty("aggregation")) return false
                    return val.aggregationData.aggregation.value
                })
                if (filteredLeftData.length > 0) {
                    let previousAggregation = leftData.slice(-1)[0]
                    if (previousAggregation.aggregationData.aggregation.value) {
                        valueDiff = (displayDataEntry.aggregationData.aggregation.value - previousAggregation.aggregationData.aggregation.value).toFixed(2)
                    }
                }

                newSensorData.aggregateNote = displayDataEntry.aggregationData.aggregation.note
                newSensorData.formattedTime = ""
                newSensorData.value = displayDataEntry.aggregationData.aggregation.value.toFixed(2)
                newSensorData.valueDiff = valueDiff
                newSensorData.maxValue = displayDataEntry.aggregationData.aggregation.value * 1.5

            }
            //Display MOST RECENT SAMPLE
            else {
                let objectKeys = Object.keys(displayDataEntry.allData)
                if (objectKeys.length > 0 && displayDataEntry.allData[objectKeys[0]] !== null) {

                    console.log(objectKeys)
                    console.log(displayDataEntry.allData)

                    //VALUE DIFF with previous sample
                    let valueDiff = ""
                    let filteredLeftData = leftData.filter((val) => {
                        if (Object.entries(val.aggregationData).length > 0) return false
                        const sampleKeys = Object.keys(val.allData)
                        if (sampleKeys.length === 0) return false
                        return val.allData[sampleKeys[0]]
                    })
                    if (filteredLeftData.length > 0) {
                        let previousSample = leftData.slice(-1)[0]
                        let previousSampleObjectKeys = Object.keys(previousSample.allData)
                        if (previousSampleObjectKeys.length > 0 && previousSample.allData[previousSampleObjectKeys[0]]) {
                            valueDiff = (displayDataEntry.allData[objectKeys[0]]!! - previousSample.allData[previousSampleObjectKeys[0]]!!).toFixed(2)
                        }
                    }

                    newSensorData.aggregateNote = ""
                    newSensorData.formattedTime = props.sensorData.displayData[0].formattedTime
                    newSensorData.value = displayDataEntry.allData[objectKeys[0]]!!.toFixed(2)
                    newSensorData.valueDiff = valueDiff
                    newSensorData.maxValue = displayDataEntry.allData[objectKeys[0]]!! * 1.5

                } else {
                    newSensorData.aggregateNote = ""
                    newSensorData.formattedTime = displayDataEntry.formattedTime
                    newSensorData.value = "N/A"
                    newSensorData.valueDiff = ""
                    newSensorData.maxValue = 100
                }
            }

        }
        //FALLBACK VALUES - if no entries in display data show last historical value
        else if (props.sensorData.leftData.length > 0) {

            const leftDataEntry = displayData.slice(-1)[0]

            if (Object.entries(leftDataEntry.aggregationData).length > 0 &&
                leftDataEntry.aggregationData.aggregation.value) {

                if (Object.entries(leftDataEntry.aggregationData).length > 0 &&
                    leftDataEntry.aggregationData.aggregation.value) {

                    newSensorData.aggregateNote = leftDataEntry.aggregationData.aggregation.note
                    newSensorData.formattedTime = ""
                    newSensorData.value = leftDataEntry.aggregationData.aggregation.value.toFixed(2)
                    newSensorData.valueDiff = ""
                    newSensorData.maxValue = leftDataEntry.aggregationData.aggregation.value * 1.5
                } else {
                    setSensorDataToDisplay(undefined)
                    return
                }

            }
            //FALLBACK VALUE - if no value in display data show last history data
            else {
                let objectKeys = Object.keys(leftDataEntry.allData)


                if (objectKeys.length > 0 && leftDataEntry.allData[objectKeys[0]]!==null) {

                    newSensorData.aggregateNote = ""
                    newSensorData.formattedTime = leftDataEntry.formattedTime
                    newSensorData.value = leftDataEntry.allData[objectKeys[0]]!!.toFixed(2)
                    newSensorData.valueDiff = ""
                    newSensorData.maxValue = leftDataEntry.allData[objectKeys[0]]!! * 1.5

                } else {
                    newSensorData.aggregateNote = ""
                    newSensorData.formattedTime = leftDataEntry.formattedTime
                    newSensorData.value = "N/A"
                    newSensorData.valueDiff = ""
                    newSensorData.maxValue = 100
                }
            }
        } else {
            setSensorDataToDisplay(undefined)
            return
        }

        setSensorDataToDisplay((val) => {

            if (!val) {
                return newSensorData
            }

            val.aggregateNote = newSensorData.aggregateNote
            val.formattedTime = newSensorData.formattedTime
            val.value = newSensorData.value
            val.valueDiff = newSensorData.valueDiff
            if (val.maxValue < parseFloat(newSensorData.value)) {
                val.maxValue = newSensorData.maxValue
            }

            return {...val}
        })

    }, [props.sensorData])

    //SENSOR DATA TIME OF SAMPLING
    function getSensorDataTimeOfSampling() {
        if (!sensorDataToDisplay) {
            return "Time of sampling: N/A"
        }

        if (!sensorDataToDisplay.aggregateNote) {
            if (sensorDataToDisplay.formattedTime) {
                return "Time of sampling: " + sensorDataToDisplay.formattedTime
            } else {
                return "Time of sampling: N/A"
            }
        }
        return sensorDataToDisplay.aggregateNote

    }

    console.log(sensorDataToDisplay?.value, props.sensorMonitoring.name)

    return (
        <VStack
            h={props.dataDisplaySize.height /*Account for top margin*/}
            maxH={props.dataDisplaySize.height}
            w={"full"}
            px={2}
            alignItems={"center"}
            overflowY={"auto"}
        >
            {
                sensorDataToDisplay &&
                <>
                    {
                        props.widget.type === "current-value" &&
                        <VStack>
                            <HStack
                                w={"full"}
                            >
                                <Text
                                    fontSize={48}>{sensorDataToDisplay.value!=="" ? sensorDataToDisplay.value : "N/A"}</Text>
                                <VStack
                                    alignItems={"left"}
                                >
                                    <Text fontSize={"sm"}>{props.sensorMonitoring.name}</Text>
                                    <Text fontSize={"lg"} fontWeight={500}
                                          mt={"0!important"}>{props.sensorMonitoring.unit}</Text>
                                </VStack>
                                {
                                    sensorDataToDisplay.valueDiff &&
                                    <>
                                        <Divider orientation={"vertical"} h={"55px"}/>
                                        <VStack>
                                            <Text fontSize={"sm"} fontWeight={300}
                                                  mb={"0!important"}>Difference</Text>
                                            <HStack
                                                alignItems={"center"}
                                                mt={"0!important"}
                                            >
                                                {
                                                    Number(sensorDataToDisplay.valueDiff) >= 0 &&
                                                    <FiArrowUp size={28}/>
                                                }
                                                {
                                                    Number(sensorDataToDisplay.valueDiff) < 0 &&
                                                    <FiArrowDown size={28}/>
                                                }
                                                <Text
                                                    h={"full"}
                                                    fontSize={24}
                                                >
                                                    {Number(sensorDataToDisplay.valueDiff) >= 0 ? "+" + sensorDataToDisplay.valueDiff : sensorDataToDisplay.valueDiff}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </>
                                }
                            </HStack>
                            <Text fontSize={"sm"} fontWeight={300} color={"gray.500"}
                                  mt={"0!important"}>{getSensorDataTimeOfSampling()}</Text>
                        </VStack>
                    }
                    {
                        props.widget.type === "thermostat" &&
                        <VStack
                            h={"full"}
                            w={"full"}
                        >
                            <HStack
                                w={"full"}
                                alignItems={"center"}
                                onMouseDown={(e) => (e.stopPropagation())}
                            >
                                <VStack
                                    flexGrow={1}
                                >
                                    <Thermometer
                                        theme="light"
                                        value={sensorDataToDisplay.value}
                                        max={sensorDataToDisplay.maxValue}
                                        tooltipValue={false}
                                        size="large"
                                        height={props.dataDisplaySize.height - 45}
                                    />
                                </VStack>
                                <VStack
                                    alignItems={"center"}
                                    flexGrow={1}
                                >
                                    <Text fontSize={"sm"} textAlign={"center"}>{props.sensorMonitoring.name}</Text>
                                    <Divider orientation={"horizontal"}/>
                                    <Text
                                        fontSize={40}>{sensorDataToDisplay ? sensorDataToDisplay.value : "N/A"}</Text>
                                    <Text fontSize={"md"} fontWeight={500}
                                          mt={"0!important"}>{props.sensorMonitoring.unit}</Text>
                                    {
                                        sensorDataToDisplay.valueDiff &&
                                        <>
                                            <Divider orientation={"horizontal"}/>
                                            <VStack>
                                                <Text fontSize={"sm"} fontWeight={300}
                                                      mb={"0!important"}>Difference</Text>
                                                <HStack
                                                    alignItems={"center"}
                                                    mt={"0!important"}
                                                >
                                                    {
                                                        Number(sensorDataToDisplay.valueDiff) >= 0 &&
                                                        <FiArrowUp size={28}/>
                                                    }
                                                    {
                                                        Number(sensorDataToDisplay.valueDiff) < 0 &&
                                                        <FiArrowDown size={28}/>
                                                    }
                                                    <Text
                                                        h={"full"}
                                                        fontSize={24}
                                                    >
                                                        {Number(sensorDataToDisplay.valueDiff) >= 0 ? "+" + sensorDataToDisplay.valueDiff : sensorDataToDisplay.valueDiff}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </>
                                    }
                                </VStack>
                            </HStack>
                            <Text fontSize={"sm"} fontWeight={300} color={"gray.500"}
                                  pt={1}>{getSensorDataTimeOfSampling()}</Text>
                        </VStack>
                    }
                    {
                        props.widget.type === "tachometer" &&
                        <VStack>
                            <GaugeChart
                                id="gauge-chart3"
                                animate={false}
                                nrOfLevels={1}
                                colors={["#8884d8"]}
                                hideText={true}
                                // needleColor={"#8884d8"}
                                arcWidth={0.3}
                                percent={isNaN(parseFloat(sensorDataToDisplay.value)) ? 0 : parseFloat(sensorDataToDisplay.value) / sensorDataToDisplay.maxValue}
                            />
                            <HStack
                                w={"full"}
                                justifyContent={"center"}
                            >
                                <Text
                                    fontSize={32}>{sensorDataToDisplay.value ? sensorDataToDisplay.value : "N/A"}</Text>
                                <VStack
                                    alignItems={"left"}
                                >
                                    <Text fontSize={"xs"}>{props.sensorMonitoring.name}</Text>
                                    <Text fontSize={"md"} fontWeight={500}
                                          mt={"0!important"}>{props.sensorMonitoring.unit}</Text>
                                </VStack>
                                {
                                    sensorDataToDisplay.valueDiff &&
                                    <>
                                        <Divider orientation={"vertical"} h={"55px"}/>
                                        <VStack>
                                            <Text fontSize={"xs"} fontWeight={300}
                                                  mb={"0!important"}>Difference</Text>
                                            <HStack
                                                alignItems={"center"}
                                                mt={"0!important"}
                                            >
                                                {
                                                    Number(sensorDataToDisplay.valueDiff) >= 0 &&
                                                    <FiArrowUp size={28}/>
                                                }
                                                {
                                                    Number(sensorDataToDisplay.valueDiff) < 0 &&
                                                    <FiArrowDown size={28}/>
                                                }
                                                <Text
                                                    h={"full"}
                                                    fontSize={16}
                                                >
                                                    {Number(sensorDataToDisplay.valueDiff) >= 0 ? "+" + sensorDataToDisplay.valueDiff : sensorDataToDisplay.valueDiff}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </>
                                }
                            </HStack>
                            <Text fontSize={"sm"} fontWeight={300} color={"gray.500"}
                                  mt={"0!important"}>{getSensorDataTimeOfSampling()}</Text>
                        </VStack>
                    }
                </>
            }

        </VStack>
    )
}

export default memo(SingleValueDataDisplay)