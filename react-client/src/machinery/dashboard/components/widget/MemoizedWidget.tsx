import {DashboardWidgetProps, Widget} from "./Widget";
import React, {useMemo} from "react";

export const MemoizedWidget = (props: DashboardWidgetProps) => {

    const widget = useMemo(
        () => <Widget {...props} />,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.widget.numChange, props.dashboardSize.width, props.dashboardSize.rowHeight, props.layout.w, props.layout.h]
    )

    return (widget)
}