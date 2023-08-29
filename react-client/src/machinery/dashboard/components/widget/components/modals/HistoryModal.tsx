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
import React, {Fragment} from 'react'
import type Sensor from '../../../../models/Sensor'
import {FiArrowDown, FiArrowUp, FiPlus} from 'react-icons/fi'
import Dashboard from "../../../../models/Dashboard";
import GridWidget from "../../../../interfaces/GridWidget";
import Machinery from "../../../../../../machineries-map/components/Machinery";
import {useHistoryModalLogic} from "./useHistoryModalLogic";

export interface HistoryModalProps {
    machinery: Machinery
    widget: GridWidget
    widgetIndex: number
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    historyModalOpen: boolean
    setHistoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    availableSensors: Sensor[]
}

export default function HistoryModal(props: HistoryModalProps) {

    const {widget, historyModalOpen} = props;

    const {sensorData, sensorsMonitoring} = widget;

    const historyModalLogic = useHistoryModalLogic(props);
    const {sensorToDisplay, sensorToDisplayNotFound, sensorDataToDisplay, loadingMoreSensorData} = historyModalLogic;
    const {handleClose, handleLoadMoreSensorDataClicked} = historyModalLogic;

    return (

        <Modal
            isOpen={historyModalOpen}
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
                                            sensorDataToDisplay.map((sensorDataItem, index) => {
                                                let currValue = 'N/A'
                                                if (sensorDataItem.allData[sensorToDisplay.internalName])
                                                    currValue = `${sensorDataItem.allData[sensorToDisplay.internalName]} ${sensorToDisplay.unit}`

                                                let diffValue = ''
                                                if (currValue && index + 1 < sensorDataToDisplay.length) {
                                                    const prevValue = sensorDataToDisplay[index + 1].allData[sensorToDisplay.internalName]
                                                    if (prevValue)
                                                        diffValue = `${(parseFloat(currValue) - prevValue).toFixed(2)} ${sensorToDisplay.unit}`
                                                }

                                                let aggregateDataSetEnded = false
                                                if (sensorsMonitoring.aggregations.length > 0)
                                                    if (sensorsMonitoring.dataRange.unit === 'sample') {
                                                        if (index + 1 === sensorsMonitoring.dataRange.amount)
                                                            aggregateDataSetEnded = true
                                                    } else if (index + 1 >= sensorDataToDisplay.length || sensorDataToDisplay[index + 1].time < sensorData.minDisplayTime)
                                                        aggregateDataSetEnded = true

                                                return (
                                                    <Fragment key={index}>
                                                        <Tr>
                                                            <Td px="4!important">{index + 1}</Td>
                                                            <Td textAlign="center">{sensorToDisplay.name}</Td>
                                                            <Td textAlign="center">{sensorDataItem.formattedTime}</Td>
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
                                            sensorData.endOfData &&
                                            <Tr>
                                                <Td colSpan={5} textAlign="center" fontWeight={500}>End
                                                    of sensor data</Td>
                                            </Tr>
                                        }
                                    </Tbody>
                                </Table>
                            </TableContainer>

                            {
                                !sensorData.endOfData &&
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
