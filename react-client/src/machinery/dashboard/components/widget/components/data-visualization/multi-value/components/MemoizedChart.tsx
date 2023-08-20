import React, {useMemo} from "react";
import {Box, Button, HStack, Text} from "@chakra-ui/react";
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
} from "recharts";
import Dot from "./chart-components/Dot";
import PieTooltip from "./chart-components/PieTooltip";
import GridWidget from "../../../../../../interfaces/GridWidget";

export interface ChartProps {
    widget: GridWidget
    displayType: string
    loadMoreSensorData: () => void
    chartTooltipActive: boolean
    multiValueLogic: any
}

export const MemoizedChart = (props: ChartProps) => {

    const {
        widget,
        displayType,
        loadMoreSensorData,
        chartTooltipActive,
        multiValueLogic
    } = props;


    const {type, chartProps, sensorData, sensorsMonitoringArray} = widget;
    const {aggregationsArray, polarChartSensorData, sensorDataCacheLoading} = widget;
    const {chartNumChange, dataDisplaySize} = widget;

    const {chartZoomSelector, handleChartMouseDown, handleChartMouseMove} = multiValueLogic;
    const {handleChartMouseUp, handleChartMouseLeave, legendNameTranslator} = multiValueLogic;

    const chart = useMemo(
        () =>
            <>
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
                                isLoading={sensorDataCacheLoading}
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
            </>,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [chartNumChange, chartProps]
    )

    return (chart)

}