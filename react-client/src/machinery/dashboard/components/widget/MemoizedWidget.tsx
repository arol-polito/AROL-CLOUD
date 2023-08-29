import {DashboardWidgetProps, Widget} from "./Widget";
import React, {useMemo} from "react";

export const MemoizedWidget = (props: DashboardWidgetProps) => {

    const {widget, dashboardSize, layout} = props;

    const memoizedWidgets = useMemo(
        () => <Widget {...props} />,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [widget.numChange, dashboardSize.width, dashboardSize.rowHeight, layout.w, layout.h]
    )

    return (memoizedWidgets)
}