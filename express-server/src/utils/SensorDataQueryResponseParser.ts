import {TimestreamQuery} from "aws-sdk";
import SensorDataFilter from "../interfaces/SensorDataFilter";

function parseQueryResult(response: TimestreamQuery.Types.QueryResponse, category: string, sensorFilter: SensorDataFilter[]) {

    const supportedTypes = ["plc", "ns", "eqtq"]

    category = category.toLowerCase()

    if (!supportedTypes.includes(category)) {
        throw "Unsupported sensor category - supported categories are: " + supportedTypes.join(",")
    }


    const queryStatus = response.QueryStatus;
    console.log("Current query status: " + JSON.stringify(queryStatus));

    const columnInfo = response.ColumnInfo;
    const rows = response.Rows;

    //console.log("Metadata: " + JSON.stringify(columnInfo));
    //console.log("Data: ");

    const requiredSensorsMap: Map<number, string[]> = new Map<number, string[]>()
    let plcColumns: string[] = []
    if (category === "plc") {
        requiredSensorsMap.set(0, sensorFilter[0].sensorNames.map(el => el.name))
        plcColumns = columnInfo.map((el: TimestreamQuery.ColumnInfo) => (el.Name!.toLowerCase()))
    } else if (category === "eqtq") {
        sensorFilter.forEach((sensorFilterEntry) => {
            requiredSensorsMap.set(sensorFilterEntry.headNumber, sensorFilterEntry.sensorNames.map(el => el.name))
        })
    } else if (category === "ns") {
        sensorFilter.forEach((sensorFilterEntry) => {
            requiredSensorsMap.set(sensorFilterEntry.headNumber, sensorFilterEntry.sensorNames.map(el => el.name))
        })
    }

    const sensorData: {
        name: string
        value: number
        time: number
    }[] = []
    rows.forEach((row) => {
        const parsedRow = parseRow(columnInfo, row)

        let requiredSensorsArray: string[] = []
        let rowHeadNumber = 0
        let sampleTime: number = 0
        if (category === "plc") {
            rowHeadNumber = 0
            requiredSensorsArray = requiredSensorsMap.get(0)!
            sampleTime = new Date(parsedRow.time).getTime()
        } else if (category === "eqtq") {
            rowHeadNumber = parseInt(parsedRow.iot_shadow.substring(10))
            requiredSensorsArray = requiredSensorsMap.get(rowHeadNumber)!
            sampleTime = new Date(parsedRow.Index_time).getTime()
        } else if (category === "ns") {
            rowHeadNumber = parseInt(parsedRow.iot_shadow.substring(7))
            requiredSensorsArray = requiredSensorsMap.get(rowHeadNumber)!
            sampleTime = new Date(parsedRow.IdNode_time).getTime()
        }

        requiredSensorsArray.forEach((requiredSensor) => {
            const requiredSensorValue = requiredSensor + "_value"
            if (parsedRow.hasOwnProperty(requiredSensorValue) && parsedRow[requiredSensorValue]) {

                let sensorNamePrefix = ""
                if (rowHeadNumber > 0) {
                    sensorNamePrefix = "H" + String(rowHeadNumber).padStart(2, "0") + "_"
                }

                sensorData.push({
                    name: sensorNamePrefix + requiredSensor,
                    time: sampleTime,
                    value: Number(parsedRow[requiredSensorValue])
                })
            }
        })

        //console.log(parsedRow)

        /*sensorData.push({
            name: parsedRow["measure_name"],
            value: parseFloat(parsedRow["measure_value"]),
            time: new Date(parsedRow["time"]).getTime()
        })*/
    });

    if (category === "plc") {
        return {
            parsedPlcColumns: plcColumns,
            parsedSensorData: sensorData
        }
    }
    return {
        parsedPlcColumns: [],
        parsedSensorData: sensorData
    }
}

function getQueryResultNumRows(response: TimestreamQuery.Types.QueryResponse): number {
    return response.Rows.length;
}

function parseRow(columnInfo: TimestreamQuery.ColumnInfoList, row: TimestreamQuery.Row): any {
    const data = row.Data;
    const rowOutput = [];

    let i;
    for (i = 0; i < data.length; i++) {
        const info = columnInfo[i];
        const datum = data[i];
        rowOutput.push(parseDatum(info, datum));
    }

    let rowObject = {}
    rowOutput.forEach((val) => {
        rowObject = {...rowObject, ...val}
    })

    return rowObject
}

function parseDatum(info: TimestreamQuery.ColumnInfo, datum: TimestreamQuery.Datum) {
    const datumObject: any = {}
    if (datum.NullValue) {
        datumObject[info.Name!] = null
        return datumObject
    }

    const columnType = info.Type;

    // If the column is of TimeSeries Type
    if (columnType.TimeSeriesMeasureValueColumnInfo != null) {
        return parseTimeSeries(info, datum);
    }
    // If the column is of Array Type
    else if (columnType.ArrayColumnInfo != null) {
        const arrayValues = datum.ArrayValue;
        datumObject[info.Name!] = parseArray(info.Type.ArrayColumnInfo!, arrayValues!)
        return datumObject;
    }
    // If the column is of Row Type
    else if (columnType.RowColumnInfo != null) {
        const rowColumnInfo = info.Type.RowColumnInfo;
        const rowValues = datum.RowValue;
        return parseRow(rowColumnInfo!, rowValues!);
    }
    // If the column is of Scalar Type
    else {
        return parseScalarType(info, datum);
    }
}

function parseTimeSeries(info: TimestreamQuery.ColumnInfo, datum: TimestreamQuery.Datum) {
    const timeSeriesOutput: any[] = [];
    datum.TimeSeriesValue!.forEach(function (dataPoint) {
        timeSeriesOutput.push({
            time: dataPoint.Time,
            value: parseDatum(info.Type.TimeSeriesMeasureValueColumnInfo!, dataPoint.Value)
        })
    });

    return timeSeriesOutput
}

function parseScalarType(info: TimestreamQuery.ColumnInfo, datum: TimestreamQuery.Datum) {
    const scalarObject: any = {}
    scalarObject[parseColumnName(info)] = datum.ScalarValue
    return scalarObject;
}

function parseColumnName(info: TimestreamQuery.ColumnInfo) {
    if (!info.Name) {
        throw "Invalid column name"
    }
    return info.Name;
}

function parseArray(arrayColumnInfo: TimestreamQuery.ColumnInfo, arrayValues: TimestreamQuery.DatumList) {
    const arrayOutput: any[] = [];
    arrayValues.forEach(function (datum) {
        arrayOutput.push(parseDatum(arrayColumnInfo, datum));
    });
    return arrayOutput
}

export default {
    parseQueryResult,
    getQueryResultNumRows
}