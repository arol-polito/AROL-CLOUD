import type SensorDataFilters from '../../interfaces/SensorDataFilters'
import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack
} from '@chakra-ui/react'
import React, { Fragment, useEffect, useState } from 'react'
import type SensorData from '../../models/SensorData'
import type Sensor from '../../models/Sensor'
import { FiArrowDown, FiArrowUp, FiPlus } from 'react-icons/fi'
import type SlidingSensorData from '../../interfaces/SlidingSensorData'

interface HistoryModalProps {
  historyModalOpen: boolean
  setHistoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  sensorData: SlidingSensorData
  sensorsMonitoring: SensorDataFilters
  setSensorsMonitoring: React.Dispatch<React.SetStateAction<SensorDataFilters>>
  availableSensors: Sensor[]
}

export default function HistoryModal (props: HistoryModalProps) {
  const [sensorToDisplay, setSensorToDisplay] = useState<Sensor | null>(null)
  const [sensorToDisplayNotFound, setSensorToDisplayNotFound] = useState(false)
  const [sensorDataToDisplay, setSensorDataToDisplay] = useState<SensorData[]>([])

  const [loadingMoreSensorData, setLoadingMoreSensorData] = useState(false)

  // FIND SENSOR MONITORING AND FIND SENSOR DETAILS
  useEffect(() => {
    let sensorMonitoring: string | null = null
    let headMonitoring = 0
    // let mechMonitoring = 0
    for (const entry of Object.values(props.sensorsMonitoring.sensors)) {
      for (const headMechEntry of entry)
        if (headMechEntry.sensorNames.length > 0) {
          sensorMonitoring = headMechEntry.sensorNames[0].name
          headMonitoring = headMechEntry.headNumber
          // mechMonitoring = headMechEntry.mechNumber
          break
        }

      if (sensorMonitoring)
        break
    }

    if (!sensorMonitoring) {
      setSensorToDisplayNotFound(true)

      return
    }

    const sensorFound = props.availableSensors.find((val) => (val.internalName === sensorMonitoring))

    if (sensorFound == null) {
      setSensorToDisplayNotFound(true)

      return
    }

    const sensor = { ...sensorFound }

    if (headMonitoring > 0) {
      sensor.internalName = `H${String(headMonitoring).padStart(2, '0')}_${sensor.internalName}`
      sensor.name = `${sensor.name} - H${String(headMonitoring).padStart(2, '0')}`
    }

    setSensorToDisplay(sensor)
    setSensorToDisplayNotFound(false)
  }, [props.sensorsMonitoring, props.availableSensors])

  // SET SENSOR DATA TO BE DISPLAYED
  useEffect(() => {
    if (sensorToDisplay == null) return

    // console.log(props.sensorData.leftData.map((el)=>(el.formattedTime)))

    // Display data added to the end
    const sensorData = [...props.sensorData.displayData, ...[...props.sensorData.leftData].reverse()]

    setSensorDataToDisplay(sensorData.filter((val) => {
      if (Object.entries(val.aggregationData).length > 0) return false

      return val.allData.hasOwnProperty(sensorToDisplay.internalName)
    })
    )

    setLoadingMoreSensorData(false)
  }, [props.sensorData, sensorToDisplay])

  function handleClose () {
    props.setHistoryModalOpen(false)
  }

  // LOAD MORE SENSOR DATA
  function handleLoadMoreSensorDataClicked () {
    setLoadingMoreSensorData(true)

    props.setSensorsMonitoring((val) => {
      val.requestType = 'cache-only'
      val.cacheDataRequestMaxTime = sensorDataToDisplay.slice(-1)[0].time

      return { ...val }
    })
  }

  return (

        <Modal
            isOpen={props.historyModalOpen}
            onClose={handleClose}
            size="5xl"
            scrollBehavior="inside"
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
                <ModalHeader>Sensor history</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    {
                        (sensorToDisplay != null) &&
                        <>
                            <Text fontSize="md">Showing sensor data history. The most recent samples are listed
                                first.</Text>
                            <TableContainer w="full">
                                <Table variant="striped">
                                    <Thead>
                                        <Tr>
                                            <Th px="4!important">#</Th>
                                            <Th textAlign="center">Sensor</Th>
                                            <Th textAlign="center">Measurement time</Th>
                                            <Th textAlign="center">Value</Th>
                                            <Th textAlign="center">Diff</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {
                                            sensorDataToDisplay.map((sensorData, index) => {
                                              let currValue = 'N/A'
                                              if (sensorData.allData[sensorToDisplay.internalName])
                                                currValue = `${sensorData.allData[sensorToDisplay.internalName]} ${sensorToDisplay.unit}`

                                              let diffValue = ''
                                              if (currValue && index + 1 < sensorDataToDisplay.length) {
                                                const prevValue = sensorDataToDisplay[index + 1].allData[sensorToDisplay.internalName]
                                                if (prevValue)
                                                  diffValue = `${(parseFloat(currValue) - prevValue).toFixed(2)} ${sensorToDisplay.unit}`
                                              }

                                              let aggregateDataSetEnded = false
                                              if (props.sensorsMonitoring.aggregations.length > 0)
                                                if (props.sensorsMonitoring.dataRange.unit === 'sample') {
                                                  if (index + 1 === props.sensorsMonitoring.dataRange.amount)
                                                    aggregateDataSetEnded = true
                                                } else
                                                  if (index + 1 >= sensorDataToDisplay.length || sensorDataToDisplay[index + 1].time < props.sensorData.minDisplayTime)
                                                    aggregateDataSetEnded = true

                                              return (
                                                    <Fragment key={index}>
                                                        <Tr>
                                                            <Td px="4!important">{index + 1}</Td>
                                                            <Td textAlign="center">{sensorToDisplay.name}</Td>
                                                            <Td textAlign="center">{sensorData.formattedTime}</Td>
                                                            <Td textAlign="center">{currValue}</Td>
                                                            <Td textAlign="center">
                                                                <HStack flexWrap="nowrap" justifyContent="center">
                                                                    <span>{diffValue}</span>
                                                                    {
                                                                        diffValue &&
                                                                        (
                                                                          parseFloat(diffValue) >= 0
                                                                            ? <FiArrowUp/>
                                                                            : <FiArrowDown/>
                                                                        )
                                                                    }
                                                                </HStack>
                                                            </Td>
                                                        </Tr>
                                                        {
                                                            aggregateDataSetEnded &&
                                                            <Tr>
                                                                <Td colSpan={5} textAlign="center" fontWeight={500}>End
                                                                    of aggregated data set</Td>
                                                            </Tr>
                                                        }
                                                    </Fragment>
                                              )
                                            })
                                        }
                                        {
                                            props.sensorData.endOfData &&
                                            <Tr>
                                                <Td colSpan={5} textAlign="center" fontWeight={500}>End
                                                    of sensor data</Td>
                                            </Tr>
                                        }
                                    </Tbody>
                                </Table>
                            </TableContainer>

                            {
                                !props.sensorData.endOfData &&
                                <HStack
                                    w="full"
                                    h="100px"
                                    justifyContent="center"
                                    alignItems="center"
                                    _hover={{
                                      cursor: 'pointer'
                                    }}
                                    onClick={handleLoadMoreSensorDataClicked}
                                >
                                    {
                                        !loadingMoreSensorData &&
                                        <>
                                            <FiPlus/>
                                            <Text>Load previous sensor data</Text>
                                        </>
                                    }
                                    {
                                        loadingMoreSensorData &&
                                        <Spinner size="xl"/>
                                    }

                                </HStack>
                            }
                        </>
                    }
                    {
                        (sensorToDisplay == null) &&
                        !sensorToDisplayNotFound &&
                        <VStack
                            w="full"
                            h="250px"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Spinner size="xl"/>
                        </VStack>
                    }
                    {
                        sensorToDisplayNotFound &&
                        <Text fontSize="md">Sensor history is unavailable. Please try again.</Text>
                    }
                </ModalBody>
            </ModalContent>
        </Modal>

  )
}
