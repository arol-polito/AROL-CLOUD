import type GridWidget from '../../../../../interfaces/GridWidget'
import React from 'react'
import type TooltipData from '../../../../../interfaces/TooltipData'
import {Box} from '@chakra-ui/react'
import ChartFullscreenModal from '../../modals/ChartFullscreenModal'
import type Sensor from '../../../../../models/Sensor'
import QuickNavigateModal from '../../modals/QuickNavigateModal'
import {useMultiValueDataDisplayLogic} from "./useMultiValueDataDisplayLogic";
import Dashboard from "../../../../../models/Dashboard";
import {MemoizedChart} from "./components/MemoizedChart";
import {MemoizedChartControlPanel} from "./components/MemoizedChartControlPanel";
import {DataDisplaySize} from "../../../../../interfaces/DataDisplaySize";

export interface MultiValueDataDisplayProps {
    widget: GridWidget
    widgetIndex: number
    setDashboard: React.Dispatch<React.SetStateAction<Dashboard>>
    displayType: string
    availableSensors: Sensor[]
    loadMoreSensorData: () => void
    fullscreenDataDisplaySize: DataDisplaySize
    chartTooltipActive: boolean
    setChartTooltip: React.Dispatch<React.SetStateAction<TooltipData>>
}

export function MultiValueDataDisplay(props: MultiValueDataDisplayProps) {

    const {widget, availableSensors, loadMoreSensorData} = props;
    const {widgetIndex, setDashboard, setChartTooltip} = props;
    const {chartTooltipActive, displayType, fullscreenDataDisplaySize} = props;

    const multiValueLogic = useMultiValueDataDisplayLogic(props);

    const {chartContainerRef, quickNavigateChart} = multiValueLogic;
    const {chartFullscreenModalOpen, setChartFullscreenModalOpen, quickNavigateModalOpen} = multiValueLogic;
    const {setQuickNavigateModalOpen} = multiValueLogic;

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
                <MemoizedChart {...props} multiValueLogic={multiValueLogic}/>
                <MemoizedChartControlPanel {...props} multiValueLogic={multiValueLogic}/>
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
                    fullscreenDataDisplaySize={fullscreenDataDisplaySize}
                    availableSensors={availableSensors}
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
                    loadMoreSensorData={loadMoreSensorData}
                    quickNavigateChart={quickNavigateChart}
                />
            }
        </>
    )
}
