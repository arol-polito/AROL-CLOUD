import React, {useRef, useState} from "react";
import {MultiValueDataDisplayProps} from "./MultiValueDataDisplay";
import SlidingSensorData from "../../interfaces/SlidingSensorData";
import {calculateChartProps, setNewWidgetSensorData} from "../../utils";

interface ChartZoom {
    zoomAmount: number
    pivotIndex: number
}

interface ChartPan {
    doPan: boolean
    panAmount: number
}

interface ChartZoomSelector {
    lastTooltipIndex: number
    originIndex: number
    startIndex: number
    endIndex: number
}

export const useMultiValueDataDisplayLogic = (props: MultiValueDataDisplayProps) => {

    const {setDashboard, widget, widgetIndex, availableSensors} = props;
    const {loadingMoreSensorData, loadMoreSensorData, setChartTooltip} = props;
    const {dataDisplaySize} = props;

    const {sensorsMonitoringArray, aggregationsArray, sensorData} = widget;
    const {sensorsMonitoringObject} = widget;

    const chartContainerRef = useRef<HTMLDivElement>(null)

    const [chartZoomSelector, setChartZoomSelector] = useState<ChartZoomSelector>({
        originIndex: -1,
        endIndex: -1,
        startIndex: -1,
        lastTooltipIndex: -1
    })

    const [chartFullscreenModalOpen, setChartFullscreenModalOpen] = useState(false)
    const [quickNavigateModalOpen, setQuickNavigateModalOpen] = useState(false)
    const [polarChartSensorData, setPolarChartSensorData] = useState({
        allData: {},
        aggregationData: {},
        sectionSize: 0,
        startingFromTime: ''
    })

    // FORMAT DATA FOR POLAR CHART
    const calculatePolarChartSensorData = (sensorData: SlidingSensorData) => {
        // useEffect(() => {
        if (!['pie-chart', 'scatter-chart'].includes(widget.type)) return

        setPolarChartSensorData((val) => {
            const bucketSize = 1
            val = {
                allData: {},
                aggregationData: {},
                sectionSize: val.sectionSize,
                startingFromTime: val.startingFromTime
            }

            const allSensorData = [...sensorData.leftData, ...sensorData.displayData, ...sensorData.rightData]

            val.startingFromTime = allSensorData.length > 0 ? allSensorData[0].formattedTime : ''

            sensorsMonitoringArray.forEach((sensorMonitoring) => {
                const allDataMap = new Map<string, number>()
                allSensorData
                    .forEach((el) => {
                        if (!el.activeData.hasOwnProperty(sensorMonitoring.internalName) || el.activeData[sensorMonitoring.internalName] === null) return
                        const key = (~~((el.activeData[sensorMonitoring.internalName] || 0) / bucketSize)).toString()
                        if (allDataMap.has(key)) {
                            const occurrences = allDataMap.get(key) || 0
                            allDataMap.set(key, occurrences + 1)
                        } else
                            allDataMap.set(key, 1)
                    })

                const bucketArray: any[] = []
                for (const [key, value] of Array.from(allDataMap.entries()))
                    bucketArray.push({
                        bucketStart: (~~key) * bucketSize,
                        bucketEnd: ((~~key) + 1) * bucketSize,
                        sensorUnit: sensorMonitoring.unit,
                        sensorName: sensorMonitoring.name,
                        occurrences: value
                    })

                val.allData[sensorMonitoring.internalName] = bucketArray
            })
            aggregationsArray.forEach((aggregation) => {
                const allDataMap = new Map<string, number>()
                allSensorData
                    .forEach((el) => {
                        if (!el.aggregationData.hasOwnProperty(aggregation.name) || el.aggregationData[aggregation.name].value === null) return
                        const key = (~~(el.aggregationData[aggregation.name].value / bucketSize)).toString()
                        if (allDataMap.has(key)) {
                            const occurrences = allDataMap.get(key) || 0
                            allDataMap.set(key, occurrences + 1)
                        } else
                            allDataMap.set(key, 1)
                    })

                const bucketArray: any[] = []
                for (const [key, value] of Array.from(allDataMap.entries()))
                    bucketArray.push({
                        bucketStart: (~~key) * bucketSize,
                        bucketEnd: ((~~key) + 1) * bucketSize,
                        sensorUnit: aggregation.unit,
                        sensorName: aggregation.name,
                        occurrences: value
                    })

                val.aggregationData[aggregation.name] = bucketArray
            })

            return val
        })
    }
    // }, [sensorsMonitoringArray, aggregationsArray, sensorData, widget.type])

    // PIE CHART LEVEL SIZE
    const calculatePieChartSensorData = () => {
        if (widget.type !== 'pie-chart') return

        setPolarChartSensorData((val) => {
            const numSectionsNeeded = sensorsMonitoringArray.length + aggregationsArray.length
            let shortestDimension = Math.min(dataDisplaySize.width, dataDisplaySize.height)
            if (dataDisplaySize.height - shortestDimension < 40)
                shortestDimension = dataDisplaySize.height - 40

            const resultingSectionSize = ~~(shortestDimension / numSectionsNeeded)
            if (resultingSectionSize < 30)
                val.sectionSize = 30
            else
                val.sectionSize = resultingSectionSize

            return {...val}
        })
    }

    const zoomChart = (chartZoom: ChartZoom) => {

        const zoomIn = chartZoom.zoomAmount < 0
        const zoomOut = chartZoom.zoomAmount > 0

        let zoomAmount = Math.abs(chartZoom.zoomAmount)


        const labelIndex = chartZoom.pivotIndex

        const xAxisMiddleIndex = ~~(sensorData.displayData.length / 2)

        const displayDataLength = sensorData.displayData.length
        const rightDataLength = sensorData.rightData.length
        const leftDataLength = sensorData.leftData.length

        if (zoomIn && displayDataLength <= 5)
            return sensorData

        if (zoomIn && displayDataLength - zoomAmount <= 5)
            zoomAmount = displayDataLength - 5

        if (zoomOut && (leftDataLength === 0 && rightDataLength === 0))
            return sensorData

        // Remove or add ticks from right
        if (labelIndex < xAxisMiddleIndex) {
            if (zoomIn) {
                sensorData.numSamplesDisplaying -= sensorData.displayData.slice(displayDataLength - zoomAmount, displayDataLength).filter((el) => (!el.machineryOff)).length

                sensorData.rightData = [...sensorData.rightData, ...sensorData.displayData.slice(displayDataLength - zoomAmount, displayDataLength).reverse()]
                sensorData.displayData = sensorData.displayData.slice(0, displayDataLength - zoomAmount)
            } else if (zoomOut)
                if (rightDataLength) {
                    zoomAmount = (zoomAmount <= rightDataLength) ? zoomAmount : rightDataLength

                    sensorData.numSamplesDisplaying += sensorData.rightData.slice(rightDataLength - zoomAmount, rightDataLength).filter((el) => (!el.machineryOff)).length

                    sensorData.displayData = [...sensorData.displayData, ...sensorData.rightData.slice(rightDataLength - zoomAmount, rightDataLength).reverse()]
                    sensorData.rightData = sensorData.rightData.slice(0, rightDataLength - zoomAmount)
                } else if (leftDataLength) {
                    zoomAmount = (zoomAmount <= leftDataLength) ? zoomAmount : leftDataLength

                    sensorData.numSamplesDisplaying += sensorData.leftData.slice(leftDataLength - zoomAmount, leftDataLength).filter((el) => (!el.machineryOff)).length

                    sensorData.displayData = [...sensorData.leftData.slice(leftDataLength - zoomAmount, leftDataLength), ...sensorData.displayData]
                    sensorData.leftData = sensorData.leftData.slice(0, leftDataLength - zoomAmount)
                }
        }
        // Remove or add ticks from left
        else if ((labelIndex > xAxisMiddleIndex)) {
            // console.log("rm left")
            if (zoomIn) {
                sensorData.numSamplesDisplaying -= sensorData.displayData.slice(0, zoomAmount).filter((el) => (!el.machineryOff)).length

                sensorData.leftData.push(...sensorData.displayData.slice(0, zoomAmount))
                sensorData.displayData = sensorData.displayData.slice(zoomAmount, displayDataLength)
            } else if (zoomOut)
                if (leftDataLength) {
                    zoomAmount = (zoomAmount <= leftDataLength) ? zoomAmount : leftDataLength

                    sensorData.numSamplesDisplaying += sensorData.leftData.slice(leftDataLength - zoomAmount, leftDataLength).filter((el) => (!el.machineryOff)).length

                    sensorData.displayData = [...sensorData.leftData.slice(leftDataLength - zoomAmount, leftDataLength), ...sensorData.displayData]
                    sensorData.leftData = sensorData.leftData.slice(0, leftDataLength - zoomAmount)
                } else if (rightDataLength) {
                    zoomAmount = (zoomAmount <= rightDataLength) ? zoomAmount : rightDataLength

                    sensorData.numSamplesDisplaying += sensorData.rightData.slice(rightDataLength - zoomAmount, rightDataLength).filter((el) => (!el.machineryOff)).length

                    sensorData.displayData = [...sensorData.displayData, ...sensorData.rightData.slice(rightDataLength - zoomAmount, rightDataLength).reverse()]
                    sensorData.rightData = sensorData.rightData.slice(0, rightDataLength - zoomAmount)
                }
        }
        // Remove or add ticks from left and right
        else {
            zoomAmount = ~~Math.max(zoomAmount / 2, 1)

            if (zoomIn) {
                sensorData.numSamplesDisplaying -= sensorData.displayData.slice(displayDataLength - zoomAmount, displayDataLength).filter((el) => (!el.machineryOff)).length
                sensorData.numSamplesDisplaying -= sensorData.displayData.slice(0, zoomAmount).filter((el) => (!el.machineryOff)).length

                sensorData.rightData = [...sensorData.rightData, ...sensorData.displayData.slice(displayDataLength - zoomAmount, displayDataLength).reverse()]
                sensorData.leftData = [...sensorData.leftData, ...sensorData.displayData.slice(0, zoomAmount)]

                sensorData.displayData = sensorData.displayData.slice(zoomAmount, displayDataLength - zoomAmount)
            } else if (zoomOut) {
                if (rightDataLength) {
                    zoomAmount = (zoomAmount <= rightDataLength) ? zoomAmount : rightDataLength

                    sensorData.numSamplesDisplaying += sensorData.rightData.slice(rightDataLength - zoomAmount, rightDataLength).filter((el) => (!el.machineryOff)).length

                    sensorData.displayData = [...sensorData.displayData, ...sensorData.rightData.slice(rightDataLength - zoomAmount, rightDataLength).reverse()]
                    sensorData.rightData = sensorData.rightData.slice(0, rightDataLength - zoomAmount)
                }

                if (leftDataLength) {
                    zoomAmount = (zoomAmount <= leftDataLength) ? zoomAmount : leftDataLength

                    sensorData.numSamplesDisplaying += sensorData.leftData.slice(leftDataLength - zoomAmount, leftDataLength).filter((el) => (!el.machineryOff)).length

                    sensorData.displayData = [...sensorData.leftData.slice(leftDataLength - zoomAmount, leftDataLength), ...sensorData.displayData]
                    sensorData.leftData = sensorData.leftData.slice(0, leftDataLength - zoomAmount)
                }
            }
        }

        if (sensorData.leftData.length < 5 && !loadingMoreSensorData && !sensorData.endOfData)
            loadMoreSensorData();

        if (sensorData.rightData.length === 0)
            sensorData.hasNewData = false

        setNewWidgetSensorData(
            setDashboard,
            widgetIndex,
            sensorData,
            calculateChartProps(sensorData, widget.chartProps)
        )

        return {...sensorData}

    }

    // CHART ZOOM - using click & drag selector
    const zoomChartClickAndDrag = (chartZoomSelector: ChartZoomSelector) => {

        sensorData.leftData.push(...sensorData.displayData.slice(0, chartZoomSelector.startIndex))
        sensorData.rightData.push(...sensorData.displayData.slice(chartZoomSelector.endIndex + 1).reverse())
        sensorData.displayData = sensorData.displayData.slice(chartZoomSelector.startIndex, chartZoomSelector.endIndex + 1)

        sensorData.numSamplesDisplaying = sensorData.displayData.filter((el) => (!el.machineryOff)).length

        setNewWidgetSensorData(
            setDashboard,
            widgetIndex,
            sensorData,
            calculateChartProps(sensorData, widget.chartProps)
        )

    }

    // Chart PAN
    const panChart = (chartPan: ChartPan) => {

        const panAmount = chartPan.panAmount

        const displayDataLength = sensorData.displayData.length
        const rightDataLength = sensorData.rightData.length
        const leftDataLength = sensorData.leftData.length

        let moveAmount = Math.abs(panAmount)

        if (panAmount < 0 && rightDataLength > 0) {
            // Move right
            moveAmount = (moveAmount <= rightDataLength) ? moveAmount : rightDataLength

            sensorData.numSamplesDisplaying += sensorData.rightData.slice(-moveAmount, rightDataLength).filter((el) => (!el.machineryOff)).length
            sensorData.numSamplesDisplaying -= sensorData.displayData.slice(0, moveAmount).filter((el) => (!el.machineryOff)).length

            sensorData.leftData = [...sensorData.leftData, ...sensorData.displayData.slice(0, moveAmount)]
            sensorData.displayData = [...sensorData.displayData.slice(moveAmount, displayDataLength), ...sensorData.rightData.slice(-moveAmount, rightDataLength).reverse()]
            sensorData.rightData = sensorData.rightData.slice(0, -moveAmount)
        } else if (panAmount > 0 && leftDataLength > 0) {
            // Move left
            moveAmount = (moveAmount <= leftDataLength) ? moveAmount : leftDataLength

            sensorData.numSamplesDisplaying += sensorData.leftData.slice(leftDataLength - moveAmount, leftDataLength).filter((el) => (!el.machineryOff)).length
            sensorData.numSamplesDisplaying -= sensorData.displayData.slice(displayDataLength - moveAmount, displayDataLength).slice(0, moveAmount).filter((el) => (!el.machineryOff)).length

            sensorData.rightData = [...sensorData.rightData, ...sensorData.displayData.slice(displayDataLength - moveAmount, displayDataLength).reverse()]
            sensorData.displayData = [...sensorData.leftData.slice(leftDataLength - moveAmount, leftDataLength), ...sensorData.displayData.slice(0, displayDataLength - moveAmount)]
            sensorData.leftData = sensorData.leftData.slice(0, leftDataLength - moveAmount)
        }

        if (sensorData.leftData.length < 5 && !loadingMoreSensorData && !sensorData.endOfData)
            loadMoreSensorData();

        if (sensorData.rightData.length === 0)
            sensorData.hasNewData = false

        setNewWidgetSensorData(
            setDashboard,
            widgetIndex,
            sensorData,
            calculateChartProps(sensorData, widget.chartProps)
        )

    }

    const quickNavigateChart = (chartQuickNavigate: number) => {

        const numSamplesToDisplay = sensorData.displayData.length

        const allSensorData = [...sensorData.leftData, ...sensorData.displayData, ...sensorData.rightData.reverse()]
        const selectedIndex = (allSensorData.length - 1) - chartQuickNavigate

        let numSamplesNeededLeft = Math.round(numSamplesToDisplay / 2)
        let numSamplesNeededRight = Math.floor(numSamplesToDisplay / 2)

        let indexLeft, indexRight

        if (selectedIndex - numSamplesNeededLeft < 0) {
            indexLeft = 0
            numSamplesNeededRight += numSamplesNeededLeft - selectedIndex
            numSamplesNeededLeft -= selectedIndex
        } else {
            indexLeft = selectedIndex - numSamplesNeededLeft
            numSamplesNeededLeft = 0
        }

        if (selectedIndex + numSamplesNeededRight > allSensorData.length - 1) {
            indexRight = allSensorData.length - 1
            numSamplesNeededLeft += (numSamplesNeededRight - (allSensorData.length - 1 - selectedIndex))
        } else
            indexRight = selectedIndex + numSamplesNeededRight

        if (numSamplesNeededLeft > 0 && indexLeft > 0)
            if (indexLeft - numSamplesNeededLeft < 0)
                indexLeft = 0
            else
                indexLeft -= numSamplesNeededLeft

        sensorData.leftData = allSensorData.slice(0, indexLeft)
        sensorData.displayData = allSensorData.slice(indexLeft, indexRight)
        sensorData.rightData = allSensorData.slice(indexRight).reverse()

        sensorData.numSamplesDisplaying = sensorData.displayData.filter((el) => (!el.machineryOff)).length

        setNewWidgetSensorData(
            setDashboard,
            widgetIndex,
            sensorData,
            calculateChartProps(sensorData, widget.chartProps)
        )
    }

// BUTTON CLICK for CHART ZOOM
    const handleZoomChartButtonClicked = (e: React.MouseEvent<HTMLButtonElement>, zoomType: string) => {
        e.preventDefault()
        e.stopPropagation()

        setChartTooltip((val) => {
            val.active = false

            return {...val}
        })

        let zoomAmount = Math.max(~~(sensorData.displayData.length / 10), 1)

        if (zoomType === 'zoom-in')
            zoomAmount *= (-1)

        zoomChart({
            pivotIndex: ~~(sensorData.displayData.length / 2),
            zoomAmount
        })

    }

// BUTTON CLICK for CHART PAN
    const handlePanChartButtonClicked = (e: React.MouseEvent<HTMLButtonElement>, panType: string) => {
        e.preventDefault()
        e.stopPropagation()

        setChartTooltip((val) => {
            val.active = false

            return {...val}
        })

        let panAmount = Math.max(~~(sensorData.displayData.length / 10), 1)

        if (panAmount > 2)
            panAmount = 2

        panChart({
            doPan: true,
            panAmount: panType === 'pan-left' ? panAmount : -(panAmount)
        })
    }

// CHART MOUSE DOWN EVENT - start zoom click & drag
    const handleChartMouseDown = (a: any) => {
        if (!a || isNaN(a.activeTooltipIndex)) return

        setChartTooltip((val) => {
            val.active = false

            return {...val}
        })

        // zoomChartClickAndDrag({
        //     originIndex: a.activeTooltipIndex,
        //     startIndex: a.activeTooltipIndex,
        //     endIndex: a.activeTooltipIndex,
        //     lastTooltipIndex: a.activeTooltipIndex,
        // })

        setChartZoomSelector({
            originIndex: a.activeTooltipIndex,
            startIndex: a.activeTooltipIndex,
            endIndex: a.activeTooltipIndex,
            lastTooltipIndex: a.activeTooltipIndex,
        })

    }

// CHART MOUSE MOVE EVENT - update zoom end index
    const handleChartMouseMove = (a: any) => {
        if (chartZoomSelector.startIndex === -1 || !a || isNaN(a.activeTooltipIndex)) return

        const tooltipIndex = a.activeTooltipIndex

        let zoomSelector: ChartZoomSelector = {
            endIndex: 0,
            lastTooltipIndex: 0,
            originIndex: 0,
            startIndex: 0
        }

        if (tooltipIndex === chartZoomSelector.lastTooltipIndex)
            zoomSelector = {...chartZoomSelector};

        if (tooltipIndex === chartZoomSelector.originIndex) {
            zoomSelector.startIndex = chartZoomSelector.originIndex
            zoomSelector.endIndex = chartZoomSelector.originIndex
        } else if (tooltipIndex < chartZoomSelector.startIndex && tooltipIndex < chartZoomSelector.endIndex)
            zoomSelector.startIndex = tooltipIndex
        else if (tooltipIndex > chartZoomSelector.startIndex && tooltipIndex > chartZoomSelector.endIndex)
            zoomSelector.endIndex = tooltipIndex
        else if (tooltipIndex > chartZoomSelector.startIndex && tooltipIndex < chartZoomSelector.endIndex)
            if (tooltipIndex < chartZoomSelector.originIndex)
                zoomSelector.startIndex = tooltipIndex
            else
                zoomSelector.endIndex = tooltipIndex

        else
            zoomSelector = {...chartZoomSelector};

        zoomSelector.lastTooltipIndex = tooltipIndex

        setChartZoomSelector(zoomSelector);

    }

// CHART MOUSE UP EVENT - end zoom click & drag OR display tooltip
    const handleChartMouseUp = (a: any) => {
        if (!a || isNaN(a.activeTooltipIndex) || !a.activePayload) return

        if (chartZoomSelector.startIndex === chartZoomSelector.endIndex) {
            if (!chartContainerRef || (chartContainerRef.current == null)) return

            const ref = chartContainerRef.current

            setChartTooltip({
                active: true,
                label: a.activeLabel,
                chartCoordinate: [ref.getBoundingClientRect().x + window.scrollX, ref.getBoundingClientRect().y + window.scrollY],
                clickCoordinate: [a.activeCoordinate.x + 10, a.activeCoordinate.y],
                leftData: sensorData.leftData,
                displayData: sensorData.displayData,
                sensorData: a.activePayload,
                sensorDataIndex: a.activeTooltipIndex,
                sensorsMonitoringArray: sensorsMonitoringArray,
                sensorsMonitoringObject: sensorsMonitoringObject,
                aggregationsArray: aggregationsArray
            })

            setChartZoomSelector({
                originIndex: -1,
                endIndex: -1,
                startIndex: -1,
                lastTooltipIndex: -1
            })
        } else
            setChartZoomSelector((val) => {
                if (sensorData.displayData.length < 5) {
                    val.endIndex = -1
                    val.startIndex = -1

                    return {...val}
                }

                let numSamplesSelected = val.endIndex - val.startIndex
                if (numSamplesSelected < 5) {
                    const numSamplesNeededLeft = ~~((5 - numSamplesSelected) / 2)
                    let numSamplesNeededRight = 5 - numSamplesSelected - numSamplesNeededLeft

                    if (val.startIndex < numSamplesNeededLeft) {
                        numSamplesNeededRight += (numSamplesNeededLeft - val.startIndex)
                        val.startIndex = 0
                    } else
                        val.startIndex -= numSamplesNeededLeft

                    if (val.endIndex + numSamplesNeededRight >= sensorData.displayData.length)
                        val.endIndex = sensorData.displayData.length - 1
                    else
                        val.endIndex += numSamplesNeededRight
                }

                numSamplesSelected = val.endIndex - val.startIndex
                if (numSamplesSelected < 5) {
                    val.startIndex = -1
                    val.endIndex = -1
                } else {
                    zoomChartClickAndDrag(val);
                    val.originIndex = -1
                    val.startIndex = -1
                    val.endIndex = -1
                    val.lastTooltipIndex = -1
                }

                return {...val}
            })
    }

// CHART MOUSE LEAVE EVENT - end zoom click & drag
    const handleChartMouseLeave = () => {
        if (chartZoomSelector.startIndex === -1) return

        setChartZoomSelector((val) => {
            if (val.startIndex !== val.endIndex) {
                if (sensorData.displayData.length < 5) {
                    val.endIndex = -1
                    val.startIndex = -1

                    return {...val}
                }

                let numSamplesSelected = val.endIndex - val.startIndex
                if (numSamplesSelected < 5) {
                    const numSamplesNeededLeft = ~~((5 - numSamplesSelected) / 2)
                    let numSamplesNeededRight = 5 - numSamplesSelected - numSamplesNeededLeft

                    if (val.startIndex < numSamplesNeededLeft) {
                        numSamplesNeededRight += (numSamplesNeededLeft - val.startIndex)
                        val.startIndex = 0
                    } else
                        val.startIndex -= numSamplesNeededLeft

                    if (val.endIndex + numSamplesNeededRight >= sensorData.displayData.length)
                        val.endIndex = sensorData.displayData.length - 1
                    else
                        val.endIndex += numSamplesNeededRight
                }

                numSamplesSelected = val.endIndex - val.startIndex
                if (numSamplesSelected < 5) {
                    val.originIndex = -1
                    val.startIndex = -1
                    val.endIndex = -1
                    val.lastTooltipIndex = -1
                } else {
                    zoomChartClickAndDrag(val);
                    val.originIndex = -1
                    val.startIndex = -1
                    val.endIndex = -1
                    val.lastTooltipIndex = -1
                }
            } else {
                val.originIndex = -1
                val.startIndex = -1
                val.endIndex = -1
                val.lastTooltipIndex = -1
            }

            return {...val}
        })
    }

// TRANSLATE TO SENSOR NAME - used when displaying the legend
    const legendNameTranslator = (sensorName: string) => {
        if (sensorName.startsWith('allData.')) {
            sensorName = sensorName.slice(8).toString()
            if (sensorName.startsWith('H')) {
                const splittedSensorName = sensorName.split('_')

                if (splittedSensorName.length !== 2)
                    return 'Unknown sensor'

                const foundSensor = availableSensors.find((el) => (el.internalName === splittedSensorName[1]))

                if (foundSensor == null)
                    return 'Unknown sensor'

                return `${foundSensor.name} - ${splittedSensorName[0]}`
            }
            const foundSensor = availableSensors.find((el) => (el.internalName === sensorName))

            if (foundSensor == null)
                return 'Unknown sensor'

            return foundSensor.name
        } else if (sensorName.startsWith('aggregationData.'))
            return sensorName.slice(16).toString()

        return 'Unknown sensor'
    }

// NAVIGATE TO NEW DATA from the "NEW DATA" popup
    const navigateToNewData = () => {
        let newDisplayData = sensorData.rightData.slice(-sensorData.displayData.length).reverse()
        const numElementsNeeded = sensorData.displayData.length - newDisplayData.length

        if (numElementsNeeded > 0)
            newDisplayData = [...sensorData.displayData.slice(-numElementsNeeded), ...newDisplayData]

        if (numElementsNeeded < 0)
            sensorData.leftData = [...sensorData.leftData, ...sensorData.displayData, ...sensorData.rightData.slice(0, (-1) * numElementsNeeded).reverse()]
        else
            sensorData.leftData = [...sensorData.leftData, ...sensorData.displayData.slice(0, (-1) * numElementsNeeded)]

        sensorData.displayData = newDisplayData
        sensorData.rightData = []

        sensorData.hasNewData = false

        setNewWidgetSensorData(
            setDashboard,
            widgetIndex,
            sensorData,
            calculateChartProps(sensorData, widget.chartProps)
        )
    }

// CLOSE "NEW DATA" popup
    const closeNewDataPopup = () => {
        sensorData.hasNewData = false

        setNewWidgetSensorData(
            setDashboard,
            widgetIndex,
            sensorData,
            widget.chartProps
        )
    }


    return {
        chartContainerRef,
        chartZoomSelector,
        chartFullscreenModalOpen,
        setChartFullscreenModalOpen,
        quickNavigateModalOpen,
        setQuickNavigateModalOpen,
        polarChartSensorData,
        quickNavigateChart,
        handleZoomChartButtonClicked,
        handlePanChartButtonClicked,
        handleChartMouseDown,
        handleChartMouseMove,
        handleChartMouseUp,
        handleChartMouseLeave,
        legendNameTranslator,
        navigateToNewData,
        closeNewDataPopup,
    }
}