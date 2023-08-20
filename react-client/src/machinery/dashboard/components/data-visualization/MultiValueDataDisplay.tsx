import type GridWidget from '../../interfaces/GridWidget'
import React from 'react'
import type TooltipData from '../../interfaces/TooltipData'
import {Box, Button, CloseButton, Divider, HStack, IconButton, Text, VStack} from '@chakra-ui/react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ReferenceArea,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis
} from 'recharts'
import {
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsRight,
    FiMaximize,
    FiZoomIn,
    FiZoomOut
} from 'react-icons/fi'
import ChartFullscreenModal from '../modals/ChartFullscreenModal'
import Dot from './chart-components/Dot'
import type Sensor from '../../models/Sensor'
import PieTooltip from './chart-components/PieTooltip'
import QuickNavigateModal from '../modals/QuickNavigateModal'
import {useMultiValueDataDisplayLogic} from "./useMultiValueDataDisplayLogic";
import Dashboard from "../../models/Dashboard";

export interface MultiValueDataDisplayProps {
    widget: GridWidget
    widgetIndex: number
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    displayType: string
    availableSensors: Sensor[]
    loadingMoreSensorData: boolean
    loadMoreSensorData: () => void
    chartTooltipActive: boolean
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
    dataDisplaySize: { height: number, width: number }
}

export function MultiValueDataDisplay(props: MultiValueDataDisplayProps) {

    const {widget, availableSensors, loadMoreSensorData} = props;
    const {widgetIndex, setDashboard} = props;
    const {loadingMoreSensorData, setChartTooltip} = props;
    const {dataDisplaySize, chartTooltipActive, displayType} = props;

    const {type, sensorData, chartProps} = widget;
    const {sensorsMonitoringArray, aggregationsArray} = widget;


    const multiValueLogic = useMultiValueDataDisplayLogic(props);

    const {chartContainerRef, chartZoomSelector, quickNavigateChart} = multiValueLogic;
    const {
        chartFullscreenModalOpen,
        setChartFullscreenModalOpen,
        quickNavigateModalOpen,
        setQuickNavigateModalOpen,
        polarChartSensorData
    } = multiValueLogic;
    const {
        handleZoomChartButtonClicked,
        handlePanChartButtonClicked,
        handleChartMouseDown,
        handleChartMouseMove
    } = multiValueLogic;
    const {
        handleChartMouseUp,
        handleChartMouseLeave,
        legendNameTranslator,
        navigateToNewData,
        closeNewDataPopup
    } = multiValueLogic;

    return (
        <>
            <Box
                ref={chartContainerRef}
                // onWheel={(e) => (handleChartWheel(e))}
                onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}
            >
                {
                    type === 'line-chart' &&
                    <Box>
                        <ResponsiveContainer
                            width={dataDisplaySize.width}
                            height={dataDisplaySize.height}
                        >
                            <LineChart
                                data={sensorData.displayData}
                                onMouseMove={(a) => {
                                    handleChartMouseMove(a)
                                }}
                                onMouseDown={(a) => {
                                    handleChartMouseDown(a)
                                }}
                                onMouseUp={(a) => {
                                    handleChartMouseUp(a)
                                }}
                                onMouseLeave={handleChartMouseLeave}
                            >
                                <YAxis
                                    {...chartProps.yAxisProps}
                                    padding={{bottom: 10, top: 10}}
                                    type="number"
                                    tickFormatter={(value) => (value.toFixed(1))}
                                    domain={[chartProps.yAxisDataMin, chartProps.yAxisDataMax]}

                                />
                                <XAxis
                                    {...chartProps.xAxisProps}
                                    padding={{left: 10, right: 10}}
                                />

                                {
                                    !chartTooltipActive &&
                                    <Tooltip content={<></>}/>
                                }
                                <Tooltip trigger="click" content={<></>}/>

                                {
                                    displayType === 'fullscreen' &&
                                    <Legend
                                        iconType="circle"
                                        formatter={(value) => (legendNameTranslator(value))}
                                    />
                                }

                                {sensorsMonitoringArray.map((sensor) => (
                                    <Line key={sensor.internalName}
                                          type="linear"
                                          dataKey={`allData.${sensor.internalName}`}
                                          dot={aggregationsArray.length === 0 ? <Dot/> : false}
                                          activeDot={false}
                                          stroke={sensor.color}
                                          fill={sensor.color}
                                          isAnimationActive={false}
                                    />
                                ))}
                                {aggregationsArray.map((aggregation) => (
                                    <Line key={aggregation.name}
                                          type="linear"
                                          dataKey={`aggregationData.${aggregation.name}.value`}
                                          dot={<Dot/>}
                                          activeDot={false}
                                          stroke={aggregation.color}
                                          strokeWidth={2}
                                          fill={aggregation.color}
                                          isAnimationActive={false}
                                    />
                                ))}

                                {
                                    chartZoomSelector.startIndex !== -1 &&
                                    chartZoomSelector.endIndex !== -1 &&
                                    chartZoomSelector.startIndex !== chartZoomSelector.endIndex &&
                                    <ReferenceArea
                                        x1={sensorData.displayData[chartZoomSelector.startIndex].formattedTime}
                                        x2={sensorData.displayData[chartZoomSelector.endIndex].formattedTime}
                                        strokeOpacity={0.3}
                                    />
                                }

                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                }
                {
                    type === 'area-chart' &&
                    <ResponsiveContainer
                        width={dataDisplaySize.width}
                        height={dataDisplaySize.height}
                    >
                        <AreaChart
                            data={sensorData.displayData}
                            onMouseMove={(a) => {
                                handleChartMouseMove(a)
                            }}
                            onMouseDown={(a) => {
                                handleChartMouseDown(a)
                            }}
                            onMouseUp={(a) => {
                                handleChartMouseUp(a)
                            }}
                            onMouseLeave={handleChartMouseLeave}
                        >
                            <YAxis
                                {...chartProps.yAxisProps}
                                padding={{bottom: 10, top: 10}}
                                type="number"
                                tickFormatter={(value) => (value.toFixed(1))}
                                domain={[chartProps.yAxisDataMin, chartProps.yAxisDataMax]}
                            />
                            <XAxis
                                {...chartProps.xAxisProps}
                                padding={{left: 10, right: 10}}
                            />

                            {
                                !chartTooltipActive &&
                                <Tooltip content={<></>}/>
                            }
                            <Tooltip trigger="click" content={<></>}/>

                            {
                                displayType === 'fullscreen' &&
                                <Legend
                                    iconType="rect"
                                    formatter={(value) => (legendNameTranslator(value))}
                                />
                            }

                            {sensorsMonitoringArray.map((sensor) => (
                                <Area key={sensor.internalName}
                                      opacity={1}
                                      type="linear"
                                      dataKey={`allData.${sensor.internalName}`}
                                      dot={aggregationsArray.length === 0 ? <Dot/> : false}
                                      activeDot={false}
                                      stroke={sensor.color}
                                      fill={sensor.color}
                                      isAnimationActive={false}
                                />
                            ))}
                            {aggregationsArray.map((aggregation) => (
                                <Area key={aggregation.name}
                                      stackId="aggregation"
                                      type="linear"
                                      dataKey={`aggregationData.${aggregation.name}.value`}
                                      dot={<Dot/>}
                                      activeDot={false}
                                      stroke={aggregation.color}
                                      strokeWidth={2}
                                      fill={aggregation.color}
                                      isAnimationActive={false}
                                />
                            ))}

                            {
                                chartZoomSelector.startIndex !== -1 &&
                                chartZoomSelector.endIndex !== -1 &&
                                chartZoomSelector.startIndex !== chartZoomSelector.endIndex &&
                                <ReferenceArea
                                    x1={sensorData.displayData[chartZoomSelector.startIndex].formattedTime}
                                    x2={sensorData.displayData[chartZoomSelector.endIndex].formattedTime}
                                    strokeOpacity={0.3}
                                />
                            }

                        </AreaChart>
                    </ResponsiveContainer>
                }
                {
                    type === 'bar-chart' &&
                    <ResponsiveContainer
                        width={dataDisplaySize.width}
                        height={dataDisplaySize.height}
                    >
                        <BarChart
                            data={sensorData.displayData}
                            onMouseMove={(a) => {
                                handleChartMouseMove(a)
                            }}
                            onMouseDown={(a) => {
                                handleChartMouseDown(a)
                            }}
                            onMouseUp={(a) => {
                                handleChartMouseUp(a)
                            }}
                            onMouseLeave={handleChartMouseLeave}
                        >
                            <YAxis
                                {...chartProps.yAxisProps}
                                padding={{bottom: 10, top: 10}}
                                type="number"
                                tickFormatter={(value) => (value.toFixed(1))}
                                domain={[chartProps.yAxisDataMin, chartProps.yAxisDataMax]}
                            />
                            <XAxis
                                {...chartProps.xAxisProps}
                                padding={{left: 10, right: 10}}
                            />

                            {
                                !chartTooltipActive &&
                                <Tooltip content={<></>}/>
                            }
                            <Tooltip trigger="click" content={<></>}/>

                            {
                                displayType === 'fullscreen' &&
                                <Legend
                                    iconType="rect"
                                    formatter={(value) => (legendNameTranslator(value))}
                                />
                            }

                            {sensorsMonitoringArray.map((sensor) => (
                                <Bar key={sensor.internalName}
                                     type="linear"
                                     dataKey={`allData.${sensor.internalName}`}
                                     stroke={sensor.color}
                                     fill={sensor.color}
                                     isAnimationActive={false}
                                />
                            ))}
                            {aggregationsArray.map((aggregation) => (
                                <Bar key={aggregation.name}
                                     type="linear"
                                     dataKey={`aggregationData.${aggregation.name}.value`}
                                     stroke={aggregation.color}
                                     strokeWidth={2}
                                     fill={aggregation.color}
                                     isAnimationActive={false}
                                />
                            ))}

                            {
                                chartZoomSelector.startIndex !== -1 &&
                                chartZoomSelector.endIndex !== -1 &&
                                chartZoomSelector.startIndex !== chartZoomSelector.endIndex &&
                                <ReferenceArea
                                    x1={sensorData.displayData[chartZoomSelector.startIndex].formattedTime}
                                    x2={sensorData.displayData[chartZoomSelector.endIndex].formattedTime}
                                    strokeOpacity={0.3}
                                />
                            }
                        </BarChart>
                    </ResponsiveContainer>
                }
                {
                    type === 'pie-chart' &&
                    <>
                        <ResponsiveContainer width={dataDisplaySize.width}
                                             height={dataDisplaySize.height - 40}>
                            <PieChart>
                                {/* <YAxis/> */}
                                <Tooltip
                                    content={(props) => (
                                        <PieTooltip tooltipProps={props}/>
                                    )}
                                />
                                {
                                    sensorsMonitoringArray.map((sensor, index) => (
                                        <Pie
                                            key={sensor.internalName}
                                            cx="50%" cy="50%"
                                            innerRadius={polarChartSensorData.sectionSize * index / 2}
                                            outerRadius={(polarChartSensorData.sectionSize * index + (polarChartSensorData.sectionSize - 10)) / 2}
                                            data={polarChartSensorData.allData[sensor.internalName]}
                                            dataKey="occurrences"
                                            fill={sensor.color}
                                            isAnimationActive={false}
                                        />
                                    ))
                                }
                                {
                                    aggregationsArray.map((aggregation, index) => (
                                        <Pie
                                            key={aggregation.name}
                                            cx="50%" cy="50%"
                                            innerRadius={polarChartSensorData.sectionSize * index / 2}
                                            outerRadius={(polarChartSensorData.sectionSize * index + (polarChartSensorData.sectionSize - 10)) / 2}
                                            data={polarChartSensorData.aggregationData[aggregation.name]}
                                            dataKey="occurrences"
                                            fill={aggregation.color}
                                            isAnimationActive={false}
                                        />
                                    ))
                                }
                            </PieChart>
                        </ResponsiveContainer>
                        <HStack
                            mt="-8px!important"
                            mb={2}
                            px={2}
                            w="full"
                            justifyContent="space-between"
                        >
                            <Text fontWeight={400} color="gray.500">Starting
                                from {polarChartSensorData.startingFromTime}</Text>
                            <Button
                                size="sm"
                                variant="outline"
                                isLoading={loadingMoreSensorData}
                                loadingText="Loading"
                                disabled={sensorData.endOfData}
                                title={sensorData.endOfData ? 'All sensor data already loaded' : ''}
                                onClick={loadMoreSensorData}
                            >
                                Load previous
                            </Button>
                        </HStack>
                    </>
                }
                {
                    type === 'scatter-chart' &&
                    <ResponsiveContainer width={dataDisplaySize.width} height={dataDisplaySize.height}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="uv"/>
                            <YAxis dataKey="pv"/>
                            <ZAxis dataKey="amt"/>
                            <Tooltip position={{x: 50, y: 0}}/>
                            <Scatter data={sensorData.displayData} fill="#8884d8"/>
                        </ScatterChart>
                    </ResponsiveContainer>
                }

                {
                    ['line-chart', 'area-chart', 'bar-chart'].includes(type) &&
                    <>
                        <HStack
                            w={dataDisplaySize.width - chartProps.yAxisProps.width - 45}
                            position="absolute"
                            top="50px"
                            left={`${chartProps.yAxisProps.width + 45}px`}
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <IconButton
                                p={2}
                                variant="unstyled"
                                title="Move left"
                                disabled={sensorData.leftData.length === 0}
                                isLoading={sensorData.leftData.length === 0 && loadingMoreSensorData}
                                icon={<FiChevronLeft/>}
                                onClick={(e) => {
                                    handlePanChartButtonClicked(e, 'pan-left')
                                }}
                                aria-label="Pan left"
                                _hover={{
                                    bgColor: 'rgb(255,255,255, 0.75)',
                                    cursor: sensorData.leftData.length === 0 ? 'not-allowed' : 'pointer'
                                }}
                                style={{
                                    color: sensorData.leftData.length === 0 ? 'lightgray' : 'black'
                                }}
                            />
                            <HStack>
                                <IconButton
                                    p={2}
                                    variant="unstyled"
                                    title="Zoom in"
                                    disabled={sensorData.displayData.length <= 5}
                                    icon={<FiZoomIn/>}
                                    onClick={(e) => {
                                        handleZoomChartButtonClicked(e, 'zoom-in')
                                    }}
                                    aria-label="Zoom in"
                                    _hover={{
                                        bgColor: 'rgb(255,255,255, 0.75)'
                                    }}
                                />
                                <IconButton
                                    p={2}
                                    variant="unstyled"
                                    title="Zoom out"
                                    disabled={sensorData.leftData.length === 0 && sensorData.rightData.length === 0}
                                    icon={<FiZoomOut/>}
                                    onClick={(e) => {
                                        handleZoomChartButtonClicked(e, 'zoom-out')
                                    }}
                                    aria-label="Zoom out"
                                    _hover={{
                                        bgColor: 'rgb(255,255,255, 0.75)'
                                    }}
                                />
                                {
                                    displayType === 'dashboard' &&
                                    <>
                                        <IconButton
                                            p={2}
                                            variant="unstyled"
                                            title="Open in fullscreen"
                                            disabled={sensorData.displayData.length <= 5}
                                            icon={<FiMaximize/>}
                                            onClick={() => {
                                                setChartFullscreenModalOpen(true)
                                            }}
                                            aria-label="Open in fullscreen"
                                            _hover={{
                                                bgColor: 'rgb(255,255,255, 0.75)'
                                            }}
                                        />
                                        <IconButton
                                            p={2}
                                            variant="unstyled"
                                            title="Quick navigate"
                                            disabled={sensorData.displayData.length <= 5}
                                            icon={<FiCalendar/>}
                                            onClick={() => {
                                                setQuickNavigateModalOpen(true)
                                            }}
                                            aria-label="Quick navigate"
                                            _hover={{
                                                bgColor: 'rgb(255,255,255, 0.75)'
                                            }}
                                        />
                                    </>
                                }
                            </HStack>
                            <IconButton
                                p={2}
                                variant="unstyled"
                                title="Move right"
                                disabled={sensorData.rightData.length === 0}
                                icon={<FiChevronRight/>}
                                onClick={(e) => {
                                    handlePanChartButtonClicked(e, 'pan-right')
                                }}
                                aria-label="Pan right"
                                _hover={{
                                    bgColor: 'rgb(255,255,255, 0.75)',
                                    cursor: sensorData.rightData.length === 0 ? 'not-allowed' : 'pointer'
                                }}
                                style={{
                                    color: sensorData.rightData.length === 0 ? 'lightgray' : 'black'
                                }}
                            />
                        </HStack>
                        <HStack
                            w={dataDisplaySize.width - chartProps.yAxisProps.width - 70}
                            position="absolute"
                            top="35px"
                            left={`${chartProps.yAxisProps.width + 45}px`}
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Text
                                w="full"
                                textAlign="left"
                                fontSize="sm"
                                fontWeight={400}
                                color={"gray"}
                            >
                                {(sensorData.displayData.length > 0) ? sensorData.displayData[0].formattedTime : ''}
                            </Text>
                            <Text
                                w="full"
                                textAlign="center"
                                fontSize="sm"
                                fontWeight={400}
                                color={"gray"}
                            >
                                {sensorData.numSamplesDisplaying} samples
                            </Text>
                            <Text
                                w="full"
                                textAlign="right"
                                fontSize="sm"
                                fontWeight={400}
                                color={"gray"}
                            >
                                {(sensorData.displayData.length > 0) ? sensorData.displayData.slice(-1)[0].formattedTime : ''}
                            </Text>
                        </HStack>
                        {
                            sensorData.hasNewData &&
                            <VStack
                                alignItems="flex-end"
                                bgColor="white"
                                boxShadow="xl"
                                rounded="md"
                                borderWidth={1}
                                borderColor="gray.400"
                                position="absolute"
                                top={`${dataDisplaySize.height / 2}px`}
                                right="10px"
                                p={2}
                            >
                                <HStack
                                    w="full"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Text fontSize="md" fontWeight={650}>Update</Text>
                                    <CloseButton size="sm" onClick={closeNewDataPopup}/>
                                </HStack>
                                <Divider mt="0!important"/>
                                <HStack
                                    alignItems="center"
                                    _hover={{
                                        cursor: 'pointer'
                                    }}
                                    title="Navigate to new data"
                                    onClick={navigateToNewData}
                                >
                                    <Text fontSize="sm" textAlign="center">New samples<br/>available</Text>
                                    <FiChevronsRight/>
                                </HStack>
                            </VStack>
                        }
                    </>
                }
            </Box>
            {
                displayType === 'dashboard' &&
                chartFullscreenModalOpen &&
                <ChartFullscreenModal
                    widget={widget}
                    widgetIndex={widgetIndex}
                    setDashboard={setDashboard}
                    chartFullscreenModalOpen={chartFullscreenModalOpen}
                    setChartFullscreenModalOpen={setChartFullscreenModalOpen}
                    displayType="fullscreen"
                    dataDisplaySize={dataDisplaySize}
                    availableSensors={availableSensors}
                    loadingMoreSensorData={loadingMoreSensorData}
                    loadMoreSensorData={loadMoreSensorData}
                    chartTooltipActive={chartTooltipActive}
                    setChartTooltip={setChartTooltip}
                />
            }
            {
                quickNavigateModalOpen &&
                <QuickNavigateModal
                    widget={widget}
                    quickNavigateModalOpen={quickNavigateModalOpen}
                    setQuickNavigateModalOpen={setQuickNavigateModalOpen}
                    loadingMoreSensorData={loadingMoreSensorData}
                    loadMoreSensorData={loadMoreSensorData}
                    quickNavigateChart={quickNavigateChart}
                />
            }
        </>
    )
}
