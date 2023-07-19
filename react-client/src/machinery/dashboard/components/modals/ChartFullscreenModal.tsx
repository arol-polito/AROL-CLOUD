import {Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay} from "@chakra-ui/react";
import React, {useRef, useState} from "react";
import Sensor from "../../models/Sensor";
import SlidingSensorData from "../../interfaces/SlidingSensorData";
import GridWidget from "../../interfaces/GridWidget";
import SensorMonitoring from "../../interfaces/SensorMonitoring";
import Aggregation from "../../interfaces/Aggregation";
import TooltipData from "../../interfaces/TooltipData";
import MultiValueDataDisplay from "../data-visualization/MultiValueDataDisplay";

interface ChartFullscreenModalProps {
    chartFullscreenModalOpen: boolean
    setChartFullscreenModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    widget: GridWidget
    availableSensors: Sensor[]
    sensorsMonitoringArray: SensorMonitoring[]
    sensorsMonitoringObject: { [key: string]: SensorMonitoring }
    aggregationsArray: Aggregation[]
    sensorData: SlidingSensorData
    setSensorData: React.Dispatch<React.SetStateAction<SlidingSensorData>>
    loadingMoreSensorData: boolean
    setLoadingMoreSensorData: React.Dispatch<React.SetStateAction<boolean>>
    chartTooltipActive: boolean
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
}

const aggregationOptions = [
    {value: "Minimum", displayName: "Minimum value in sample"},
    {value: "Maximum", displayName: "Maximum value in sample"},
    {value: "Average", displayName: "Average of the values in the sample"},
]

const rangeUnits = [
    {value: "sample", displayName: "samples"},
    {value: "day", displayName: "days"},
    {value: "week", displayName: "weeks"},
    {value: "month", displayName: "months"},
]

export default function ChartFullscreenModal(props: ChartFullscreenModalProps) {

    const modalBodyRef = useRef<HTMLDivElement>(null)

    const [modalBodySize, setModalBodySize] = useState<{ height: number, width: number }>({
        height: window.innerHeight-150,
        width: window.innerWidth-25
    })

    function closeModal(){
        props.setChartFullscreenModalOpen(false)
        props.setChartTooltip((val) => {
            val.active = false
            return {...val}
        })
    }

    return (
        <Modal
            isCentered
            size={"full"}
            onClose={closeModal}
            isOpen={props.chartFullscreenModalOpen}
            scrollBehavior={"inside"}
            // motionPreset='slideInBottom'
        >
            <ModalOverlay
                onMouseDown={(e) => (e.stopPropagation())}
            />
            <ModalContent
                onMouseDown={(e) => (e.stopPropagation())}
            >
                <ModalHeader>{props.widget.name}</ModalHeader>
                <ModalCloseButton/>
                <ModalBody
                    // bgColor={"red"}
                    minW={"100%"}
                    minH={"100%"}
                    ref={modalBodyRef}
                >
                    {/*<Box*/}
                    {/*    */}
                    {/*    minW={"100%"}*/}
                    {/*    minH={"100%"}*/}
                    {/*>*/}
                        {
                            modalBodySize.width > 0 &&
                            modalBodySize.height > 0 &&
                            // <Box py={4} w={"full"} h={"full"}>
                                <MultiValueDataDisplay
                                    widget={props.widget}
                                    displayType={"fullscreen"}
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
                                    dataDisplaySize={modalBodySize}
                                />
                            // </Box>
                        }

                    {/*</Box>*/}
                </ModalBody>
            </ModalContent>
        </Modal>
    )

}