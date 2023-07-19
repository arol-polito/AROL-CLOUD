import {MapContainer, Marker, TileLayer, Tooltip, useMap} from 'react-leaflet'
import {Box} from "@chakra-ui/react";
import Machinery from "./Machinery";
import React, {useEffect, useState} from "react";
import {LatLngTuple} from "leaflet";

interface MapPanelProps {
    machineries: Map<string, Machinery[]>
    setMachineries: React.Dispatch<React.SetStateAction<Map<string, Machinery[]>>>
    navigator: Navigator
    setNavigator: React.Dispatch<React.SetStateAction<Navigator>>
}

interface Navigator {
    stage: number
    clusterLocation: string
    machineryUID: string
}

interface MapMarker {
    position: LatLngTuple,
    label: string
}

export default function MapPanel(props: MapPanelProps) {

    return(
        <Box w={"full"}>
            {/*<Heading w={"full"} textAlign={"right"} >HELLLLOOOOOOOOOOOOOOOOOOOOOOOOOOOO</Heading>*/}
            <MapContainer
                style={{ width: "100%", height: "500px"}}
                center={[44.729519, 8.296058]}
                zoom={13}
                scrollWheelZoom={false}
            >
                {/* Must be done like this or useMap will not work */}
                <MapRenderer {...props} />
            </MapContainer>
        </Box>
    )


}

function MapRenderer(props: MapPanelProps){

    const map = useMap()
    const [markers, setMarkers] = useState<MapMarker[]>([])

    //Update markers when machineries get updated
    //FitBounds of marker
    useEffect(() => {

        let markersArray: MapMarker[] = []

        if(props.navigator.stage===0) {
            Array.from(props.machineries.entries()).forEach((entry) => {

                let avgX = 0, avgY = 0
                entry[1].forEach((machinery) => {
                    avgX += machinery.geoLocation.x
                    avgY += machinery.geoLocation.y
                })

                markersArray.push({
                    position: [avgX / entry[1].length, avgY / entry[1].length],
                    label: entry[0]
                })

            })

            setMarkers(markersArray)
        }
        else if(props.navigator.stage===1){
            props.machineries.get(props.navigator.clusterLocation)!!.forEach((entry) => {

                markersArray.push({
                    position: [entry.geoLocation.x, entry.geoLocation.y],
                    label: entry.uid
                })

            })

            setMarkers(markersArray)
        }
        else if(props.navigator.stage===2){

            let machinery = props.machineries.get(props.navigator.clusterLocation)!!
                .find((el) => (el.uid === props.navigator.machineryUID))!!

            map.setView([machinery.geoLocation.x, machinery.geoLocation.y])

            setMarkers([{
                position: [machinery.geoLocation.x, machinery.geoLocation.y],
                label: machinery.uid
            }])
        }
        else{
            return
        }


        if (markersArray.length > 1) {
            map.flyToBounds(markersArray.map((el) => (el.position)), {padding: [100, 100], duration: 1.25})
        }



    }, [props.machineries, props.navigator])


    function handleMarkerClick(markerValue: string){
        if(props.navigator.stage===0){
            props.setNavigator((val)=>{
                val.stage=1
                val.clusterLocation = markerValue
                return {...val}
            })
        }
        else if(props.navigator.stage===1){
            props.setNavigator((val)=>{
                val.stage=2
                val.machineryUID = markerValue
                return {...val}
            })
        }
    }

    return (
        <>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
                markers.map((marker) => (
                    <Marker
                        key={marker.label}
                        position={marker.position}
                        eventHandlers={{
                            click: () => (handleMarkerClick(marker.label))
                        }}
                    >
                        <Tooltip permanent>
                            {marker.label}
                        </Tooltip>
                    </Marker>
                ))
            }
        </>
    )

}