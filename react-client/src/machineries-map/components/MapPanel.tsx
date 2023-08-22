import {MapContainer, Marker, TileLayer, Tooltip, useMap} from 'react-leaflet'
import {Box} from '@chakra-ui/react'
import type Machinery from './Machinery'
import React, {useEffect, useState} from 'react'
import {type LatLngTuple} from 'leaflet'

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
    position: LatLngTuple
    label: string
}

export default function MapPanel(props: MapPanelProps) {
    return (
        <Box w="full">
            <MapContainer
                style={{width: '100%', height: '500px'}}
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

function MapRenderer(props: MapPanelProps) {

    const {machineries, navigator, setNavigator} = props;

    const map = useMap()
    const [markers, setMarkers] = useState<MapMarker[]>([])

    // Update markers when machineries get updated
    // FitBounds of marker
    useEffect(() => {
        const markersArray: MapMarker[] = []

        if (navigator.stage === 0) {
            Array.from(machineries.entries()).forEach((entry) => {
                let avgX = 0
                let avgY = 0
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
        } else if (navigator.stage === 1) {
            machineries.get(navigator.clusterLocation)?.forEach((entry) => {
                markersArray.push({
                    position: [entry.geoLocation.x, entry.geoLocation.y],
                    label: entry.uid
                })
            })

            setMarkers(markersArray)
        } else if (navigator.stage === 2) {
            const machinery = machineries.get(navigator.clusterLocation)
                ?.find((el) => (el.uid === navigator.machineryUID))

            if (!machinery) return;

            map.setView([machinery.geoLocation.x, machinery.geoLocation.y])

            setMarkers([{
                position: [machinery.geoLocation.x, machinery.geoLocation.y],
                label: machinery.uid
            }])
        } else
            return

        if (markersArray.length > 1)
            map.flyToBounds(markersArray.map((el) => (el.position)), {padding: [100, 100], duration: 1.25})
    }, [machineries, navigator, map])

    function handleMarkerClick(markerValue: string) {
        if (navigator.stage === 0)
            setNavigator((val) => {
                val.stage = 1
                val.clusterLocation = markerValue

                return {...val}
            })
        else if (navigator.stage === 1)
            setNavigator((val) => {
                val.stage = 2
                val.machineryUID = markerValue

                return {...val}
            })
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
                            click: () => {
                                handleMarkerClick(marker.label)
                            }
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
