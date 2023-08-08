import type GridWidget from '../../interfaces/GridWidget'
import type SensorMonitoring from '../../interfaces/SensorMonitoring'
import type Aggregation from '../../interfaces/Aggregation'
import type SlidingSensorData from '../../interfaces/SlidingSensorData'
import React, { memo, useEffect, useRef, useState } from 'react'
import type TooltipData from '../../interfaces/TooltipData'
import { Box, Button, CloseButton, Divider, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
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

interface MultiValueDataDisplay {
  widget: GridWidget
  displayType: string
  availableSensors: Sensor[]
  sensorsMonitoringArray: SensorMonitoring[]
  sensorsMonitoringObject: Record<string, SensorMonitoring>
  aggregationsArray: Aggregation[]
  sensorData: SlidingSensorData
  setSensorData: React.Dispatch<React.SetStateAction<SlidingSensorData>>
  loadingMoreSensorData: boolean
  setLoadingMoreSensorData: React.Dispatch<React.SetStateAction<boolean>>
  chartTooltipActive: boolean
  setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
  dataDisplaySize: { height: number, width: number }
}

interface ChartZoom {
  doZoom: boolean
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
  doZoom: boolean
}

function MultiValueDataDisplay (props: MultiValueDataDisplay) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartZoomSelector, setChartZoomSelector] = useState<ChartZoomSelector>({
    doZoom: false,
    originIndex: -1,
    endIndex: -1,
    startIndex: -1,
    lastTooltipIndex: -1
  })

  const [chartProps, setChartProps] = useState({
    yAxisDataMin: Number.MIN_SAFE_INTEGER,
    yAxisDataMax: Number.MAX_SAFE_INTEGER,
    yAxisProps: {
      style: {
        fontSize: '10px'
      },
      width: 30
    },
    xAxisProps: {
      dataKey: 'formattedTime',
      style: {
        fontSize: '10px'
      }
    }
  })

  const [chartZoom, setChartZoom] = useState<ChartZoom>({
    doZoom: false, pivotIndex: 0, zoomAmount: 0
  })
  const [chartPan, setChartPan] = useState<ChartPan>({
    doPan: false, panAmount: 0
  })
  const [chartQuickNavigate, setChartQuickNavigate] = useState<number>(-1)

  const [chartFullscreenModalOpen, setChartFullscreenModalOpen] = useState(false)
  const [quickNavigateModalOpen, setQuickNavigateModalOpen] = useState(false)

  const [polarChartSensorData, setPolarChartSensorData] = useState({
    allData: {},
    aggregationData: {},
    sectionSize: 0,
    startingFromTime: ''
  })

  // CALCULATE CHART Y DOMAIN
  useEffect(() => {
    if (!['line-chart', 'area-chart', 'bar-chart'].includes(props.widget.type)) {
      props.setLoadingMoreSensorData(false)

      return
    }

    setChartProps((val) => {
      const allSensorData = [...props.sensorData.leftData, ...props.sensorData.displayData, ...props.sensorData.rightData]

      const min = Math.min(...allSensorData.filter((el) => (!el.machineryOff)).map((el) => (
        Math.min(...Object.values(el.allData).filter(Number) as number[])
      )))

      const max = Math.max(...allSensorData.filter((el) => (!el.machineryOff)).map((el) => (
        Math.max(...Object.values(el.allData).filter(Number) as number[])
      )))

      let yAxisChangedFlag = false

      const range = max - min

      if (val.yAxisDataMin === Number.MIN_SAFE_INTEGER || min < val.yAxisDataMin) {
        val.yAxisDataMin = min - range / 5
        yAxisChangedFlag = true
      }

      if (val.yAxisDataMax === Number.MAX_SAFE_INTEGER || max > val.yAxisDataMax) {
        val.yAxisDataMax = max + range / 5
        val.yAxisProps.width = Math.max(
          ~~(val.yAxisDataMax.toFixed(1).toString().length * 7),
          ~~(val.yAxisDataMin.toFixed(1).toString().length * 7)
        )
        yAxisChangedFlag = true
      }

      if (yAxisChangedFlag) return { ...val }

      return val
    })

    props.setLoadingMoreSensorData(false)
  }, [props])

  // FORMAT DATA FOR POLAR CHART
  useEffect(() => {
    if (!['pie-chart', 'scatter-chart'].includes(props.widget.type)) return

    setPolarChartSensorData((val) => {
      const bucketSize = 1
      val = {
        allData: {},
        aggregationData: {},
        sectionSize: val.sectionSize,
        startingFromTime: val.startingFromTime
      }

      const allSensorData = [...props.sensorData.leftData, ...props.sensorData.displayData, ...props.sensorData.rightData]

      val.startingFromTime = allSensorData.length > 0 ? allSensorData[0].formattedTime : ''

      props.sensorsMonitoringArray.forEach((sensorMonitoring) => {
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
      props.aggregationsArray.forEach((aggregation) => {
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
  }, [props.sensorsMonitoringArray, props.aggregationsArray, props.sensorData, props.widget.type])

  // PIE CHART LEVEL SIZE
  useEffect(() => {
    if (props.widget.type !== 'pie-chart') return

    setPolarChartSensorData((val) => {
      const numSectionsNeeded = props.sensorsMonitoringArray.length + props.aggregationsArray.length
      let shortestDimension = Math.min(props.dataDisplaySize.width, props.dataDisplaySize.height)
      if (props.dataDisplaySize.height - shortestDimension < 40)
        shortestDimension = props.dataDisplaySize.height - 40

      const resultingSectionSize = ~~(shortestDimension / numSectionsNeeded)
      if (resultingSectionSize < 30)
        val.sectionSize = 30
      else
        val.sectionSize = resultingSectionSize

      return { ...val }
    })
  }, [props.dataDisplaySize, props.sensorsMonitoringArray, props.aggregationsArray, props.widget.type])

  // Chart ZOOM - +/- buttons
  useEffect(() => {
    if (!chartZoom.doZoom) return

    const zoomIn = chartZoom.zoomAmount < 0
    const zoomOut = chartZoom.zoomAmount > 0

    let zoomAmount = Math.abs(chartZoom.zoomAmount)

    props.setSensorData((val) => {
      const labelIndex = chartZoom.pivotIndex

      const xAxisMiddleIndex = ~~(val.displayData.length / 2)

      const displayDataLength = val.displayData.length
      const rightDataLength = val.rightData.length
      const leftDataLength = val.leftData.length

      if (zoomIn && displayDataLength <= 5)
        return val

      if (zoomIn && displayDataLength - zoomAmount <= 5)
        zoomAmount = displayDataLength - 5

      if (zoomOut && (leftDataLength === 0 && rightDataLength === 0))
        return val

      // Remove or add ticks from right
      if (labelIndex < xAxisMiddleIndex) {
        if (zoomIn) {
          val.numSamplesDisplaying -= val.displayData.slice(displayDataLength - zoomAmount, displayDataLength).filter((el) => (!el.machineryOff)).length

          val.rightData = [...val.rightData, ...val.displayData.slice(displayDataLength - zoomAmount, displayDataLength).reverse()]
          val.displayData = val.displayData.slice(0, displayDataLength - zoomAmount)
        } else if (zoomOut)
          if (rightDataLength) {
            zoomAmount = (zoomAmount <= rightDataLength) ? zoomAmount : rightDataLength

            val.numSamplesDisplaying += val.rightData.slice(rightDataLength - zoomAmount, rightDataLength).filter((el) => (!el.machineryOff)).length

            val.displayData = [...val.displayData, ...val.rightData.slice(rightDataLength - zoomAmount, rightDataLength).reverse()]
            val.rightData = val.rightData.slice(0, rightDataLength - zoomAmount)
          } else if (leftDataLength) {
            zoomAmount = (zoomAmount <= leftDataLength) ? zoomAmount : leftDataLength

            val.numSamplesDisplaying += val.leftData.slice(leftDataLength - zoomAmount, leftDataLength).filter((el) => (!el.machineryOff)).length

            val.displayData = [...val.leftData.slice(leftDataLength - zoomAmount, leftDataLength), ...val.displayData]
            val.leftData = val.leftData.slice(0, leftDataLength - zoomAmount)
          }
      }
      // Remove or add ticks from left
      else if ((labelIndex > xAxisMiddleIndex)) {
        // console.log("rm left")
        if (zoomIn) {
          val.numSamplesDisplaying -= val.displayData.slice(0, zoomAmount).filter((el) => (!el.machineryOff)).length

          val.leftData.push(...val.displayData.slice(0, zoomAmount))
          val.displayData = val.displayData.slice(zoomAmount, displayDataLength)
        } else if (zoomOut)
          if (leftDataLength) {
            zoomAmount = (zoomAmount <= leftDataLength) ? zoomAmount : leftDataLength

            val.numSamplesDisplaying += val.leftData.slice(leftDataLength - zoomAmount, leftDataLength).filter((el) => (!el.machineryOff)).length

            val.displayData = [...val.leftData.slice(leftDataLength - zoomAmount, leftDataLength), ...val.displayData]
            val.leftData = val.leftData.slice(0, leftDataLength - zoomAmount)
          } else if (rightDataLength) {
            zoomAmount = (zoomAmount <= rightDataLength) ? zoomAmount : rightDataLength

            val.numSamplesDisplaying += val.rightData.slice(rightDataLength - zoomAmount, rightDataLength).filter((el) => (!el.machineryOff)).length

            val.displayData = [...val.displayData, ...val.rightData.slice(rightDataLength - zoomAmount, rightDataLength).reverse()]
            val.rightData = val.rightData.slice(0, rightDataLength - zoomAmount)
          }
      }
      // Remove or add ticks from left and right
      else {
        zoomAmount = ~~Math.max(zoomAmount / 2, 1)

        if (zoomIn) {
          val.numSamplesDisplaying -= val.displayData.slice(displayDataLength - zoomAmount, displayDataLength).filter((el) => (!el.machineryOff)).length
          val.numSamplesDisplaying -= val.displayData.slice(0, zoomAmount).filter((el) => (!el.machineryOff)).length

          val.rightData = [...val.rightData, ...val.displayData.slice(displayDataLength - zoomAmount, displayDataLength).reverse()]
          val.leftData = [...val.leftData, ...val.displayData.slice(0, zoomAmount)]

          val.displayData = val.displayData.slice(zoomAmount, displayDataLength - zoomAmount)
        } else if (zoomOut) {
          if (rightDataLength) {
            zoomAmount = (zoomAmount <= rightDataLength) ? zoomAmount : rightDataLength

            val.numSamplesDisplaying += val.rightData.slice(rightDataLength - zoomAmount, rightDataLength).filter((el) => (!el.machineryOff)).length

            val.displayData = [...val.displayData, ...val.rightData.slice(rightDataLength - zoomAmount, rightDataLength).reverse()]
            val.rightData = val.rightData.slice(0, rightDataLength - zoomAmount)
          }

          if (leftDataLength) {
            zoomAmount = (zoomAmount <= leftDataLength) ? zoomAmount : leftDataLength

            val.numSamplesDisplaying += val.leftData.slice(leftDataLength - zoomAmount, leftDataLength).filter((el) => (!el.machineryOff)).length

            val.displayData = [...val.leftData.slice(leftDataLength - zoomAmount, leftDataLength), ...val.displayData]
            val.leftData = val.leftData.slice(0, leftDataLength - zoomAmount)
          }
        }
      }

      if (val.leftData.length < 5 && !props.loadingMoreSensorData && !props.sensorData.endOfData)
        props.setLoadingMoreSensorData(true)

      if (val.rightData.length === 0)
        val.hasNewData = false

      setChartZoom((val) => {
        val.doZoom = false

        return { ...val }
      })

      return { ...val }
    })
  }, [chartZoom, props])

  // CHART ZOOM - using click & drag selector
  useEffect(() => {
    if (!chartZoomSelector.doZoom) return

    props.setSensorData((val) => {
      val.leftData.push(...val.displayData.slice(0, chartZoomSelector.startIndex))
      val.rightData.push(...val.displayData.slice(chartZoomSelector.endIndex + 1).reverse())
      val.displayData = val.displayData.slice(chartZoomSelector.startIndex, chartZoomSelector.endIndex + 1)

      val.numSamplesDisplaying = val.displayData.filter((el) => (!el.machineryOff)).length

      setChartZoomSelector((val) => {
        val.doZoom = false
        val.startIndex = -1
        val.endIndex = -1

        return { ...val }
      })

      return { ...val }
    })
  }, [chartZoomSelector, props])

  // Chart PAN
  useEffect(() => {
    props.setSensorData((val) => {
      if (!chartPan.doPan) return val

      const panAmount = chartPan.panAmount

      const displayDataLength = val.displayData.length
      const rightDataLength = val.rightData.length
      const leftDataLength = val.leftData.length

      let moveAmount = Math.abs(panAmount)

      if (panAmount < 0 && rightDataLength > 0) {
        // Move right
        moveAmount = (moveAmount <= rightDataLength) ? moveAmount : rightDataLength

        val.numSamplesDisplaying += val.rightData.slice(-moveAmount, rightDataLength).filter((el) => (!el.machineryOff)).length
        val.numSamplesDisplaying -= val.displayData.slice(0, moveAmount).filter((el) => (!el.machineryOff)).length

        val.leftData = [...val.leftData, ...val.displayData.slice(0, moveAmount)]
        val.displayData = [...val.displayData.slice(moveAmount, displayDataLength), ...val.rightData.slice(-moveAmount, rightDataLength).reverse()]
        val.rightData = val.rightData.slice(0, -moveAmount)
      } else if (panAmount > 0 && leftDataLength > 0) {
        // Move left
        moveAmount = (moveAmount <= leftDataLength) ? moveAmount : leftDataLength

        val.numSamplesDisplaying += val.leftData.slice(leftDataLength - moveAmount, leftDataLength).filter((el) => (!el.machineryOff)).length
        val.numSamplesDisplaying -= val.displayData.slice(displayDataLength - moveAmount, displayDataLength).slice(0, moveAmount).filter((el) => (!el.machineryOff)).length

        val.rightData = [...val.rightData, ...val.displayData.slice(displayDataLength - moveAmount, displayDataLength).reverse()]
        val.displayData = [...val.leftData.slice(leftDataLength - moveAmount, leftDataLength), ...val.displayData.slice(0, displayDataLength - moveAmount)]
        val.leftData = val.leftData.slice(0, leftDataLength - moveAmount)
      }

      if (val.leftData.length < 5 && !props.loadingMoreSensorData && !props.sensorData.endOfData)
        props.setLoadingMoreSensorData(true)

      if (val.rightData.length === 0)
        val.hasNewData = false

      setChartPan((el) => {
        el.doPan = false

        return { ...el }
      })

      return { ...val }
    })
  }, [chartPan, props])

  // Chart QUICK NAVIGATE
  useEffect(() => {
    if (chartQuickNavigate < 0) return

    props.setSensorData((val) => {
      const numSamplesToDisplay = props.sensorData.displayData.length

      const allSensorData = [...val.leftData, ...val.displayData, ...val.rightData.reverse()]
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

      val.leftData = allSensorData.slice(0, indexLeft)
      val.displayData = allSensorData.slice(indexLeft, indexRight)
      val.rightData = allSensorData.slice(indexRight).reverse()

      val.numSamplesDisplaying = val.displayData.filter((el) => (!el.machineryOff)).length

      return { ...val }
    })

    setChartQuickNavigate(-1)
  }, [chartQuickNavigate, props])

  // BUTTON CLICK for CHART ZOOM
  function handleZoomChartButtonClicked (e: React.MouseEvent<HTMLButtonElement>, zoomType: string) {
    e.preventDefault()
    e.stopPropagation()

    props.setChartTooltip((val) => {
      val.active = false

      return { ...val }
    })

    let zoomAmount = Math.max(~~(props.sensorData.displayData.length / 10), 1)

    if (zoomType === 'zoom-in')
      zoomAmount *= (-1)

    setChartZoom({
      doZoom: true,
      pivotIndex: ~~(props.sensorData.displayData.length / 2),
      zoomAmount
    })
  }

  // BUTTON CLICK for CHART PAN
  function handlePanChartButtonClicked (e: React.MouseEvent<HTMLButtonElement>, panType: string) {
    e.preventDefault()
    e.stopPropagation()

    props.setChartTooltip((val) => {
      val.active = false

      return { ...val }
    })

    let panAmount = Math.max(~~(props.sensorData.displayData.length / 10), 1)

    if (panAmount > 2)
      panAmount = 2

    setChartPan({
      doPan: true,
      panAmount: panType === 'pan-left' ? panAmount : -(panAmount)
    })
  }

  // CHART MOUSE DOWN EVENT - start zoom click & drag
  function handleChartMouseDown (a: any) {
    if (!a || isNaN(a.activeTooltipIndex)) return

    props.setChartTooltip((val) => {
      val.active = false

      return { ...val }
    })

    setChartZoomSelector((val) => {
      val.originIndex = a.activeTooltipIndex
      val.startIndex = a.activeTooltipIndex
      val.endIndex = a.activeTooltipIndex
      val.lastTooltipIndex = a.activeTooltipIndex

      return { ...val }
    })
  }

  // CHART MOUSE MOVE EVENT - update zoom end index
  function handleChartMouseMove (a: any) {
    if (chartZoomSelector.startIndex === -1 || !a || isNaN(a.activeTooltipIndex)) return

    const tooltipIndex = a.activeTooltipIndex

    setChartZoomSelector((val) => {
      if (tooltipIndex === val.lastTooltipIndex)
        return val

      if (tooltipIndex === val.originIndex) {
        val.startIndex = val.originIndex
        val.endIndex = val.originIndex
      } else if (tooltipIndex < val.startIndex && tooltipIndex < val.endIndex)
        val.startIndex = tooltipIndex
      else if (tooltipIndex > val.startIndex && tooltipIndex > val.endIndex)
        val.endIndex = tooltipIndex
      else if (tooltipIndex > val.startIndex && tooltipIndex < val.endIndex)
        if (tooltipIndex < val.originIndex)
          val.startIndex = tooltipIndex
        else
          val.endIndex = tooltipIndex

      else
        return val

      val.lastTooltipIndex = tooltipIndex

      return { ...val }
    })
  }

  // CHART MOUSE UP EVENT - end zoom click & drag OR display tooltip
  function handleChartMouseUp (a: any) {
    if (!a || isNaN(a.activeTooltipIndex) || !a.activePayload) return

    if (chartZoomSelector.startIndex === chartZoomSelector.endIndex) {
      if (!chartContainerRef || (chartContainerRef.current == null)) return

      const ref = chartContainerRef.current

      props.setChartTooltip({
        active: true,
        label: a.activeLabel,
        chartCoordinate: [ref.getBoundingClientRect().x + window.scrollX, ref.getBoundingClientRect().y + window.scrollY],
        clickCoordinate: [a.activeCoordinate.x + 10, a.activeCoordinate.y],
        leftData: props.sensorData.leftData,
        displayData: props.sensorData.displayData,
        sensorData: a.activePayload,
        sensorDataIndex: a.activeTooltipIndex,
        sensorsMonitoringArray: props.sensorsMonitoringArray,
        sensorsMonitoringObject: props.sensorsMonitoringObject,
        aggregationsArray: props.aggregationsArray
      })

      setChartZoomSelector({
        doZoom: false,
        originIndex: -1,
        endIndex: -1,
        startIndex: -1,
        lastTooltipIndex: -1
      })
    } else
      setChartZoomSelector((val) => {
        if (props.sensorData.displayData.length < 5) {
          val.endIndex = -1
          val.startIndex = -1
          val.doZoom = false

          return { ...val }
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

          if (val.endIndex + numSamplesNeededRight >= props.sensorData.displayData.length)
            val.endIndex = props.sensorData.displayData.length - 1
          else
            val.endIndex += numSamplesNeededRight
        }

        numSamplesSelected = val.endIndex - val.startIndex
        if (numSamplesSelected < 5) {
          val.startIndex = -1
          val.endIndex = -1
          val.doZoom = false
        } else
          val.doZoom = true

        return { ...val }
      })
  }

  // CHART MOUSE LEAVE EVENT - end zoom click & drag
  function handleChartMouseLeave () {
    if (chartZoomSelector.startIndex === -1) return

    setChartZoomSelector((val) => {
      if (val.startIndex !== val.endIndex) {
        if (props.sensorData.displayData.length < 5) {
          val.endIndex = -1
          val.startIndex = -1
          val.doZoom = false

          return { ...val }
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

          if (val.endIndex + numSamplesNeededRight >= props.sensorData.displayData.length)
            val.endIndex = props.sensorData.displayData.length - 1
          else
            val.endIndex += numSamplesNeededRight
        }

        numSamplesSelected = val.endIndex - val.startIndex
        if (numSamplesSelected < 5) {
          val.originIndex = -1
          val.startIndex = -1
          val.endIndex = -1
          val.lastTooltipIndex = -1
          val.doZoom = false
        } else
          val.doZoom = true
      } else {
        val.originIndex = -1
        val.doZoom = false
        val.startIndex = -1
        val.endIndex = -1
        val.lastTooltipIndex = -1
      }

      return { ...val }
    })
  }

  // TRANSLATE TO SENSOR NAME - used when displaying the legend
  function legendNameTranslator (sensorName: string) {
    if (sensorName.startsWith('allData.')) {
      sensorName = sensorName.slice(8).toString()
      if (sensorName.startsWith('H')) {
        const splittedSensorName = sensorName.split('_')

        if (splittedSensorName.length !== 2)
          return 'Unknown sensor'

        const foundSensor = props.availableSensors.find((el) => (el.internalName === splittedSensorName[1]))

        if (foundSensor == null)
          return 'Unknown sensor'

        return `${foundSensor.name} - ${splittedSensorName[0]}`
      }
      const foundSensor = props.availableSensors.find((el) => (el.internalName === sensorName))

      if (foundSensor == null)
        return 'Unknown sensor'

      return foundSensor.name
    } else if (sensorName.startsWith('aggregationData.'))
      return sensorName.slice(16).toString()

    return 'Unknown sensor'
  }

  // NAVIGATE TO NEW DATA from the "NEW DATA" popup
  function navigateToNewData () {
    props.setSensorData((val) => {
      let newDisplayData = val.rightData.slice(-val.displayData.length).reverse()
      const numElementsNeeded = val.displayData.length - newDisplayData.length

      if (numElementsNeeded > 0)
        newDisplayData = [...val.displayData.slice(-numElementsNeeded), ...newDisplayData]

      if (numElementsNeeded < 0)
        val.leftData = [...val.leftData, ...val.displayData, ...val.rightData.slice(0, (-1) * numElementsNeeded).reverse()]
      else
        val.leftData = [...val.leftData, ...val.displayData.slice(0, (-1) * numElementsNeeded)]

      val.displayData = newDisplayData
      val.rightData = []

      val.hasNewData = false

      return { ...val }
    })
  }

  // CLOSE "NEW DATA" popup
  function closeNewDataPopup () {
    props.setSensorData((val) => {
      val.hasNewData = false

      return { ...val }
    })
  }

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
                    props.widget.type === 'line-chart' &&
                    <Box>
                        <ResponsiveContainer
                            width={props.dataDisplaySize.width}
                            height={props.dataDisplaySize.height}
                        >
                            <LineChart
                                data={props.sensorData.displayData}
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
                                    padding={{ bottom: 10, top: 10 }}
                                    type="number"
                                    tickFormatter={(value) => (value.toFixed(1))}
                                    domain={[chartProps.yAxisDataMin, chartProps.yAxisDataMax]}
                                />
                                <XAxis
                                    {...chartProps.xAxisProps}
                                    padding={{ left: 10, right: 10 }}
                                />

                                {
                                    !props.chartTooltipActive &&
                                    <Tooltip content={<></>}/>
                                }
                                <Tooltip trigger="click" content={<></>}/>

                                {
                                    props.displayType === 'fullscreen' &&
                                    <Legend
                                        iconType="circle"
                                        formatter={(value) => (legendNameTranslator(value))}
                                    />
                                }

                                {props.sensorsMonitoringArray.map((sensor) => (
                                    <Line key={sensor.internalName}
                                          type="linear"
                                          dataKey={`allData.${sensor.internalName}`}
                                          dot={props.aggregationsArray.length === 0 ? <Dot/> : false}
                                          activeDot={false}
                                          stroke={sensor.color}
                                          fill={sensor.color}
                                          isAnimationActive={false}
                                    />
                                ))}
                                {props.aggregationsArray.map((aggregation) => (
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
                                        x1={props.sensorData.displayData[chartZoomSelector.startIndex].formattedTime}
                                        x2={props.sensorData.displayData[chartZoomSelector.endIndex].formattedTime}
                                        strokeOpacity={0.3}
                                    />
                                }

                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                }
                {
                    props.widget.type === 'area-chart' &&
                    <ResponsiveContainer
                        width={props.dataDisplaySize.width}
                        height={props.dataDisplaySize.height}
                    >
                        <AreaChart
                            data={props.sensorData.displayData}
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
                                padding={{ bottom: 10, top: 10 }}
                                type="number"
                                tickFormatter={(value) => (value.toFixed(1))}
                                domain={[chartProps.yAxisDataMin, chartProps.yAxisDataMax]}
                            />
                            <XAxis
                                {...chartProps.xAxisProps}
                                padding={{ left: 10, right: 10 }}
                            />

                            {
                                !props.chartTooltipActive &&
                                <Tooltip content={<></>}/>
                            }
                            <Tooltip trigger="click" content={<></>}/>

                            {
                                props.displayType === 'fullscreen' &&
                                <Legend
                                    iconType="rect"
                                    formatter={(value) => (legendNameTranslator(value))}
                                />
                            }

                            {props.sensorsMonitoringArray.map((sensor) => (
                                <Area key={sensor.internalName}
                                      opacity={1}
                                      type="linear"
                                      dataKey={`allData.${sensor.internalName}`}
                                      dot={props.aggregationsArray.length === 0 ? <Dot/> : false}
                                      activeDot={false}
                                      stroke={sensor.color}
                                      fill={sensor.color}
                                      isAnimationActive={false}
                                />
                            ))}
                            {props.aggregationsArray.map((aggregation) => (
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
                                    x1={props.sensorData.displayData[chartZoomSelector.startIndex].formattedTime}
                                    x2={props.sensorData.displayData[chartZoomSelector.endIndex].formattedTime}
                                    strokeOpacity={0.3}
                                />
                            }

                        </AreaChart>
                    </ResponsiveContainer>
                }
                {
                    props.widget.type === 'bar-chart' &&
                    <ResponsiveContainer
                        width={props.dataDisplaySize.width}
                        height={props.dataDisplaySize.height}
                    >
                        <BarChart
                            data={props.sensorData.displayData}
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
                                padding={{ bottom: 10, top: 10 }}
                                type="number"
                                tickFormatter={(value) => (value.toFixed(1))}
                                domain={[chartProps.yAxisDataMin, chartProps.yAxisDataMax]}
                            />
                            <XAxis
                                {...chartProps.xAxisProps}
                                padding={{ left: 10, right: 10 }}
                            />

                            {
                                !props.chartTooltipActive &&
                                <Tooltip content={<></>}/>
                            }
                            <Tooltip trigger="click" content={<></>}/>

                            {
                                props.displayType === 'fullscreen' &&
                                <Legend
                                    iconType="rect"
                                    formatter={(value) => (legendNameTranslator(value))}
                                />
                            }

                            {props.sensorsMonitoringArray.map((sensor) => (
                                <Bar key={sensor.internalName}
                                     type="linear"
                                     dataKey={`allData.${sensor.internalName}`}
                                     stroke={sensor.color}
                                     fill={sensor.color}
                                     isAnimationActive={false}
                                />
                            ))}
                            {props.aggregationsArray.map((aggregation) => (
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
                                    x1={props.sensorData.displayData[chartZoomSelector.startIndex].formattedTime}
                                    x2={props.sensorData.displayData[chartZoomSelector.endIndex].formattedTime}
                                    strokeOpacity={0.3}
                                />
                            }
                        </BarChart>
                    </ResponsiveContainer>
                }
                {
                    props.widget.type === 'pie-chart' &&
                    <>
                        <ResponsiveContainer width={props.dataDisplaySize.width}
                                             height={props.dataDisplaySize.height - 40}>
                            <PieChart>
                                {/* <YAxis/> */}
                                <Tooltip
                                    content={(props) => (
                                        <PieTooltip tooltipProps={props}/>
                                    )}
                                />
                                {
                                    props.sensorsMonitoringArray.map((sensor, index) => (
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
                                    props.aggregationsArray.map((aggregation, index) => (
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
                                isLoading={props.loadingMoreSensorData}
                                loadingText="Loading"
                                disabled={props.sensorData.endOfData}
                                title={props.sensorData.endOfData ? 'All sensor data already loaded' : ''}
                                onClick={() => {
                                  props.setLoadingMoreSensorData(true)
                                }}
                            >
                                Load previous
                            </Button>
                        </HStack>
                    </>
                }
                {
                    props.widget.type === 'scatter-chart' &&
                    <ResponsiveContainer width={props.dataDisplaySize.width} height={props.dataDisplaySize.height}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="uv"/>
                            <YAxis dataKey="pv"/>
                            <ZAxis dataKey="amt"/>
                            <Tooltip position={{ x: 50, y: 0 }}/>
                            <Scatter data={props.sensorData.displayData} fill="#8884d8"/>
                        </ScatterChart>
                    </ResponsiveContainer>
                }

                {
                    ['line-chart', 'area-chart', 'bar-chart'].includes(props.widget.type) &&
                    <>
                        <HStack
                            w={props.dataDisplaySize.width - chartProps.yAxisProps.width - 45}
                            position="absolute"
                            top="45px"
                            left={`${chartProps.yAxisProps.width + 45}px`}
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <IconButton
                                p={2}
                                variant="unstyled"
                                title="Move left"
                                disabled={props.sensorData.leftData.length === 0}
                                isLoading={props.sensorData.leftData.length === 0 && props.loadingMoreSensorData}
                                icon={<FiChevronLeft/>}
                                onClick={(e) => {
                                  handlePanChartButtonClicked(e, 'pan-left')
                                }}
                                aria-label="Pan left"
                                _hover={{
                                  bgColor: 'rgb(255,255,255, 0.75)'
                                }}
                            />
                            <HStack>
                                <IconButton
                                    p={2}
                                    variant="unstyled"
                                    title="Zoom in"
                                    disabled={props.sensorData.displayData.length <= 5}
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
                                    disabled={props.sensorData.leftData.length === 0 && props.sensorData.rightData.length === 0}
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
                                    props.displayType === 'dashboard' &&
                                    <>
                                        <IconButton
                                            p={2}
                                            variant="unstyled"
                                            title="Open in fullscreen"
                                            disabled={props.sensorData.displayData.length <= 5}
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
                                            disabled={props.sensorData.displayData.length <= 5}
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
                                disabled={props.sensorData.rightData.length === 0}
                                icon={<FiChevronRight/>}
                                onClick={(e) => {
                                  handlePanChartButtonClicked(e, 'pan-right')
                                }}
                                aria-label="Pan right"
                                _hover={{
                                  bgColor: 'rgb(255,255,255, 0.75)'
                                }}
                            />
                        </HStack>
                        <HStack
                            w={props.dataDisplaySize.width - chartProps.yAxisProps.width - 70}
                            position="absolute"
                            top="75px"
                            left={`${chartProps.yAxisProps.width + 45}px`}
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Text
                                w="full"
                                textAlign="left"
                                fontSize="sm"
                                fontWeight={400}
                            >
                                {(props.sensorData.displayData.length > 0) ? props.sensorData.displayData[0].formattedTime : ''} {props.sensorData.leftData.length === 0 ? '(end)' : ''}
                            </Text>
                            <Text
                                w="full"
                                textAlign="center"
                                fontSize="sm"
                                fontWeight={400}
                            >
                                {props.sensorData.numSamplesDisplaying} samples
                            </Text>
                            <Text
                                w="full"
                                textAlign="right"
                                fontSize="sm"
                                fontWeight={400}
                            >
                                {(props.sensorData.displayData.length > 0) ? props.sensorData.displayData.slice(-1)[0].formattedTime : ''} {props.sensorData.rightData.length === 0 ? '(end)' : ''}
                            </Text>
                        </HStack>
                        {
                            props.sensorData.hasNewData &&
                            <VStack
                                alignItems="flex-end"
                                bgColor="white"
                                boxShadow="xl"
                                rounded="md"
                                borderWidth={1}
                                borderColor="gray.400"
                                position="absolute"
                                top={`${props.dataDisplaySize.height / 2}px`}
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
                props.displayType === 'dashboard' &&
                chartFullscreenModalOpen &&
                <ChartFullscreenModal
                    chartFullscreenModalOpen={chartFullscreenModalOpen}
                    setChartFullscreenModalOpen={setChartFullscreenModalOpen}
                    widget={props.widget}
                    availableSensors={props.availableSensors}
                    sensorsMonitoringArray={props.sensorsMonitoringArray}
                    sensorsMonitoringObject={props.sensorsMonitoringObject}
                    aggregationsArray={props.aggregationsArray}
                    sensorData={props.sensorData}
                    setSensorData={props.setSensorData}
                    loadingMoreSensorData={props.loadingMoreSensorData}
                    setLoadingMoreSensorData={props.setLoadingMoreSensorData}
                    chartTooltipActive={props.chartTooltipActive}
                    setChartTooltip={props.setChartTooltip}
                />
            }
            {
                quickNavigateModalOpen &&
                <QuickNavigateModal
                    quickNavigateModalOpen={quickNavigateModalOpen}
                    setQuickNavigateModalOpen={setQuickNavigateModalOpen}
                    sensorData={props.sensorData}
                    loadingMoreSensorData={props.loadingMoreSensorData}
                    setLoadingMoreSensorData={props.setLoadingMoreSensorData}
                    setChartQuickNavigate={setChartQuickNavigate}
                />
            }
        </>
  )
}

export default memo(MultiValueDataDisplay)
