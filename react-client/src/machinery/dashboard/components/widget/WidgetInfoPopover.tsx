import Sensor from "../../models/Sensor";
import {
    Box,
    Divider,
    Heading,
    HStack,
    IconButton,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    Portal,
    Text,
    VStack
} from "@chakra-ui/react";
import {FiInfo} from "react-icons/fi";
import React from "react";
import SensorDataFilter from "../../interfaces/SensorDataFilter";
import SensorDataRange from "../../interfaces/SensorDataRange";
import {right} from "@popperjs/core";

const rangeUnits = [
    {value: "sample", displayName: "samples"},
    {value: "day", displayName: "days"},
    {value: "week", displayName: "weeks"},
    {value: "month", displayName: "months"},
]

interface WidgetInfoPopoverProps {
    sensorsMonitoringSensors: { [key: string]: SensorDataFilter[] }
    sensorsMonitoringAggregations: { name: string, color: string }[]
    sensorsMonitoringDataRange: SensorDataRange
    availableSensors: Sensor[]
}

export default function WidgetInfoPopover(props: WidgetInfoPopoverProps) {

    function getSensorName(sensorInternalName: string, indexHead: number) {
        let findSensor = props.availableSensors.find((el) => (el.internalName === sensorInternalName))

        if (!findSensor) {
            return "N/A"
        }

        let sensorName = findSensor.name

        if (indexHead > 0) {
            sensorName += " - Head " + indexHead
        }

        return sensorName
    }

    return (
        <Popover
            placement={"right"}
        >
            <PopoverTrigger>
                <IconButton colorScheme={"gray"} variant={"ghost"} icon={<FiInfo/>} px={"0!important"}
                            ml={"0!important"}
                            aria-label={"Widget info"}/>
            </PopoverTrigger>
            <Portal>
                <PopoverContent
                    shadow={"2xl"}
                    borderColor={"gray.300"}
                    //Stop click from propagating down to dashboard
                    onMouseDown={(e) => (e.stopPropagation())}
                >
                    <PopoverArrow/>
                    <PopoverCloseButton size={"lg"}/>
                    <PopoverBody>
                        <VStack
                            w={"full"}
                            h={"full"}
                            alignItems={"flex-start"}
                        >
                            <Heading size={"md"}>Chart legend</Heading>
                            {/*<Text fontSize={"sm"} fontWeight={400}>Showing*/}
                            {/*    last {props.sensorsMonitoringDataRange.amount} {rangeUnits.find((el) => (el.value === props.sensorsMonitoringDataRange.unit))!!.displayName}</Text>*/}
                            <Divider orientation={"horizontal"}/>
                            <VStack
                                w={"full"}
                                maxH={300}
                                overflowY={"auto"}
                                alignItems={"left"}
                            >
                                {
                                    props.sensorsMonitoringAggregations.length > 0 &&
                                    <>
                                        <Text fontSize={"md"} fontWeight={500}>Aggregations</Text>
                                        {
                                            props.sensorsMonitoringAggregations.map((aggregation) => (
                                                <HStack
                                                    key={aggregation.name}
                                                    w={"full"}
                                                    flexWrap={"nowrap"}
                                                >
                                                    <Box
                                                        boxSize={6}
                                                        bgColor={aggregation.color}
                                                        borderRadius={"md"}
                                                    />
                                                    <Text
                                                        whiteSpace={"nowrap"}
                                                        color={aggregation.color}
                                                    >
                                                        {aggregation.name}
                                                    </Text>
                                                </HStack>
                                            ))
                                        }
                                        <Divider orientation={"horizontal"}/>
                                        <Text fontSize={"md"} fontWeight={500}>Sensors</Text>
                                    </>
                                }
                                {
                                    Array.from(Object.entries(props.sensorsMonitoringSensors)).map(([_, value]) => (
                                        value.map((headMechEntry) => (
                                            headMechEntry.sensorNames.map((sensorName, index) => (
                                                <HStack
                                                    key={sensorName.name + "-" + headMechEntry.headNumber}
                                                    w={"full"}
                                                    flexWrap={"nowrap"}
                                                >
                                                    <Box
                                                        boxSize={6}
                                                        bgColor={sensorName.color}
                                                        borderRadius={"md"}
                                                    />
                                                    <Text
                                                        whiteSpace={"nowrap"}
                                                        color={sensorName.color}
                                                    >
                                                        {getSensorName(sensorName.name, headMechEntry.headNumber)}
                                                    </Text>
                                                </HStack>
                                            ))
                                        ))
                                    ))
                                }
                            </VStack>

                        </VStack>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    )
}