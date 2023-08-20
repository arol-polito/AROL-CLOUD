import type Sensor from '../../../../../models/Sensor'
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
} from '@chakra-ui/react'
import { FiInfo } from 'react-icons/fi'
import React from 'react'
import type SensorDataFilter from '../../../../../interfaces/SensorDataFilter'
import type SensorDataRange from '../../../../../interfaces/SensorDataRange'

interface WidgetInfoPopoverProps {
  sensorsMonitoringSensors: Record<string, SensorDataFilter[]>
  sensorsMonitoringAggregations: Array<{ name: string, color: string }>
  sensorsMonitoringDataRange: SensorDataRange
  availableSensors: Sensor[]
}

export default function WidgetInfoPopover (props: WidgetInfoPopoverProps) {
  function getSensorName (sensorInternalName: string, indexHead: number) {
    const findSensor = props.availableSensors.find((el) => (el.internalName === sensorInternalName))

    if (findSensor == null)
      return 'N/A'

    let sensorName = findSensor.name

    if (indexHead > 0)
      sensorName += ` - Head ${indexHead}`

    return sensorName
  }

  return (
        <Popover
            placement="right"
        >
            <PopoverTrigger>
                <IconButton colorScheme="gray" variant="ghost" icon={<FiInfo/>} px="0!important"
                            ml="0!important"
                            aria-label="Widget info"/>
            </PopoverTrigger>
            <Portal>
                <PopoverContent
                    shadow="2xl"
                    borderColor="gray.300"
                    // Stop click from propagating down to dashboard
                    onMouseDown={(e) => {
                      e.stopPropagation()
                    }}
                >
                    <PopoverArrow/>
                    <PopoverCloseButton size="lg"/>
                    <PopoverBody>
                        <VStack
                            w="full"
                            h="full"
                            alignItems="flex-start"
                        >
                            <Heading size="md">Chart legend</Heading>
                            {/* <Text fontSize={"sm"} fontWeight={400}>Showing */}
                            {/*    last {props.sensorsMonitoringDataRange.amount} {rangeUnits.find((el) => (el.value === props.sensorsMonitoringDataRange.unit))!!.displayName}</Text> */}
                            <Divider orientation="horizontal"/>
                            <VStack
                                w="full"
                                maxH={300}
                                overflowY="auto"
                                alignItems="left"
                            >
                                {
                                    props.sensorsMonitoringAggregations.length > 0 &&
                                    <>
                                        <Text fontSize="md" fontWeight={500}>Aggregations</Text>
                                        {
                                            props.sensorsMonitoringAggregations.map((aggregation) => (
                                                <HStack
                                                    key={aggregation.name}
                                                    w="full"
                                                    flexWrap="nowrap"
                                                >
                                                    <Box
                                                        boxSize={6}
                                                        bgColor={aggregation.color}
                                                        borderRadius="md"
                                                    />
                                                    <Text
                                                        whiteSpace="nowrap"
                                                        color={aggregation.color}
                                                    >
                                                        {aggregation.name}
                                                    </Text>
                                                </HStack>
                                            ))
                                        }
                                        <Divider orientation="horizontal"/>
                                        <Text fontSize="md" fontWeight={500}>Sensors</Text>
                                    </>
                                }
                                {
                                    Array.from(Object.entries(props.sensorsMonitoringSensors)).map(([, value]) => (
                                      value.map((headMechEntry) => (
                                        headMechEntry.sensorNames.map((sensorName) => (
                                                <HStack
                                                    key={`${sensorName.name}-${headMechEntry.headNumber}`}
                                                    w="full"
                                                    flexWrap="nowrap"
                                                >
                                                    <Box
                                                        boxSize={6}
                                                        bgColor={sensorName.color}
                                                        borderRadius="md"
                                                    />
                                                    <Text
                                                        whiteSpace="nowrap"
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
