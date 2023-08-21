import type Sensor from '../../../../models/Sensor'
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
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useToast,
    VStack
} from '@chakra-ui/react'
import React, {useEffect, useState} from 'react'
import {FiAlertTriangle, FiChevronDown, FiChevronUp, FiInfo} from 'react-icons/fi'
import type SensorDataFilters from '../../../../interfaces/SensorDataFilters'
import type SensorDataFilter from '../../../../interfaces/SensorDataFilter'
import type SensorDataRange from '../../../../interfaces/SensorDataRange'
import Dashboard from "../../../../models/Dashboard";
import GridWidget from "../../../../interfaces/GridWidget";
import {
    calculateChartProps,
    calculatePolarChartSensorData,
    loadSensorData,
    setNewWidgetSensorData,
    setNewWidgetSensorsMonitoring,
    setWidgetSensorDataLoadingAndError
} from "../../../../utils";
import Machinery from "../../../../../../machineries-map/components/Machinery";
import axiosExceptionHandler from "../../../../../../utils/AxiosExceptionHandler";
import _ from "lodash";

interface SensorsModalProps {
    machinery: Machinery
    widget: GridWidget
    widgetIndex: number
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    modalOpen: boolean
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    availableSensors: Sensor[]
    availableSensorsMap: Map<string, Sensor[]>
    numHeads: number
}

const colors = ['#b4ddd4', '#194f46', '#5ddcb2', '#528f7a', '#a0e85b', '#799d10', '#dada69', '#73482b', '#f48e9b', '#922d4c', '#fb2076', '#f97930', '#a93705', '#36f459', '#21a708', '#048ad1', '#3330b7', '#8872e4', '#e26df8', '#49406e', '#7220f6', '#ffb947', '#ed0e1c', '#a28b91']

const aggregationOptions = [
    {value: 'Minimum', displayName: 'Minimum value in sample'},
    {value: 'Maximum', displayName: 'Maximum value in sample'},
    {value: 'Average', displayName: 'Average of the values in the sample'}
]

const rangeUnits = [
    {value: 'sample', displayName: 'samples'},
    {value: 'day', displayName: 'days'},
    {value: 'week', displayName: 'weeks'},
    {value: 'month', displayName: 'months'}
]

// Need to use "any" otherwise ts will complain when dynamically indexing object
export default function SensorsModal(props: SensorsModalProps) {

    const {widget, widgetIndex, setDashboard, availableSensors} = props;
    const {machinery} = props;

    const {maxSensors, sensorsMonitoring, dataDisplaySize} = widget;

    const toast = useToast();

    const [numSensorsSelected, setNumSensorsSelected] = useState(0)
    const [selectedSensors, setSelectedSensors] = useState<SensorDataFilters['sensors']>({
        drive: [],
        eqtq: [],
        ns: [],
        plc: []
    })
    const [sensorAggregations, setSensorAggregations] = useState<string[]>(['none'])
    const [sensorDataRange, setSensorDataRange] = useState<SensorDataRange>(
        _.cloneDeep(sensorsMonitoring.dataRange)
    )

    useEffect(() => {
        let numSensorsAlreadyMonitoring = 0
        Object.keys(sensorsMonitoring.sensors).forEach((key) => {
            sensorsMonitoring.sensors[key].forEach((headMechEntry) => {
                numSensorsAlreadyMonitoring += headMechEntry.sensorNames.length
            })
        })

        if (sensorsMonitoring.aggregations.length > 0)
            setSensorAggregations(sensorsMonitoring.aggregations.map((aggregation) => (aggregation.name)))

        setNumSensorsSelected(numSensorsAlreadyMonitoring)
    }, [sensorsMonitoring])

    async function handleMonitorSensorsClicked() {
        const sensorsMonitoring = widget.sensorsMonitoring;

        sensorsMonitoring.widgetCategory = widget.maxSensors === 1 ? 'single-value' : 'multi-value';

        const aggregations = sensorAggregations.filter((aggregation) => (aggregation !== 'none'))

        if (aggregations.length === 0 && maxSensors === 1) {
            sensorsMonitoring.dataRange.unit = 'sample'
            sensorsMonitoring.dataRange.amount = 1
        } else
            sensorsMonitoring.dataRange = sensorDataRange

        // Insert selected sensors and if aggregate selected, change color to gray
        for (const [key, value] of Object.entries(selectedSensors))
            value.forEach((entry) => {
                const headNum = entry.headNumber
                const foundEntry = sensorsMonitoring.sensors[key].find((el) => (el.headNumber === headNum))
                if (foundEntry != null)
                    entry.sensorNames.forEach((sensorName) => {
                        const foundSensorEntry = foundEntry.sensorNames.find((el) => (el.name === sensorName.name))

                        if (foundSensorEntry == null) {
                            if (aggregations.length > 0)
                                sensorName.color = '#E2E8F0'

                            foundEntry.sensorNames.push(sensorName)
                        } else if (aggregations.length > 0)
                            foundSensorEntry.color = '#E2E8F0'
                    })
                else
                    sensorsMonitoring.sensors[key].push({...entry})
            })

        // If no sensor selected (sensors are already monitored) but aggregate selected, change color to gray
        let areSensorsSelected = false
        for (const key of Object.keys(selectedSensors)) {
            for (const headMechEntry of selectedSensors[key])
                if (headMechEntry.sensorNames.length > 0) {
                    areSensorsSelected = true
                    break
                }

            if (areSensorsSelected) break
        }

        if (!areSensorsSelected) {
            let colorIndex = 0
            Object.keys(sensorsMonitoring.sensors).forEach((key) => {
                sensorsMonitoring.sensors[key].forEach((headMechEntry) => {
                    headMechEntry.sensorNames.forEach((sensorName) => {
                        if (aggregations.length > 0)
                            sensorName.color = '#E2E8F0'
                        else if (sensorName.color === '#E2E8F0') {
                            sensorName.color = colors[colorIndex]
                            colorIndex++
                        }
                    })
                })
            })
        }

        sensorsMonitoring.aggregations = aggregations
            .map((aggregation, index) => ({name: aggregation, color: colors[index]}))

        setNewWidgetSensorsMonitoring(
            setDashboard,
            widgetIndex,
            sensorsMonitoring,
            availableSensors
        )

        try {
            setWidgetSensorDataLoadingAndError(setDashboard, widgetIndex, true, false, false);
            const sensorDataResult = await loadSensorData(sensorsMonitoring, 'first-time', 0, 0, machinery.uid, widget)
            const chartPropsResult = calculateChartProps(sensorDataResult, widget.chartProps);
            const polarChartSensorDataResult = calculatePolarChartSensorData(widget.polarChartSensorData, sensorDataResult, widget.sensorsMonitoringArray, widget.type, widget.aggregationsArray, dataDisplaySize)

            setNewWidgetSensorData(setDashboard, widgetIndex, sensorDataResult, chartPropsResult, polarChartSensorDataResult);
        } catch (e) {
            console.error(e)
            axiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                'Sensor data could not be loaded'
            )
            setWidgetSensorDataLoadingAndError(setDashboard, widgetIndex, false, false, true);
        }

        props.setModalOpen(false)
    }

    function handleAggregationSelected(value: string, index: number) {
        setSensorAggregations((val) => {
            val[index] = value

            return val.slice()
        })
    }

    function handleAddAdditionalAggregate() {
        setSensorAggregations((val) => {
            if (val[val.length - 1] === 'none')
                return val

            val.push('none')

            return val.slice()
        })
    }

    function handleRangeUnitSelected(e: React.ChangeEvent<HTMLSelectElement>) {
        setSensorDataRange((val) => {
            val.unit = e.target.value

            return {...val}
        })
    }

    function handleRangeAmountChanged(e: React.ChangeEvent<HTMLInputElement>) {
        setSensorDataRange((val) => {
            val.amount = parseInt(e.target.value)

            return {...val}
        })
    }

    return (
        <Modal
            isOpen={props.modalOpen}
            size="2xl"
            onClose={() => {
                props.setModalOpen(false)
            }}
            scrollBehavior="inside"
        >
            <ModalOverlay
                onMouseDown={(e) => {
                    e.stopPropagation()
                }}
            />
            <ModalContent
                // Stop click from propagating down to dashboard
                onMouseDown={(e) => {
                    e.stopPropagation()
                }}
            >
                <ModalHeader>
                    <Text fontSize="xl">Choose the sensors (up to {maxSensors}) to monitor</Text>
                    {
                        numSensorsSelected >= maxSensors &&
                        <HStack
                            alignItems="center"
                        >
                            <FiAlertTriangle color="red"/>
                            <Text fontSize="sm" color="red">Limit of sensors that can be monitored reached</Text>
                        </HStack>

                    }
                </ModalHeader>
                <ModalCloseButton/>
                <ModalBody
                    pb={12}
                >
                    {props.availableSensorsMap.size > 0 &&
                        <>
                            <Text fontSize="lg" fontWeight={600}>Select sensors</Text>
                            <Tabs variant='soft-rounded' colorScheme='green'>
                                <TabList>
                                    {Array.from(props.availableSensorsMap.keys()).map((keyEntry) => (
                                        <Tab key={keyEntry}>
                                            {keyEntry.toUpperCase()}
                                        </Tab>
                                    ))}
                                </TabList>
                                <TabPanels>
                                    {
                                        // display each sensor category into its corresponding tab
                                        Array.from(props.availableSensorsMap.entries()).map((mapKeyAndValue) => (
                                            <TabPanel key={mapKeyAndValue[0]}>
                                                {
                                                    // If category contains sensors
                                                    mapKeyAndValue[1].length > 0 &&
                                                    mapKeyAndValue[1].map((sensor) => (
                                                        <SensorEntry
                                                            key={sensor.name}
                                                            sensor={sensor}
                                                            sensorsMonitoring={[...sensorsMonitoring.sensors[mapKeyAndValue[0]]]}
                                                            selectedSensors={[...selectedSensors[mapKeyAndValue[0]]]}
                                                            numHeads={props.numHeads}
                                                            maxSelectableSensors={maxSensors}
                                                            numSensorsSelected={numSensorsSelected}
                                                            setNumSensorsSelected={setNumSensorsSelected}
                                                            setModalOpen={props.setModalOpen}
                                                            setSelectedSensors={setSelectedSensors}
                                                        />
                                                    ))
                                                }
                                                {
                                                    // If category does NOT contain sensors
                                                    mapKeyAndValue[1].length === 0 &&
                                                    <Box
                                                        w="full"
                                                        textAlign="center"
                                                        my="4"
                                                    >
                                                        There are no sensors available in this category
                                                    </Box>
                                                }
                                            </TabPanel>
                                        ))
                                    }

                                </TabPanels>
                            </Tabs>
                        </>
                    }
                    {
                        props.availableSensorsMap.size === 0 &&
                        <>
                            <Text fontSize="lg" fontWeight={600}>Select sensors</Text>
                            <Box
                                w="full"
                                textAlign="center"
                                my="4"
                            >
                                There are no sensors available for this machinery
                            </Box>
                        </>
                    }

                    <VStack
                        w="full"
                        alignItems="left"
                    >
                        <Text fontSize="lg" fontWeight={600}>Data aggregations</Text>

                        {
                            sensorAggregations.map((value, index) => (
                                <VStack
                                    key={index}
                                    w="full"
                                    alignItems="left"
                                >
                                    <HStack w="full">
                                        <Text fontSize="md"
                                              whiteSpace="nowrap">Aggregation {maxSensors === 1 ? 'type' : index + 1}</Text>
                                        <Select value={value}
                                                onChange={(e) => {
                                                    handleAggregationSelected(e.target.value, index)
                                                }}>
                                            <option value="none">No aggregation</option>
                                            {
                                                aggregationOptions
                                                    .filter((aggregationOption) => (
                                                            !sensorAggregations
                                                                .filter((el, filterIndex) => (filterIndex !== index)) // otherwise selected value will filter itself out
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
                                            maxSensors > 1 &&
                                            value !== 'none' && // value should be selected
                                            index === sensorAggregations.length - 1 && // only last entry should have button displayed
                                            index < aggregationOptions.length - 1 && // show button only if not all aggregation entries are already applied (-2 since index starts from 0)
                                            <Button
                                                variant="solid"
                                                colorScheme="teal"
                                                onClick={handleAddAdditionalAggregate}
                                            >
                                                +
                                            </Button>
                                        }

                                    </HStack>
                                    {
                                        maxSensors === 1 &&
                                        value !== 'none' &&
                                        <HStack w="full" mx={8} justifyContent="left">

                                            <Text whiteSpace="nowrap">Apply aggregation on last</Text>
                                            <Input w={75} type="number" value={sensorDataRange.amount}
                                                   onChange={handleRangeAmountChanged}/>
                                            <Select value={sensorDataRange.unit} onChange={handleRangeUnitSelected}>
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
                        {
                            maxSensors > 1 &&
                            <VStack
                                alignItems="left"
                                pt={2}
                            >
                                <Text fontSize="lg" fontWeight={500}>Sensor data range</Text>
                                <HStack w="full" mx={8} justifyContent="center">

                                    <Text whiteSpace="nowrap">Show last</Text>
                                    <Input w={75} type="number" value={sensorDataRange.amount}
                                           onChange={handleRangeAmountChanged}/>
                                    <Select value={sensorDataRange.unit} onChange={handleRangeUnitSelected} w={250}>
                                        {
                                            rangeUnits.map((unit) => (
                                                <option key={unit.value} value={unit.value}>{unit.displayName}</option>
                                            ))
                                        }
                                    </Select>
                                </HStack>
                            </VStack>
                        }
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme='gray'
                        mr={3}
                        onClick={() => {
                            props.setModalOpen(false)
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        variant='solid'
                        colorScheme="teal"
                        disabled={numSensorsSelected === 0}
                        onClick={handleMonitorSensorsClicked}
                    >
                        Monitor {numSensorsSelected} sensors
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

interface SensorEntryProps {
    sensor: Sensor
    sensorsMonitoring: SensorDataFilter[]
    selectedSensors: SensorDataFilter[]
    numHeads: number
    maxSelectableSensors: number
    numSensorsSelected: number
    setNumSensorsSelected: React.Dispatch<React.SetStateAction<number>>
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedSensors: React.Dispatch<React.SetStateAction<SensorDataFilters['sensors']>>
}

function SensorEntry(props: SensorEntryProps) {
    const [sensorExpanded, setSensorExpanded] = useState(false)
    const [descriptionExpanded, setDescriptionExpanded] = useState(false)

    const [sensorLimitReached, setSensorLimitReached] = useState(false)
    const [allSensorsMonitored, setAllSensorsMonitored] = useState(false)
    const [allSensorsSelected, setAllSensorsSelected] = useState(false)

    // CHECK IF ALL SENSORS OF THIS GROUP ARE MONITORED
    useEffect(() => {
        const numHeads = props.sensor.isHeadMounted ? props.numHeads : 1

        let numHeadsSelected = 0
        for (const entry of props.sensorsMonitoring)
            if (entry.sensorNames.find((el) => (el.name === props.sensor.internalName)) != null)
                numHeadsSelected++


        setAllSensorsMonitored(numHeadsSelected === numHeads)
    }, [props.sensorsMonitoring, props.numHeads, props.sensor.internalName, props.sensor.isHeadMounted])

    // CHECK IF ALL SENSORS OF THIS GROUP ARE SELECTED
    useEffect(() => {
        const numHeads = props.sensor.isHeadMounted ? props.numHeads : 1

        let numHeadsSelected = 0
        for (const entry of props.selectedSensors)
            if (entry.sensorNames.find((el) => (el.name === props.sensor.internalName)) != null)
                numHeadsSelected++

        setAllSensorsSelected(numHeadsSelected === numHeads)
    }, [props.selectedSensors, props.numHeads, props.sensor.internalName, props.sensor.isHeadMounted])

    // CHECK IF LIMIT OF NUM SENSORS MONITORING REACHED
    useEffect(() => {
        if (props.numSensorsSelected >= props.maxSelectableSensors)
            setSensorLimitReached(true)
        else
            setSensorLimitReached(false)
    }, [props.numSensorsSelected, props.maxSelectableSensors])

    // MONITOR ALL SENSORS OF GROUP button clicked
    function handleSelectAllSensorsButtonClick() {
        const sensorCategory = props.sensor.category
        const sensorHeads = props.sensor.isHeadMounted ? props.numHeads : 0
        let numSensorsAdded = 0

        let numHeads = sensorHeads
        if (sensorHeads === 0)
            numHeads = 1

        let currHeadNum: number

        props.setSelectedSensors((val) => {
            Array.from(Array(numHeads)).forEach((_, indexHead) => {
                currHeadNum = sensorHeads === 0 ? 0 : indexHead + 1
                if (numSensorsAdded + props.numSensorsSelected >= props.maxSelectableSensors)
                    return

                const foundEntry = val[sensorCategory].find((el) => (el.headNumber === currHeadNum))
                if (foundEntry != null) {
                    if (foundEntry.sensorNames.find((el) => (el.name === props.sensor.internalName)) === undefined) {
                        foundEntry.sensorNames.push({
                            name: props.sensor.internalName,
                            color: colors[props.numSensorsSelected + numSensorsAdded]
                        })
                        numSensorsAdded++
                    }
                } else {
                    val[sensorCategory].push({
                        headNumber: currHeadNum,
                        sensorNames: [{
                            name: props.sensor.internalName,
                            color: colors[props.numSensorsSelected + numSensorsAdded]
                        }]
                    })
                    numSensorsAdded++
                }
            })

            props.setNumSensorsSelected((val) => (val + numSensorsAdded))

            if (sensorHeads > 0)
                setSensorExpanded(true)

            return {...val}
        })
    }

    // REMOVE ALL SENSORS OF GROUP
    function handleRemoveAllSensorsButtonClick() {
        const sensorCategory = props.sensor.category
        const sensorHeads = props.sensor.isHeadMounted ? props.numHeads : 0
        // const sensorMechs = 0// props.sensor.numMechs
        let numSensorsRemoved = 0

        let numHeads = sensorHeads
        // let numMechs = sensorMechs
        if (sensorHeads === 0)
            numHeads = 1

        // if (numMechs === 0)
        //     numMechs = 1

        let currHeadNum: number

        props.setSelectedSensors((val) => {
            Array.from(Array(numHeads)).forEach((_, indexHead) => {
                currHeadNum = sensorHeads === 0 ? 0 : indexHead + 1

                const foundEntry = val[sensorCategory].find((el) => (el.headNumber === currHeadNum))
                if (foundEntry != null) {
                    foundEntry.sensorNames = foundEntry.sensorNames.filter((el) => (el.name !== props.sensor.internalName))
                    if (foundEntry.sensorNames.length === 0)
                        val[sensorCategory] = val[sensorCategory].filter((el) => (el.headNumber !== currHeadNum))

                    numSensorsRemoved++
                }
            })

            props.setNumSensorsSelected((val) => (val - numSensorsRemoved))

            return {...val}
        })
    }

    // GET BUTTON TEXT
    function getButtonText() {
        if (!allSensorsSelected && props.numSensorsSelected >= props.maxSelectableSensors)
            return 'Sensor limit reached'

        const nonHeadSensor = !props.sensor.isHeadMounted // props.sensor.numHeads === 0 && props.sensor.numHeads === 0
        if (allSensorsMonitored) {
            if (nonHeadSensor)
                return 'Already monitoring'

            return 'Already monitoring all'
        }
        if (allSensorsSelected) {
            if (nonHeadSensor)
                return 'Remove'

            return 'Remove All'
        }
        if (nonHeadSensor)
            return 'Monitor'

        return 'Monitor All'
    }

    // GET BUTTON COLOR - green/red/gray
    function getButtonColor() {
        if (!allSensorsSelected && props.numSensorsSelected >= props.maxSelectableSensors)
            return 'gray'

        if (allSensorsMonitored)
            return 'black'

        if (allSensorsSelected)
            return 'red'

        return 'teal'
    }

    return <VStack
        w="full"
        justifyContent="left"
    >
        <HStack
            w="full"
            mt={2}
            justifyContent="space-between"
        >

            <HStack>
                {
                    props.sensor.isHeadMounted &&
                    <Box
                        _hover={{
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            setSensorExpanded((val) => (!val))
                        }}
                    >
                        {sensorExpanded ? <FiChevronUp/> : <FiChevronDown/>}
                    </Box>
                }
                <VStack
                    alignItems="left"
                >
                    <HStack justifyContent="left">
                        <Text>{props.sensor.name}</Text>
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
                    {props.sensor.isHeadMounted &&
                        <Text fontSize="xs" color="gray.500"
                              mt="0!important">{props.numHeads} heads</Text>
                    }
                    {/* {props.sensor.numHeads > 0 && props.sensor.numMechs > 0 && */}
                    {/*    <Text fontSize={"xs"} color={"gray.500"} mt={"0!important"}>{props.sensor.numMechs} mechs / */}
                    {/*        head</Text> */}
                    {/* } */}
                </VStack>
            </HStack>

            <HStack
                justifyContent="right"
            >
                <Button
                    colorScheme={getButtonColor()}
                    variant='outline'
                    disabled={allSensorsMonitored || (!allSensorsSelected && sensorLimitReached)}
                    onClick={() => {
                        if (allSensorsSelected)
                            handleRemoveAllSensorsButtonClick()
                        else
                            handleSelectAllSensorsButtonClick()
                    }}
                >
                    {getButtonText()}
                </Button>
            </HStack>
        </HStack>
        {
            descriptionExpanded &&
            <SensorDescription sensor={props.sensor} setDescriptionExpanded={setDescriptionExpanded}/>
        }
        {
            sensorExpanded &&
            props.sensor.isHeadMounted &&
            Array.from(Array(props.numHeads)).map((_, indexHead) => <HeadMechEntry
                key={indexHead}
                indexHead={indexHead + 1}
                sensor={props.sensor}
                selectedSensors={props.selectedSensors}
                setSelectedSensors={props.setSelectedSensors}
                sensorsMonitoring={props.sensorsMonitoring}
                numHeads={props.numHeads}
                numSensorsSelected={props.numSensorsSelected}
                setNumSensorsSelected={props.setNumSensorsSelected}
                maxSelectableSensors={props.maxSelectableSensors}
            />)
        }
        <Divider orientation="horizontal" w="full"/>
    </VStack>
}

const SensorDescription = (props: {
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
                    src={require('../../../../../../assets/machineries/EQUA.png')}
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

interface HeadMechEntryProps {
    indexHead: number
    sensor: Sensor
    selectedSensors: SensorDataFilter[]
    setSelectedSensors: React.Dispatch<React.SetStateAction<SensorDataFilters['sensors']>>
    sensorsMonitoring: SensorDataFilter[]
    numHeads: number
    numSensorsSelected: number
    setNumSensorsSelected: React.Dispatch<React.SetStateAction<number>>
    maxSelectableSensors: number
}

function HeadMechEntry(props: HeadMechEntryProps) {
    const [sensorLimitReached, setSensorLimitReached] = useState(false)
    const [sensorSelected, setSensorSelected] = useState(false)
    const [sensorMonitored, setSensorMonitored] = useState(false)

    // CHECK IF SENSOR IS SELECTED
    useEffect(() => {
        const foundEntry = props.selectedSensors.find((el) => (el.headNumber === props.indexHead))
        if (foundEntry != null)
            if (foundEntry.sensorNames.find((el) => (el.name === props.sensor.internalName)) !== undefined) {
                setSensorSelected(true)

                return
            }

        setSensorSelected(false)
    }, [props.selectedSensors, props.indexHead, props.sensor.internalName])

    // CHECK IF SENSOR IS ALREADY MONITORED
    useEffect(() => {
        const foundEntry = props.sensorsMonitoring.find((el) => (el.headNumber === props.indexHead))
        if (foundEntry != null)
            if (foundEntry.sensorNames.find((el) => (el.name === props.sensor.internalName)) !== undefined) {
                setSensorMonitored(true)

                return
            }

        setSensorMonitored(false)
    }, [props.sensorsMonitoring, props.indexHead, props.sensor.internalName])

    // CHECK IF LIMIT OF NUM SENSORS MONITORING REACHED
    useEffect(() => {
        if (props.numSensorsSelected >= props.maxSelectableSensors)
            setSensorLimitReached(true)
        else
            setSensorLimitReached(false)
    }, [props.numSensorsSelected, props.maxSelectableSensors])

    // SELECT SENSOR BUTTON CLICK
    function handleSelectSensorButtonClick() {
        const sensorCategory = props.sensor.category

        props.setSelectedSensors((val) => {
            const foundEntry = val[sensorCategory].find((el) => (el.headNumber === props.indexHead))
            if (foundEntry != null)
                foundEntry.sensorNames.push({
                    name: props.sensor.internalName,
                    color: colors[props.numSensorsSelected]
                })
            else
                val[sensorCategory].push({
                    headNumber: props.indexHead,
                    sensorNames: [{
                        name: props.sensor.internalName,
                        color: colors[props.numSensorsSelected]
                    }]
                })

            return {...val}
        })

        props.setNumSensorsSelected((val) => (val + 1))
    }

    // REMOVE SENSOR BUTTON CLICK
    function handleRemoveSensorButtonClick() {
        const sensorCategory = props.sensor.category

        props.setSelectedSensors((val) => {
            const foundEntry = val[sensorCategory].find((el) => (el.headNumber === props.indexHead))
            if (foundEntry != null) {
                foundEntry.sensorNames = foundEntry.sensorNames.filter((el) => (el.name !== props.sensor.internalName))
                if (foundEntry.sensorNames.length === 0)
                    val[sensorCategory] = val[sensorCategory].filter((el) => (el.headNumber !== props.indexHead))
            }

            return {...val}
        })

        props.setNumSensorsSelected((val) => (val - 1))
    }

    // GET BUTTON TEXT
    function getButtonText() {
        if (sensorMonitored)
            return 'Already monitoring'

        if (sensorSelected)
            return 'Remove'

        return 'Monitor'
    }

    // GET BUTTON COLOR - green/red/gray
    function getButtonColor() {
        if (sensorMonitored)
            return 'black'

        if (sensorSelected)
            return 'red'

        return 'teal'
    }

    return (
        <>
            <HStack
                pl={8}
                mt="1!important"
                w="full"
                justifyContent="space-between"
            >
                <Text>{`• Head ${props.indexHead}`}</Text>
                <Button
                    colorScheme={getButtonColor()}
                    variant='outline'
                    disabled={sensorMonitored || (!sensorSelected && sensorLimitReached)}
                    onClick={() => {
                        if (sensorSelected)
                            handleRemoveSensorButtonClick()
                        else
                            handleSelectSensorButtonClick()
                    }}
                >
                    {getButtonText()}
                </Button>
            </HStack>
            {
                (props.indexHead < props.numHeads) &&
                <Divider orientation="horizontal" mt="1!important"/>
            }
        </>
    )
}
