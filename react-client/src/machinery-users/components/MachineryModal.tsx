import Machinery from "../../machineries-map/components/Machinery";
import {
    Box,
    Divider,
    Flex,
    Heading,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react";
import React, {useEffect} from "react";
import {MapContainer, Marker, TileLayer, Tooltip, useMap} from "react-leaflet";
import {LatLngTuple} from "leaflet";

interface MachineryModalProps {
    machineryModalMachinery: Machinery | undefined
    setMachineryModalMachinery: React.Dispatch<React.SetStateAction<Machinery | undefined>>
}

export default function MachineryModal(props: MachineryModalProps) {

    function closeModal() {
        props.setMachineryModalMachinery(undefined)
    }

    return (
        <Modal isOpen={props.machineryModalMachinery !== undefined} onClose={closeModal} size={"xl"}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Machinery {props.machineryModalMachinery!!.uid}</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack
                        w={"full"}
                    >
                        <HStack
                            w={"full"}
                        >
                            <Flex>
                                <Box boxSize={"150px"}>
                                    <Image
                                        objectFit="cover"
                                        boxSize="100%"
                                        // src={require("/src/assets/machineries/"+ props.machinery.modelID + ".png")}
                                        src={require("./../../assets/machineries/" + props.machineryModalMachinery!!.modelID + ".png")}
                                    />
                                </Box>
                            </Flex>
                            <Divider orientation={"vertical"} h={"auto"}/>
                            <VStack w="full">
                                <HStack w="full">
                                    <Stack
                                        flexDirection="column"
                                        justifyContent="flex-start"
                                        alignItems="flex-start"
                                        flexWrap={"nowrap"}
                                        w={"max-content"}
                                        p={1}
                                    >
                                        <Heading
                                            fontSize={"md"}
                                            fontFamily={"body"}
                                            color={"gray.400"}
                                            whiteSpace={"nowrap"}
                                        >
                                            {props.machineryModalMachinery!!.uid}
                                        </Heading>
                                        <Heading
                                            fontSize={"2xl"}
                                            fontFamily={"body"}
                                            whiteSpace={"nowrap"}
                                            mb={"0!important"}
                                        >
                                            {props.machineryModalMachinery!!.modelName}
                                        </Heading>
                                        <Text
                                            fontWeight={300}
                                            color={"gray.400"}
                                            whiteSpace={"nowrap"}
                                            fontSize={"sm"}
                                        >
                                            Machinery type
                                        </Text>
                                        <Text
                                            // fontWeight={600}
                                            color={"black"}
                                            fontSize="md"
                                            whiteSpace={"nowrap"}
                                            mt={"0!important"}
                                            mb={4}
                                        >
                                            {props.machineryModalMachinery!!.modelType}
                                        </Text>
                                        <Text
                                            fontWeight={300}
                                            color={"gray.400"}
                                            whiteSpace={"nowrap"}
                                            fontSize={"sm"}
                                        >
                                            Number of heads
                                        </Text>
                                        <Text
                                            color={"black"}
                                            whiteSpace={"nowrap"}
                                            mt={"0!important"}
                                            mb={4}
                                        >
                                            {props.machineryModalMachinery!!.numHeads}
                                        </Text>
                                        <Text
                                            fontWeight={300}
                                            color={"gray.400"}
                                            whiteSpace={"nowrap"}
                                            fontSize={"sm"}
                                        >
                                            Machinery location
                                        </Text>
                                        <Text
                                            color={"black"}
                                            whiteSpace={"nowrap"}
                                            my={"0!important"}
                                        >
                                            {props.machineryModalMachinery!!.locationCluster}
                                        </Text>
                                    </Stack>
                                </HStack>
                            </VStack>
                        </HStack>
                        <Divider/>
                        <HStack
                            w={"full"}
                            h={"350px"}
                            pb={3}
                        >
                            <MapContainer
                                style={{width: "100%", height: "100%"}}
                                center={[44.729519, 8.296058]}
                                zoom={13}
                                scrollWheelZoom={false}
                            >
                                {/* Must be done like this or useMap will not work */}
                                <MapRenderer
                                    machinery={props.machineryModalMachinery!!}
                                />
                            </MapContainer>
                        </HStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )

}

interface MapRendererProps {
    machinery: Machinery
}

function MapRenderer(props: MapRendererProps) {

    const map = useMap()

    //Update markers when machineries get updated
    //FitBounds of marker
    useEffect(() => {

        let bounds: LatLngTuple = [props.machinery.geoLocation.x, props.machinery.geoLocation.y]

        map.flyToBounds([bounds], {padding: [100, 100], duration: 1.25})

    }, [props.machinery])

    return (
        <>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
                key={props.machinery.uid}
                position={[props.machinery.geoLocation.x, props.machinery.geoLocation.y]}
            >
                <Tooltip permanent>
                    {props.machinery.uid}
                </Tooltip>
            </Marker>
            ))
        </>
    )

}