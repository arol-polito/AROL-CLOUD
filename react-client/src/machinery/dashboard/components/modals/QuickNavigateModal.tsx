import {
  Button,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react'
import React, { Fragment, useEffect, useState } from 'react'
import type SensorData from '../../models/SensorData'
import { FiPlus } from 'react-icons/fi'
import type SlidingSensorData from '../../interfaces/SlidingSensorData'

interface QuickNavigateModalProps {
  quickNavigateModalOpen: boolean
  setQuickNavigateModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  sensorData: SlidingSensorData
  loadingMoreSensorData: boolean
  setLoadingMoreSensorData: React.Dispatch<React.SetStateAction<boolean>>
  setChartQuickNavigate: React.Dispatch<React.SetStateAction<number>>
}

export default function QuickNavigateModal (props: QuickNavigateModalProps) {
  const [dataToDisplay, setDataToDisplay] = useState<Array<{
    time: number
    formattedTime: string
    numValues: number
    machineryOff: boolean
    machineryOffFrom: number
    machineryOffTo: number
    show: boolean
  }>>([])

  const [selectedIndex, setSelectedIndex] = useState(-1)

  // FIND SENSOR MONITORING AND FIND SENSOR DETAILS
  useEffect(() => {
    const sensorData: SlidingSensorData = JSON.parse(JSON.stringify(props.sensorData))

    const allSensorData: SensorData[] = [...sensorData.rightData, ...sensorData.displayData.reverse(), ...sensorData.leftData.reverse()]

    const dataToDisplayArray: Array<{
      time: number
      formattedTime: string
      numValues: number
      machineryOff: boolean
      machineryOffFrom: number
      machineryOffTo: number
      show: boolean
    }> = []

    allSensorData.forEach((sensorData) => {
      let showEntry = true
      if (sensorData.machineryOff && dataToDisplayArray.length > 0 && dataToDisplayArray.slice(-1)[0].machineryOff)
        showEntry = false

      dataToDisplayArray.push({
        time: sensorData.time,
        formattedTime: sensorData.formattedTime,
        numValues: Object.values(sensorData.allData).filter((el) => (el !== null)).length,
        machineryOff: sensorData.machineryOff,
        machineryOffFrom: sensorData.machineryOffFrom,
        machineryOffTo: sensorData.machineryOffTo,
        show: showEntry
      })
    })

    setDataToDisplay(dataToDisplayArray)
  }, [props.sensorData])

  function handleClose () {
    props.setQuickNavigateModalOpen(false)
  }

  // LOAD MORE SENSOR DATA
  function handleLoadMoreSensorDataClicked () {
    props.setLoadingMoreSensorData(true)
  }

  // HANDLE TIME ENTRY CLICKED
  function handleEntryClicked (index: number) {
    setSelectedIndex(index)
  }

  // NAVIGATE BUTTON CLICKED
  function handleNavigateButtonClicked () {
    if (selectedIndex < 0) return

    props.setChartQuickNavigate(selectedIndex)
    handleClose()
  }

  // CALCULATE TIME THE MACHINERY WAS OFF - if it was off at this time
  function getHoursMachineryOff (from: number, to: number) {
    const diff = ~~((to - from) / 3600000)

    if (diff < 24)
      return `${diff} hours`

    return `${~~(diff / 24)} days`
  }

  return (

        <Modal
            isOpen={props.quickNavigateModalOpen}
            onClose={handleClose}
            size="md"
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

                    <VStack
                        w="full"
                        alignItems="center"
                    >
                        <Text fontSize="md">Select where to quick navigate</Text>

                        {
                            dataToDisplay.map((entry, index) => (
                                <Fragment
                                    key={index}
                                >
                                    {
                                        entry.show &&
                                        <>
                                            <VStack
                                                w="full"
                                                py={1}
                                                px={3}
                                                bgColor={selectedIndex === index ? 'blue.400' : 'white'}
                                                _hover={{
                                                  cursor: 'pointer',
                                                  bgColor: selectedIndex === index ? 'blue.400' : 'gray.100'
                                                }}
                                                onClick={() => {
                                                  handleEntryClicked(index)
                                                }}
                                            >
                                                {
                                                    !entry.machineryOff &&
                                                    <>
                                                        <Text
                                                            fontSize="md"
                                                            color={selectedIndex === index ? 'white' : 'black'}
                                                        >
                                                            {entry.formattedTime}
                                                        </Text>
                                                        <Text
                                                            fontSize="sm"
                                                            color={selectedIndex === index ? 'white' : 'gray.400'}
                                                            mt="0!important"
                                                        >
                                                            {entry.numValues} values
                                                        </Text>
                                                    </>
                                                }
                                                {
                                                    entry.machineryOff &&
                                                    <Text
                                                        fontSize="md"
                                                        color={selectedIndex === index ? 'white' : 'black'}
                                                    >
                                                        Machinery OFF
                                                        for {getHoursMachineryOff(entry.machineryOffFrom, entry.machineryOffTo)}
                                                    </Text>
                                                }
                                            </VStack>
                                            <Divider/>
                                        </>
                                    }
                                </Fragment>
                            ))
                        }
                        {
                            props.sensorData.endOfData &&
                            <HStack
                                w="full"
                                p={3}
                                justifyContent="center"
                            >
                                <Text textAlign="center" fontWeight={500}>End
                                    of sensor data</Text>
                            </HStack>
                        }

                        {
                            !props.sensorData.endOfData &&
                            <HStack
                                w="full"
                                h="100px"
                                p={3}
                                justifyContent="center"
                                alignItems="center"
                                _hover={{
                                  cursor: 'pointer'
                                }}
                                onClick={handleLoadMoreSensorDataClicked}
                            >
                                {
                                    !props.loadingMoreSensorData &&
                                    <HStack
                                        w="full"
                                        p={3}
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <FiPlus/>
                                        <Text>Load previous sensor data</Text>
                                    </HStack>
                                }
                                {
                                    props.loadingMoreSensorData &&
                                    <HStack
                                        w="full"
                                        justifyContent="center"
                                    >
                                        <Spinner size="xl"/>
                                    </HStack>
                                }

                            </HStack>
                        }
                        {
                            dataToDisplay.length === 0 &&
                            <Text fontSize="md">No sensor data available.</Text>
                        }
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={handleClose}>Close</Button>
                    <Button
                        colorScheme='blue'
                        onClick={handleNavigateButtonClicked}
                        disabled={selectedIndex < 0}
                    >
                        Navigate
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

  )
}
