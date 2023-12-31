import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type SensorData from '../../../../../../../models/SensorData'
import {Box, CloseButton, Divider, Heading, HStack, Text, VStack} from '@chakra-ui/react'
import type SensorMonitoring from '../../../../../../../interfaces/SensorMonitoring'
import type Aggregation from '../../../../../../../interfaces/Aggregation'
import dayjs from 'dayjs'
import type TooltipData from '../../../../../../../interfaces/TooltipData'
import {FiArrowDown, FiArrowUp} from 'react-icons/fi'

interface ChartTooltipProps {
    chartTooltipData: TooltipData
    setChartTooltipData: React.Dispatch<React.SetStateAction<TooltipData>>
}

export default function ChartTooltip(props: ChartTooltipProps) {

    const {chartTooltipData, setChartTooltipData} = props;

    const [tooltipPosition, setTooltipPosition] = useState<number[]>([])

    const tooltipRef = useRef<HTMLDivElement>(null)

    // CALCULATE POSITION (absolute) OF TOOLTIP
    const updateTooltipPosition = useCallback(() => {
        if (!tooltipRef || (tooltipRef.current == null)) return

        const ref = tooltipRef.current

        let finalTooltipX, finalTooltipY

        const tooltipWidth = ref.offsetWidth
        const tooltipHeight = ref.offsetHeight

        if (tooltipWidth === 0 || tooltipHeight === 0) return

        const chartX = chartTooltipData.chartCoordinate[0]
        const chartY = chartTooltipData.chartCoordinate[1]

        const tooltipX = chartTooltipData.clickCoordinate[0]
        const tooltipY = chartTooltipData.clickCoordinate[1]

        const windowWidth = window.innerWidth + window.scrollX
        const windowHeight = window.innerHeight + window.scrollY

        finalTooltipX = chartX + tooltipX + tooltipWidth
        if (finalTooltipX > windowWidth)
            finalTooltipX = windowWidth - tooltipWidth - 12
        else
            finalTooltipX -= tooltipWidth
        // finalTooltipX += window.scrollX

        finalTooltipY = chartY + tooltipY + tooltipHeight
        if (finalTooltipY > windowHeight)
            finalTooltipY = windowHeight - tooltipHeight - 12
        else
            finalTooltipY -= tooltipHeight
        // finalTooltipY += window.scrollY

        setTooltipPosition([~~finalTooltipX, ~~finalTooltipY])
    }, [chartTooltipData, setTooltipPosition])

    // WINDOW RESIZE LISTENER - to KEEP TOOLTIP POSITION UPDATED
    useEffect(() => {
        if (!tooltipRef || (tooltipRef.current == null)) return undefined;

        const current = tooltipRef.current;

        current.addEventListener('resize', updateTooltipPosition)
        if (tooltipRef)
            updateTooltipPosition()

        return () => {
            if (!tooltipRef || (current == null)) return;
            current.removeEventListener('resize', updateTooltipPosition)
        }
    }, [tooltipRef, updateTooltipPosition])

    // TRIGGER TOOLTIP REPOSITIONING
    useEffect(() => {
        updateTooltipPosition()
    }, [chartTooltipData.chartCoordinate, chartTooltipData.clickCoordinate, updateTooltipPosition])


    // CALCULATE WHAT TO SHOW IN TOOLTIP
    const sensorsToDisplayValue = useMemo(() => {
        const payload = chartTooltipData.sensorData[0].payload as SensorData
        const sensorsMonitoringObject = chartTooltipData.sensorsMonitoringObject

        if (Object.keys(payload.aggregationData).length === 0)
            return Object.entries(payload.activeData).map(([sensorInternalName, sensorValue]) => {
                let diff = ''
                if (chartTooltipData.sensorDataIndex > 0 && sensorValue !== null) {
                    const prevIndex = chartTooltipData.sensorDataIndex - 1
                    if (chartTooltipData.displayData[prevIndex].allData.hasOwnProperty(sensorInternalName) &&
                        chartTooltipData.displayData[prevIndex].allData[sensorInternalName] !== null
                    )
                        diff = (sensorValue - (chartTooltipData.displayData[prevIndex].allData[sensorInternalName] || 0)).toFixed(2)
                } else if (chartTooltipData.leftData.length > 0 && sensorValue !== null) {
                    const prevSensorData = chartTooltipData.leftData.slice(-1)
                    if (
                        prevSensorData.length > 0 &&
                        prevSensorData[0].allData.hasOwnProperty(sensorInternalName) &&
                        prevSensorData[0].allData[sensorInternalName] !== null
                    )
                        diff = (sensorValue - (prevSensorData[0].allData[sensorInternalName] || 0)).toFixed(2)
                }

                const sensorMonitoringEntry = sensorsMonitoringObject[sensorInternalName]

                if (sensorMonitoringEntry)
                    return {
                        color: sensorMonitoringEntry.color,
                        name: sensorMonitoringEntry.name,
                        value: sensorValue?.toFixed(2),
                        unit: sensorMonitoringEntry.unit,
                        diff
                    }

                return {
                    color: '',
                    name: '',
                    value: 'N/A',
                    unit: '',
                    diff: ''
                }
            }).sort((a, b) => {
                if (a.value === 'N/A' && b.value === 'N/A') return 0
                if (a.value === 'N/A') return 1
                if (b.value === 'N/A') return -1

                return Number(b.value) - Number(a.value)
            })

        return Object.entries(payload.aggregationData).map(([aggregationName, aggregationValue]) => {
            const aggregationEntry = chartTooltipData.aggregationsArray.find((el: Aggregation) => (el.name === aggregationName))
            const sensorEntry = chartTooltipData.sensorsMonitoringArray.find((el: SensorMonitoring) => (aggregationValue.note.endsWith(el.internalName)))

            let diff = ''
            if (chartTooltipData.sensorDataIndex > 0) {
                const prevIndex = chartTooltipData.sensorDataIndex - 1
                if (chartTooltipData.displayData[prevIndex].aggregationData.hasOwnProperty(aggregationName))
                    diff = (aggregationValue.value - chartTooltipData.displayData[prevIndex].aggregationData[aggregationName].value).toFixed(2)
            } else if (chartTooltipData.leftData.length > 0) {
                const prevSensorData = chartTooltipData.leftData.slice(-1)
                if (
                    prevSensorData.length > 0 &&
                    prevSensorData[0].aggregationData.hasOwnProperty(aggregationName)
                )
                    diff = (aggregationValue.value - prevSensorData[0].aggregationData[aggregationName].value).toFixed(2)
            }

            if (aggregationEntry != null)
                return {
                    color: aggregationEntry.color,
                    name: aggregationEntry.name,
                    note: (sensorEntry != null) ? sensorEntry.name : aggregationValue.note,
                    value: aggregationValue.value,
                    unit: aggregationEntry.unit,
                    diff
                }

            return {
                color: '',
                name: '',
                value: 'N/A',
                unit: '',
                diff: ''
            }
        }).sort((a, b) => {
            if (a.value === 'N/A' && b.value === 'N/A') return 0
            if (a.value === 'N/A') return 1
            if (b.value === 'N/A') return -1

            return Number(b.value) - Number(a.value)
        })
    }, [chartTooltipData])

    // CALCULATE TIME THE MACHINERY WAS OFF - if it was off at this time
    function getHoursMachineryOff() {
        const from = chartTooltipData.sensorData[0].payload.machineryOffFrom
        const to = chartTooltipData.sensorData[0].payload.machineryOffTo
        const diff = ~~((to - from) / 3600000)

        if (diff < 24)
            return `${diff} hours`

        return `${~~(diff / 24)} days`
    }

    // FORMAT DIFF
    function getDiff(diff: string) {
        if (!diff) return ''

        if (diff === '0.0' || diff === '-0.0')
            return <Text fontWeight={400} fontSize="sm" pl={2}>No change</Text>
        else if (parseFloat(diff) < 0)
            return <>
                <Text fontWeight={400} fontSize="sm" pl={2}>{diff}</Text>
                <FiArrowDown/>
            </>

        return <>
            <Text fontWeight={400} fontSize="sm" pl={2}>+{diff}</Text>
            <FiArrowUp/>
        </>
    }

    // STOP SHOWING TOOLTIP
    function handleCloseTooltip() {
        setChartTooltipData((val) => {
            val.active = false

            return {...val}
        })
    }

    return (

        <Box
            ref={tooltipRef}
            zIndex={1500}
            position="absolute"
            visibility={tooltipPosition.length === 0 ? 'hidden' : 'visible'}
            top={0}
            left={0}
            transform={`translate(${tooltipPosition[0]}px, ${tooltipPosition[1]}px)`}
            onMouseDown={(e) => {
                e.stopPropagation()
            }}
        >
            <VStack
                w="fit-content"
                boxShadow="xl"
                rounded="xl"
                bg="white"
                borderWidth={1}
                borderColor="gray.400"
                p={2}
                alignItems="left"
            >
                {
                    !chartTooltipData.sensorData[0].payload.machineryOff &&
                    <>
                        <HStack
                            w="full"
                            justifyContent="space-between"
                        >
                            <Heading size="sm" whiteSpace="nowrap" w="full"
                                     textAlign="center">{chartTooltipData.label}</Heading>
                            <CloseButton size="md" onClick={handleCloseTooltip}/>
                        </HStack>
                        <Divider orientation="horizontal"/>
                        <VStack
                            maxH="300px"
                            overflowY="auto"
                            alignItems="left"
                        >
                            {
                                sensorsToDisplayValue.map((sensorData: any, index: number) => (
                                        <HStack key={index} justifyContent="space-between">
                                            <HStack>
                                                <Box boxSize={6}
                                                     bgColor={sensorData.color}
                                                     borderRadius="md"/>
                                                <HStack alignItems="baseline">
                                                    <Text>{sensorData.name}</Text>
                                                    {
                                                        sensorData.hasOwnProperty('note') &&
                                                        <Text fontSize="xs"
                                                              color="gray.400"
                                                        >
                                                            {sensorData.note}
                                                        </Text>
                                                    }
                                                </HStack>

                                            </HStack>
                                            <HStack
                                                alignItems="space-between"
                                            >
                                                <Text fontWeight={600}
                                                      pl={2}>{sensorData.value} {sensorData.unit}</Text>
                                                <HStack
                                                    w="90px"
                                                    justifyContent="right"
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
                    chartTooltipData.sensorData[0].payload.machineryOff &&
                    <HStack
                        alignItems="flex-start"
                    >
                        <VStack
                            alignItems="justifyContent"
                        >
                            <Text fontSize="md" fontWeight={600}>Machinery OFF for {getHoursMachineryOff()}</Text>
                            <Text fontSize="sm" mt="0!important"
                                  fontWeight={400}>From {dayjs(chartTooltipData.sensorData[0].payload.machineryOffFrom).format('D MMM YYYY HH:mm')}</Text>
                            <Text fontSize="sm" mt="0!important"
                                  fontWeight={400}>To {dayjs(chartTooltipData.sensorData[0].payload.machineryOffTo).format('D MMM YYYY HH:mm')}</Text>
                        </VStack>
                        <CloseButton size="md" onClick={handleCloseTooltip}/>
                    </HStack>
                }
            </VStack>
        </Box>

    )
}
