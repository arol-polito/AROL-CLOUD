import {Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay} from '@chakra-ui/react'
import React, {useRef, useState} from 'react'
import {
    MultiValueDataDisplay,
    MultiValueDataDisplayProps
} from '../data-visualization/multi-value/MultiValueDataDisplay'

interface ChartFullscreenModalProps extends MultiValueDataDisplayProps {
    chartFullscreenModalOpen: boolean
    setChartFullscreenModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ChartFullscreenModal(props: ChartFullscreenModalProps) {
    
    const {setChartFullscreenModalOpen, setChartTooltip, chartFullscreenModalOpen} = props;
    const {widget} = props;

    const modalBodyRef = useRef<HTMLDivElement>(null)
    
    const [modalBodySize] = useState<{ height: number, width: number }>({
        height: window.innerHeight - 150,
        width: window.innerWidth - 25
    })

    function closeModal() {
        setChartFullscreenModalOpen(false)
        setChartTooltip((val) => {
            val.active = false

            return {...val}
        })
    }

    return (
        <Modal
            size='full'
            onClose={closeModal}
            isOpen={chartFullscreenModalOpen}
            scrollBehavior="inside"
            isCentered
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
                <ModalHeader>{widget.name}</ModalHeader>
                <ModalCloseButton/>
                <ModalBody
                    ref={modalBodyRef}
                    minW="100%"
                    minH="100%"
                >
                    {
                        modalBodySize.width > 0 &&
                        modalBodySize.height > 0 &&
                        <MultiValueDataDisplay
                            {...props}
                            fullscreenDataDisplaySize={modalBodySize}
                            displayType="fullscreen"
                        />
                    }
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
