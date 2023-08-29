import React, {useMemo} from "react";
import {CloseButton, Divider, HStack, IconButton, Text, VStack} from "@chakra-ui/react";
import {
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsRight,
    FiMaximize,
    FiZoomIn,
    FiZoomOut
} from "react-icons/fi";
import GridWidget from "../../../../../../interfaces/GridWidget";
import {DataDisplaySize} from "../../../../../../interfaces/DataDisplaySize";

interface ChartControlPanelProps {
    widget: GridWidget
    displayType: string
    loadMoreSensorData: () => void
    fullscreenDataDisplaySize: DataDisplaySize
    chartTooltipActive: boolean
    multiValueLogic: any
}

export const MemoizedChartControlPanel = (props: ChartControlPanelProps) => {

    const {
        widget,
        displayType,
        fullscreenDataDisplaySize,
        multiValueLogic
    } = props;

    const {chartProps, sensorData, sensorDataCacheLoading} = widget;
    const {chartNumChange, type, dataDisplaySize} = widget;

    const {handlePanChartButtonClicked, handleZoomChartButtonClicked, setChartFullscreenModalOpen} = multiValueLogic;
    const {setQuickNavigateModalOpen, closeNewDataPopup, navigateToNewData} = multiValueLogic;

    const displaySize = displayType === "fullscreen" ? fullscreenDataDisplaySize : dataDisplaySize;

    const chartControlPanel = useMemo(
        () => {
            if (!['line-chart', 'area-chart', 'bar-chart'].includes(type))
                return <></>

            return (
                <>
                    <HStack
                        w={displaySize.width - chartProps.yAxisProps.width - 45}
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
                            isDisabled={sensorData.leftData.length === 0}
                            isLoading={sensorData.leftData.length === 0 && sensorDataCacheLoading}
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
                                isDisabled={sensorData.displayData.length <= 5}
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
                                isDisabled={sensorData.leftData.length === 0 && sensorData.rightData.length === 0}
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
                                        isDisabled={sensorData.displayData.length <= 5}
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
                                        isDisabled={sensorData.displayData.length <= 5}
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
                            isDisabled={sensorData.rightData.length === 0}
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
                        w={displaySize.width - chartProps.yAxisProps.width - 70}
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
                            color="gray"
                        >
                            {(sensorData.displayData.length > 0) ? sensorData.displayData[0].formattedTime : ''}
                        </Text>
                        <Text
                            w="full"
                            textAlign="center"
                            fontSize="sm"
                            fontWeight={400}
                            color="gray"
                        >
                            {sensorData.numSamplesDisplaying} samples
                        </Text>
                        <Text
                            w="full"
                            textAlign="right"
                            fontSize="sm"
                            fontWeight={400}
                            color="gray"
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
                            top={`${displaySize.height / 2}px`}
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
            )
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [chartNumChange, sensorDataCacheLoading, type]
    )

    return (chartControlPanel);
}