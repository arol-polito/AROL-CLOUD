import type GridWidget from '../../../../../interfaces/GridWidget'
import type SensorMonitoring from '../../../../../interfaces/SensorMonitoring'
import type SlidingSensorData from '../../../../../interfaces/SlidingSensorData'
import React, {memo} from 'react'
import {Divider, HStack, Text, VStack} from '@chakra-ui/react'
import {FiArrowDown, FiArrowUp} from 'react-icons/fi'
import GaugeChart from 'react-gauge-chart'
import Thermometer from 'react-thermometer-ecotropy'
import {useSingleValueDataDisplayLogic} from "./useSingleValueDataDisplayLogic";

export interface SingleValueDataDisplayProps {
    widget: GridWidget
    sensorMonitoring: SensorMonitoring
    sensorData: SlidingSensorData
}

function SingleValueDataDisplay(props: SingleValueDataDisplayProps) {

    const {widget, sensorMonitoring} = props;
    const {sensorDataToDisplay, getSensorDataTimeOfSampling} = useSingleValueDataDisplayLogic(props);

    const {dataDisplaySize} = widget;

    return (
        <VStack
            h={dataDisplaySize.height /* Account for top margin */}
            maxH={dataDisplaySize.height}
            w="full"
            px={2}
            alignItems="center"
            overflowY="auto"
        >
            {
                (sensorDataToDisplay != null) &&
                <>
                    {
                        widget.type === 'current-value' &&
                        <VStack>
                            <HStack
                                w="full"
                            >
                                <Text
                                    fontSize={48}>{sensorDataToDisplay.value !== '' ? sensorDataToDisplay.value : 'N/A'}</Text>
                                <VStack
                                    alignItems="left"
                                >
                                    <Text fontSize="sm">{sensorMonitoring.name}</Text>
                                    <Text fontSize="lg" fontWeight={500}
                                          mt="0!important">{sensorMonitoring.unit}</Text>
                                </VStack>
                                {
                                    sensorDataToDisplay.valueDiff &&
                                    <>
                                        <Divider orientation="vertical" h="55px"/>
                                        <VStack>
                                            <Text fontSize="sm" fontWeight={300}
                                                  mb="0!important">Difference</Text>
                                            <HStack
                                                alignItems="center"
                                                mt="0!important"
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
                                                    h="full"
                                                    fontSize={24}
                                                >
                                                    {Number(sensorDataToDisplay.valueDiff) >= 0 ? `+${sensorDataToDisplay.valueDiff}` : sensorDataToDisplay.valueDiff}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </>
                                }
                            </HStack>
                            <Text fontSize="sm" fontWeight={300} color="gray.500"
                                  mt="0!important">{getSensorDataTimeOfSampling()}</Text>
                        </VStack>
                    }
                    {
                        widget.type === 'thermostat' &&
                        <VStack
                            h="full"
                            w="full"
                        >
                            <HStack
                                w="full"
                                alignItems="center"
                                onMouseDown={(e) => {
                                    e.stopPropagation()
                                }}
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
                                        height={dataDisplaySize.height - 45}
                                    />
                                </VStack>
                                <VStack
                                    alignItems="center"
                                    flexGrow={1}
                                >
                                    <Text fontSize="sm" textAlign="center">{sensorMonitoring.name}</Text>
                                    <Divider orientation="horizontal"/>
                                    <Text
                                        fontSize={40}>{sensorDataToDisplay ? sensorDataToDisplay.value : 'N/A'}</Text>
                                    <Text fontSize="md" fontWeight={500}
                                          mt="0!important">{sensorMonitoring.unit}</Text>
                                    {
                                        sensorDataToDisplay.valueDiff &&
                                        <>
                                            <Divider orientation="horizontal"/>
                                            <VStack>
                                                <Text fontSize="sm" fontWeight={300}
                                                      mb="0!important">Difference</Text>
                                                <HStack
                                                    alignItems="center"
                                                    mt="0!important"
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
                                                        h="full"
                                                        fontSize={24}
                                                    >
                                                        {Number(sensorDataToDisplay.valueDiff) >= 0 ? `+${sensorDataToDisplay.valueDiff}` : sensorDataToDisplay.valueDiff}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </>
                                    }
                                </VStack>
                            </HStack>
                            <Text fontSize="sm" fontWeight={300} color="gray.500"
                                  pt={1}>{getSensorDataTimeOfSampling()}</Text>
                        </VStack>
                    }
                    {
                        widget.type === 'tachometer' &&
                        <VStack>
                            <GaugeChart
                                id="gauge-chart3"
                                animate={false}
                                nrOfLevels={1}
                                colors={['#8884d8']}
                                percent={isNaN(parseFloat(sensorDataToDisplay.value)) ? 0 : parseFloat(sensorDataToDisplay.value) / sensorDataToDisplay.maxValue}
                                arcWidth={0.3}
                                hideText
                            />
                            <HStack
                                w="full"
                                justifyContent="center"
                            >
                                <Text
                                    fontSize={32}>{sensorDataToDisplay.value ? sensorDataToDisplay.value : 'N/A'}</Text>
                                <VStack
                                    alignItems="left"
                                >
                                    <Text fontSize="xs">{sensorMonitoring.name}</Text>
                                    <Text fontSize="md" fontWeight={500}
                                          mt="0!important">{sensorMonitoring.unit}</Text>
                                </VStack>
                                {
                                    sensorDataToDisplay.valueDiff &&
                                    <>
                                        <Divider orientation="vertical" h="55px"/>
                                        <VStack>
                                            <Text fontSize="xs" fontWeight={300}
                                                  mb="0!important">Difference</Text>
                                            <HStack
                                                alignItems="center"
                                                mt="0!important"
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
                                                    h="full"
                                                    fontSize={16}
                                                >
                                                    {Number(sensorDataToDisplay.valueDiff) >= 0 ? `+${sensorDataToDisplay.valueDiff}` : sensorDataToDisplay.valueDiff}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </>
                                }
                            </HStack>
                            <Text fontSize="sm" fontWeight={300} color="gray.500"
                                  mt="0!important">{getSensorDataTimeOfSampling()}</Text>
                        </VStack>
                    }
                </>
            }

        </VStack>
    )
}

export default memo(SingleValueDataDisplay)
