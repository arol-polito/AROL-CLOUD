import React from "react";
import {Box} from "@chakra-ui/react";
import RGL, {WidthProvider} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import DashboardSize from "../../interfaces/DashboardSize";

const ReactGridLayout = WidthProvider(RGL)

export interface UnderlayDashboardConfig {
    dashboardSize: DashboardSize
}

export const UnderlayDashboard = (props: UnderlayDashboardConfig) => {

    const {dashboardSize} = props;

    return (
        <ReactGridLayout
            width={~~dashboardSize.width}
            style={{
                height: `${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8}px`,
                maxHeight: `${dashboardSize.numRows * dashboardSize.rowHeight + (dashboardSize.numRows + 1) * 8}px`
            }}
            margin={[5, 5]}
            cols={dashboardSize.numCols}
            rowHeight={dashboardSize.rowHeight}
            autoSize={false}
            containerPadding={[0, 0]}
            useCSSTransforms
        >
            {
                Array(dashboardSize.numRows).fill(0).map((valRow, indexRow) => (
                    Array(dashboardSize.numCols).fill(0).map((valCol, indexCol) => (
                        <Box
                            key={`${indexRow}_${indexCol}`}
                            data-grid={{x: indexCol, y: indexRow, w: 1, h: 1, static: true}}
                            w="full"
                            h="full"
                            borderWidth={1}
                            borderColor="gray.300"
                            rounded="md"
                        />
                    ))
                ))
            }
        </ReactGridLayout>
    )

}