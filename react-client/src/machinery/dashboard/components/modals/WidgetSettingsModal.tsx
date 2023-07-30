import {
  Box,
  Button,
  CloseButton,
  Divider,
  Flex,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  VStack
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import type Sensor from '../../models/Sensor'
import type SensorDataFilters from '../../interfaces/SensorDataFilters'
import type SensorDataFilter from '../../interfaces/SensorDataFilter'
import ToastContext from '../../../../utils/contexts/ToastContext'
import toastHelper from '../../../../utils/ToastHelper'

interface WidgetSettingsModalProps {
  settingsModalOpen: boolean
  setSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  sensorsMonitoring: SensorDataFilters
  setSensorsMonitoring: React.Dispatch<React.SetStateAction<SensorDataFilters>>
  availableSensors: Sensor[]
  maxSelectableSensors: number
}

const aggregationOptions = [
  { value: 'Minimum', displayName: 'Minimum value in sample' },
  { value: 'Maximum', displayName: 'Maximum value in sample' },
  { value: 'Average', displayName: 'Average of the values in the sample' }
]

const rangeUnits = [
  { value: 'sample', displayName: 'samples' },
  { value: 'day', displayName: 'days' },
  { value: 'week', displayName: 'weeks' },
  { value: 'month', displayName: 'months' }
]

const colors = ['#b4ddd4', '#194f46', '#5ddcb2', '#528f7a', '#a0e85b', '#799d10', '#dada69', '#73482b', '#f48e9b', '#922d4c', '#fb2076', '#f97930', '#a93705', '#36f459', '#21a708', '#048ad1', '#3330b7', '#8872e4', '#e26df8', '#49406e', '#7220f6', '#ffb947', '#ed0e1c', '#a28b91']

export default function WidgetSettingsModal (props: WidgetSettingsModalProps) {
  const toast = useContext(ToastContext)

  const [sensorsMonitoring, setSensorsMonitoring] = useState<SensorDataFilters>({
    aggregations: [],
    cacheDataRequestMaxTime: 0,
    newDataRequestMinTime: 0,
    dataRange: {
      amount: 0,
      unit: 'sample'
    },
    requestType: '',
    sensors: {},
    widgetCategory: ''
  })

  // SET SENSORS MONITORING (json stringify + parse for deep copy)
  useEffect(() => {
    setSensorsMonitoring((val) => {
      val = JSON.parse(JSON.stringify(props.sensorsMonitoring))
      if (props.maxSelectableSensors === 1 && val.aggregations.length === 0)
        val.aggregations.push({
          name: 'none',
          color: '#000000'
        })

      return { ...val }
    })
  }, [props.sensorsMonitoring, props.maxSelectableSensors])

  // CHECK IF ANY SENSOR IS BEING MONITORED
  function areSensorsMonitored () {
    for (const [, value] of Object.entries(sensorsMonitoring.sensors))
      if (value.length > 0)
        return true

    return false
  }

  // AGGREGATION SELECTED EVENT
  function handleAggregationSelected (value: string, index: number) {
    setSensorsMonitoring((val) => {
      val.aggregations[index].name = value

      if (props.maxSelectableSensors > 1) {
        const hasAggregations = val.aggregations.filter((el) => (el.name !== 'none')).length > 0
        val.sensors = reColorSensorsMonitoring(val.sensors, hasAggregations)
      }

      return { ...val }
    })
  }

  // AGGREGATION REMOVED EVENT
  function handleRemoveAggregate (value: string, index: number) {
    setSensorsMonitoring((val) => {
      if (val.aggregations.length === 0) return val

      if (val.aggregations[index].name !== value)
        return val

      val.aggregations = val.aggregations.filter((el) => (el.name !== value))

      const hasAggregations = val.aggregations.filter((el) => (el.name !== 'none')).length > 0
      val.sensors = reColorSensorsMonitoring(val.sensors, hasAggregations)

      return { ...val }
    })
  }

  // RE-APPLY COLORS TO EACH SENSOR MONITORING - when aggregations change
  function reColorSensorsMonitoring (val: Record<string, SensorDataFilter[]>, hasAggregates: boolean) {
    let colorIndex = 0
    Object.values(val).forEach((value) => {
      value.forEach((headMechEntry) => {
        headMechEntry.sensorNames.forEach((sensorName) => {
          if (!hasAggregates) {
            sensorName.color = colors[colorIndex]
            colorIndex++
          } else
            sensorName.color = '#E2E8F0'
        })
      })
    })

    return val
  }

  // SENSOR RANGE UNIT (sample/day/week...) CHANGED
  function handleRangeUnitSelected (e: React.ChangeEvent<HTMLSelectElement>) {
    setSensorsMonitoring((val) => {
      val.dataRange.unit = e.target.value

      return { ...val }
    })
  }

  // SENSOR RANGE AMOUNT (number of sample/day/week...) CHANGED
  function handleRangeAmountChanged (e: React.ChangeEvent<HTMLInputElement>) {
    setSensorsMonitoring((val) => {
      val.dataRange.amount = parseInt(e.target.value)

      return { ...val }
    })
  }

  // SAVE CHANGES
  function handleSaveButtonClicked () {
    if (JSON.stringify(props.sensorsMonitoring) !== JSON.stringify(sensorsMonitoring))
      props.setSensorsMonitoring((val) => {
        val = { ...sensorsMonitoring }

        val.requestType = 'first-time'

        val.aggregations = val.aggregations.filter((aggregation) => (aggregation.name !== 'none'))

        if (val.aggregations.length === 0 && props.maxSelectableSensors === 1) {
          val.dataRange.unit = 'sample'
          val.dataRange.amount = 1
        }

        return { ...val }
      })

    props.setSettingsModalOpen(false)

    toastHelper.makeToast(
      toast,
      'Changes saved',
      'info'
    )
  }

  return (
        <Modal
            size='2xl'
            onClose={() => {
                props.setSettingsModalOpen(false)
            }}
            isOpen={props.settingsModalOpen}
            scrollBehavior="inside"
            isCentered
        >
            <ModalOverlay
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
            />
            <ModalContent
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
            >
                <ModalHeader>Widget settings</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack
                        w="full"
                        alignItems="left"
                    >
                        {
                            props.maxSelectableSensors > 1 &&
                            <VStack
                                alignItems="left"
                                pt={2}
                            >
                                <Text fontSize="lg" fontWeight={500}>Sensor data range</Text>
                                <HStack w="full" mx={8} justifyContent="center">

                                    <Text whiteSpace="nowrap">Show last</Text>
                                    <Input w={75} type="number" value={sensorsMonitoring.dataRange.amount}
                                           onChange={handleRangeAmountChanged}/>
                                    <Select value={sensorsMonitoring.dataRange.unit} onChange={handleRangeUnitSelected}
                                            w={250}>
                                        {
                                            rangeUnits.map((unit) => (
                                                <option key={unit.value} value={unit.value}>{unit.displayName}</option>
                                            ))
                                        }
                                    </Select>
                                </HStack>
                            </VStack>
                        }
                        <Divider orientation="horizontal" pt={2}/>
                        {
                            (props.maxSelectableSensors === 1 ||
                                sensorsMonitoring.aggregations.length > 0) &&
                            <>
                                <VStack
                                    w="full"
                                    alignItems="left"
                                >
                                    <Text fontSize="lg" fontWeight={500}>Data aggregations</Text>

                                    {
                                        sensorsMonitoring.aggregations.map((value, index) => (
                                            <VStack
                                                key={index}
                                                w="full"
                                                alignItems="left"
                                            >
                                                <HStack w="full">
                                                    <Text fontSize="md"
                                                          whiteSpace="nowrap">Aggregation {props.maxSelectableSensors === 1 ? 'type' : index + 1}</Text>
                                                    <Select value={value.name}
                                                            onChange={(e) => {
                                                              handleAggregationSelected(e.target.value, index)
                                                            }}>
                                                        <option value="none">No aggregation</option>
                                                        {
                                                            aggregationOptions
                                                              .filter((aggregationOption) => (
                                                                !sensorsMonitoring.aggregations
                                                                  .filter((el, filterIndex) => (filterIndex !== index)) // otherwise selected value will filter itself out
                                                                  .map((el) => (el.name))
                                                                  .includes(aggregationOption.value) // Filter out any other selected value
                                                              )
                                                              )
                                                              .map((aggregationOption, indexOption) => (
                                                                    <option
                                                                        key={`${index}_${indexOption}`}
                                                                        value={aggregationOption.value}
                                                                    >
                                                                        {aggregationOption.displayName}
                                                                    </option>
                                                              ))
                                                        }
                                                    </Select>
                                                    {
                                                        props.maxSelectableSensors > 1 &&
                                                        value.name !== 'none' && // value should be selected
                                                        index === sensorsMonitoring.aggregations.length - 1 && // only last entry should have button displayed
                                                        index < aggregationOptions.length - 1 && // show button only if not all aggregation entries are already applied (-2 since index starts from 0)
                                                        <Button
                                                            variant="solid"
                                                            colorScheme="teal"
                                                            onClick={() => {
                                                              handleRemoveAggregate(value.name, index)
                                                            }}
                                                        >
                                                            -
                                                        </Button>
                                                    }

                                                </HStack>
                                                {
                                                    props.maxSelectableSensors === 1 &&
                                                    value.name !== 'none' &&
                                                    <HStack w="full" mx={8} justifyContent="left">

                                                        <Text whiteSpace="nowrap">Apply aggregation on last</Text>
                                                        <Input w={75} type="number"
                                                               value={sensorsMonitoring.dataRange.amount}
                                                               onChange={handleRangeAmountChanged}/>
                                                        <Select value={sensorsMonitoring.dataRange.unit}
                                                                onChange={handleRangeUnitSelected}>
                                                            {
                                                                rangeUnits.map((unit) => (
                                                                    <option key={unit.value}
                                                                            value={unit.value}>{unit.displayName}</option>
                                                                ))
                                                            }
                                                        </Select>
                                                    </HStack>
                                                }
                                            </VStack>
                                        ))

                                    }

                                </VStack>
                                <Divider orientation="horizontal"/>
                            </>
                        }
                        <VStack
                            alignItems="left"
                            pt={2}
                        >
                            <Text fontSize="lg" fontWeight={500}>Sensors monitoring</Text>
                            {
                                areSensorsMonitored() &&
                                Array.from(Object.entries(sensorsMonitoring.sensors)).map(([, value]) => (
                                  value.map((headMechEntry) => (
                                    headMechEntry.sensorNames.map((sensorName, index) => (
                                            <SensorMonitoredEntry
                                                key={`${sensorName.name}-${headMechEntry.headNumber}`}
                                                sensor={props.availableSensors.find((el) => (el.internalName === sensorName.name))}
                                                color={sensorName.color}
                                                entryIndex={index}
                                                indexHead={headMechEntry.headNumber}
                                                setMonitoredSensors={setSensorsMonitoring}
                                                maxSelectableSensors={props.maxSelectableSensors}
                                            />
                                    ))
                                  ))
                                ))
                            }
                            {
                                !areSensorsMonitored() &&
                                <Box
                                    w="full"
                                    textAlign="center"
                                    my="4"
                                >
                                    No sensors are being monitored
                                </Box>
                            }
                        </VStack>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={() => {
                      props.setSettingsModalOpen(false)
                    }}>Discard changes</Button>
                    <Button colorScheme='blue' onClick={handleSaveButtonClicked}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
  )
}

interface SensorMonitoredEntryProps {
  sensor: Sensor | undefined
  color: string
  entryIndex: number
  indexHead: number
  setMonitoredSensors: React.Dispatch<React.SetStateAction<SensorDataFilters>>
  maxSelectableSensors: number
}

function SensorMonitoredEntry (props: SensorMonitoredEntryProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  if (props.sensor === undefined)
    return (<></>)

  const sensor = props.sensor

  function handleRemoveMonitoredSensor () {
    props.setMonitoredSensors((val) => {
      const foundEntry = val.sensors[sensor.category].find((el) => (el.headNumber === props.indexHead))
      if (foundEntry != null) {
        foundEntry.sensorNames = foundEntry.sensorNames.filter((el) => (el.name !== sensor.internalName))
        if (foundEntry.sensorNames.length === 0)
          val.sensors[sensor.category] = val.sensors[sensor.category].filter((el) => (el.headNumber !== props.indexHead))
      }

      return { ...val }
    })
  }

  function getSensorName () {
    let sensorName = sensor.name
    if (props.indexHead > 0)
      sensorName += ` - Head ${props.indexHead}`

    return sensorName
  }

  return (
        <>
            <VStack
                w="full"
            >
                <HStack
                    w="full"
                    mt={2}
                    justifyContent="space-between"
                >

                    <HStack>
                        <VStack
                            alignItems="left"
                        >
                            <HStack
                                justifyContent="left"
                                alignItems="center"
                            >
                                {
                                    props.maxSelectableSensors === 1 &&
                                    <Box boxSize={6} bgColor="black" borderRadius="md"/>
                                }
                                {
                                    props.maxSelectableSensors > 1 &&
                                    <Box boxSize={6} bgColor={props.color} borderRadius="md"/>
                                }

                                <Text>{getSensorName()}</Text>
                                <Box
                                    _hover={{
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                      setDescriptionExpanded((val) => (!val))
                                    }}
                                >
                                    <FiInfo/>
                                </Box>
                            </HStack>
                        </VStack>
                    </HStack>

                    <HStack
                        justifyContent="right"
                    >
                        <Button
                            colorScheme="red"
                            variant='outline'
                            onClick={handleRemoveMonitoredSensor}
                        >
                            Stop monitoring
                        </Button>
                    </HStack>
                </HStack>
                {
                    descriptionExpanded &&
                    <SensorDescription sensor={props.sensor} setDescriptionExpanded={setDescriptionExpanded}/>
                }
            </VStack>
            <Divider orientation="horizontal"/>
        </>
  )
}

const SensorDescription  = (props: {
  sensor: Sensor
  setDescriptionExpanded: React.Dispatch<React.SetStateAction<boolean>>
}) => <HStack
        w="full"
        alignItems="top"
        justifyContent="space-between"
        pl={6}
    >
        <HStack>
            <Flex>
                <Box boxSize="125px">
                    <Image
                        objectFit="cover"
                        boxSize="100%"
                        src={require('../../../../assets/machineries/EQUA.png')}
                    />
                </Box>
            </Flex>
            <Divider orientation="vertical" h="125px"/>
            <VStack
                h="full"
                alignItems="left"
                justifyContent="start"
            >
                <Text
                    fontWeight={300}
                    color="gray.500"
                    fontSize="xs"
                >
                    Sensor description
                </Text>
                <Text
                    // fontWeight={600}
                    color="black"
                    fontSize="sm"
                    mt="0!important"
                    mb={4}
                >
                    {props.sensor.description ? props.sensor.description : 'N/A'}
                </Text>

                <Text
                    fontWeight={300}
                    color="gray.500"
                    fontSize="xs"
                >
                    Sensor type
                </Text>
                <Text
                    // fontWeight={600}
                    color="black"
                    fontSize="sm"
                    mt="0!important"
                    mb={4}
                >
                    {props.sensor.type ? props.sensor.type : 'N/A'}
                </Text>

                <Text
                    fontWeight={300}
                    color="gray.500"
                    fontSize="xs"
                >
                    Sensor unit
                </Text>
                <Text
                    // fontWeight={600}
                    color="black"
                    fontSize="sm"
                    mt="0!important"
                    mb={4}
                >
                    {props.sensor.unit ? props.sensor.unit : 'N/A'}
                </Text>

                <Text
                    fontWeight={300}
                    color="gray.500"
                    fontSize="xs"
                >
                    Sensor thresholds
                </Text>
                <HStack
                    mb={4}
                    mt="0!important"
                >
                    <Text
                        // fontWeight={600}
                        color="black"
                        fontSize="sm"
                    >
                        Lower: {props.sensor.thresholdLow ? `${props.sensor.thresholdLow} ${props.sensor.unit}` : 'N/A'}
                    </Text>
                    <Text color="black" fontSize="sm">-</Text>
                    <Text
                        // fontWeight={600}
                        color="black"
                        fontSize="sm"
                    >
                        Upper: {props.sensor.thresholdHigh ? `${props.sensor.thresholdHigh} ${props.sensor.unit}` : 'N/A'}
                    </Text>
                </HStack>
            </VStack>
        </HStack>
        <CloseButton onClick={() => {
          props.setDescriptionExpanded(false)
        }}/>
    </HStack>;
